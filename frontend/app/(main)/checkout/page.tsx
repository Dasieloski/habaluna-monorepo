'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth-store';
import { useCartStore } from '@/lib/store/cart-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatPrice } from '@/lib/utils';
import { SupernovaWidget } from '@/components/payment/supernova-widget';
import { isCatalogMode } from '@/lib/catalog-mode';
import { useCartValidation } from '@/hooks/use-cart-validation';
import { AlertTriangle, Tag, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FormError } from '@/components/ui/form-error';
import { COUNTRIES, getMunicipalitiesByCountry } from '@/lib/geo/countries';

const checkoutSchema = z.object({
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellidos requeridos'),
  address: z.string().min(1, 'Dirección requerida'),
  municipality: z.string().min(1, 'Municipio requerido'),
  city: z.string().min(1, 'Ciudad requerida'),
  country: z.string().min(1, 'País requerido'),
  phone: z.string().min(1, 'Teléfono requerido'),
  reference: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [shippingData, setShippingData] = useState<CheckoutForm | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ id: string; code: string; discount: number; name: string } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [transportEstimate, setTransportEstimate] = useState<{ shipping: number } | null>(null);
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const isBootstrapped = useAuthStore((s) => s.isBootstrapped)
  const { items, subtotal, clearCart, fetchCart } = useCartStore();
  const { validation, validateCart, isValid, hasIssues, loading: validationLoading } = useCartValidation();
  const { showSuccess, showError } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      city: 'La Habana',
      country: 'Cuba',
    },
  });

  const selectedCountry = watch('country') || 'Cuba';
  const municipalities = getMunicipalitiesByCountry(selectedCountry);

  useEffect(() => {
    // En modo catálogo, redirigir a productos
    if (isCatalogMode()) {
      router.push('/products');
      return;
    }

    // Esperar a que la sesión se bootstrapee (refresh cookie) antes de redirigir
    if (!isBootstrapped) return;

    if (!isAuthenticated()) {
      router.push('/auth/login?returnUrl=' + encodeURIComponent('/checkout'));
      return;
    }

    if (items.length === 0) {
      router.push('/cart');
      return;
    }

    // Validar el carrito al entrar al checkout
    validateCart();
  }, [isAuthenticated, isBootstrapped, items, router, validateCart]);

  // Redirigir si hay problemas de stock
  useEffect(() => {
    if (validation && hasIssues) {
      // Mostrar error pero no redirigir automáticamente para que el usuario vea qué está mal
      setError('Algunos productos tienen poco stock. Revisa tu carrito y ajusta cantidades 👀');
    }
  }, [validation, hasIssues]);

  const onSubmit = async (data: CheckoutForm) => {
    setLoading(true);
    setError('');

    try {
      // Validar el carrito antes de proceder
      await validateCart();
      
      // Si hay problemas de stock, no permitir continuar
      if (hasIssues) {
        setError('Hay problemas con el stock de algunos productos. Por favor, actualiza tu carrito y vuelve a intentar.');
        setLoading(false);
        return;
      }

      // Crear la orden primero (sin procesar el pago aún)
      // Nota: el backend acepta objetos libres en shippingAddress; mantenemos zipCode vacío por compatibilidad.
      const addressForApi = { ...data, zipCode: '' } as any;
      const orderData = {
        shippingAddress: addressForApi,
        billingAddress: addressForApi,
        offerId: appliedCoupon?.id, // ID del cupón aplicado
        // No incluimos paymentIntentId todavía, se agregará después del pago exitoso
      };

      const response = await api.post('/orders', orderData);
      setOrderId(response.data.id);
      setShippingData(data);
      setShowPayment(true);
      showSuccess(
        '¡Orden lista! ✅',
        'Todo en orden. Ahora solo falta el pago.'
      );
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al crear el pedido';
      setError(errorMessage);
      showError('Ups… no pudimos crear la orden 😅', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (data: { transactionId: string; amount: string; currency: string }) => {
    try {
      // Actualizar la orden con el transactionId del pago
      if (orderId) {
        // Actualizar el paymentIntentId y el estado de la orden
        await api.patch(`/orders/${orderId}`, {
          paymentIntentId: data.transactionId,
        });
      }
      
      clearCart();
      showSuccess(
        '¡Pago recibido! 🎉',
        'Gracias por tu compra. Tu pedido está en camino.'
      );
      router.push(`/checkout/success?order=${orderId}`);
    } catch (err: any) {
      console.error('Error al actualizar la orden:', err);
      // Aún así redirigir, el pago ya fue exitoso
      clearCart();
      showSuccess(
        '¡Pago recibido! 🎉',
        'Gracias por tu compra. Tu pedido está en camino.'
      );
      router.push(`/checkout/success?order=${orderId}`);
    }
  };

  const handlePaymentError = (error: { error: string }) => {
    setError(`El pago no se completó: ${error.error}. Revisa los datos o intenta de nuevo.`);
    setShowPayment(false);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Ingresa un código de cupón');
      return;
    }

    setValidatingCoupon(true);
    setCouponError('');

    try {
      const result = await api.validateOffer(couponCode.trim(), subtotal);
      
      if (result.valid && result.offer) {
        setAppliedCoupon({
          id: result.offer.id,
          code: result.offer.code,
          discount: result.discount,
          name: result.offer.name,
        });
        setCouponCode('');
        showSuccess('¡Cupón aplicado! 🎟️', `Te descontamos ${formatPrice(result.discount)}`);
      } else {
        setCouponError(result.message || 'Ese cupón no aplica');
        showError('Ese cupón no cuadra 😅', result.message || 'Revisa el código o la vigencia.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'No pudimos validar el cupón';
      setCouponError(errorMessage);
      showError('Ups… el cupón no pasó', errorMessage);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  useEffect(() => {
    if (items.length === 0) {
      setTransportEstimate(null);
      return;
    }
    let cancelled = false;
    api.getTransportEstimate(itemCount, subtotal).then((r) => {
      if (!cancelled) setTransportEstimate({ shipping: r.shipping });
    }).catch(() => { if (!cancelled) setTransportEstimate(null); });
    return () => { cancelled = true; };
  }, [itemCount, items.length, subtotal]);

  const subtotalWithDiscount = subtotal - (appliedCoupon?.discount || 0);
  const shipping = transportEstimate?.shipping ?? 0;
  const total = subtotalWithDiscount + shipping;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-4xl font-bold mb-4 text-center leading-tight">Finalizar compra</h1>

      {/* Stepper */}
      <div className="flex justify-center gap-4 mb-8" aria-label="Progreso">
        <div className="flex items-center gap-2">
          <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${!showPayment ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'}`}>1</span>
          <span className={!showPayment ? 'font-medium' : 'text-muted-foreground'}>Envío</span>
        </div>
        <div className="h-px w-8 bg-border self-center" />
        <div className="flex items-center gap-2">
          <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${showPayment ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>2</span>
          <span className={showPayment ? 'font-medium' : 'text-muted-foreground'}>Pago</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="lg:col-span-2">
          {!showPayment ? (
            <Card>
              <CardHeader>
                <CardTitle>Información de Envío</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                {loading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-[1px]" aria-live="polite">
                    <span className="text-sm font-medium text-muted-foreground">Creando pedido...</span>
                  </div>
                )}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Alertas de validación de stock */}
                  {validation && hasIssues && (
                    <div className="bg-destructive/10 border border-destructive rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-destructive mb-2">Problemas de disponibilidad</h3>
                          <ul className="space-y-1 text-sm text-foreground">
                            {validation.items
                              .filter((item) => item.issue !== null)
                              .map((item) => {
                                const variantText = item.variantName ? ` (${item.variantName})` : '';
                                let message = '';
                                switch (item.issue) {
                                  case 'out_of_stock':
                                    message = `"${item.productName}${variantText}" ya no está disponible`;
                                    break;
                                  case 'insufficient_stock':
                                    message = `Solo ${item.availableStock} disponible${item.availableStock > 1 ? 's' : ''} de "${item.productName}${variantText}"`;
                                    break;
                                  case 'unavailable':
                                    message = `"${item.productName}${variantText}" ya no está disponible`;
                                    break;
                                }
                                return message ? (
                                  <li key={item.itemId} className="flex items-start gap-2">
                                    <span className="text-red-600 mt-1">•</span>
                                    <span>{message}</span>
                                  </li>
                                ) : null;
                              })}
                          </ul>
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-3"
                            onClick={() => router.push('/cart')}
                          >
                            Ir al carrito
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {error && <FormError message={error} />}

                  {/* Contacto */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground border-b pb-2">Contacto</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nombre</Label>
                        <Input id="firstName" {...register('firstName')} />
                        {errors.firstName && (
                          <FormError message={errors.firstName.message} />
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Apellidos</Label>
                        <Input id="lastName" {...register('lastName')} />
                        {errors.lastName && (
                          <FormError message={errors.lastName.message} />
                        )}
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="phone">Teléfono *</Label>
                        <Input 
                          id="phone" 
                          {...register('phone')} 
                          placeholder="Ej: +53 5XXXXXXXX"
                        />
                        {errors.phone && (
                          <FormError message={errors.phone.message} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dirección */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground border-b pb-2">Dirección</h3>
                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección completa *</Label>
                      <Input 
                        id="address" 
                        {...register('address')} 
                        placeholder="Calle, número, entre calles"
                      />
                      {errors.address && (
                        <FormError message={errors.address.message} />
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country">País *</Label>
                        <Select
                          value={selectedCountry}
                          onValueChange={(value) => {
                            const prev = selectedCountry;
                            setValue('country', value, { shouldValidate: true });
                            if (value !== prev) {
                              setValue('municipality', '', { shouldValidate: true });
                              if (value === 'Cuba') setValue('city', 'La Habana', { shouldValidate: true });
                              else setValue('city', '', { shouldValidate: true });
                            }
                          }}
                        >
                          <SelectTrigger id="country">
                            <SelectValue placeholder="Selecciona un país" />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRIES.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.country && <FormError message={errors.country.message} />}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="municipality">Municipio *</Label>
                        <Select
                          value={watch('municipality') || ''}
                          onValueChange={(value) => setValue('municipality', value, { shouldValidate: true })}
                        >
                          <SelectTrigger id="municipality">
                            <SelectValue placeholder="Selecciona un municipio" />
                          </SelectTrigger>
                          <SelectContent>
                            {municipalities.map((m) => (
                              <SelectItem key={m} value={m}>
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.municipality && (
                          <FormError message={errors.municipality.message} />
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">Ciudad *</Label>
                        <Input 
                          id="city" 
                          {...register('city')} 
                          placeholder="Ciudad / Provincia"
                        />
                        {errors.city && (
                          <FormError message={errors.city.message} />
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reference">Referencia (opcional)</Label>
                        <Input 
                          id="reference" 
                          {...register('reference')} 
                          placeholder="Puntos de referencia para la entrega"
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg" 
                    disabled={loading || validationLoading || Boolean(validation && hasIssues)}
                  >
                    {loading ? 'Creando pedido...' : validationLoading ? 'Validando...' : (validation && hasIssues) ? 'Resuelve los problemas de stock' : 'Continuar al Pago'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Completa tu Pago</CardTitle>
              </CardHeader>
              <CardContent>
                {error && <FormError message={error} className="mb-4" />}
                {orderId && (
                  <SupernovaWidget
                    amount={total.toFixed(2)}
                    currency="USD"
                    orderId={orderId}
                    description={`Pedido ${orderId}`}
                    customerEmail={user?.email}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 bg-muted/80 border-border">
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Sección de cupón */}
              <div className="mb-6 pb-4 border-b">
                {!appliedCoupon ? (
                  <div className="space-y-2">
                    <Label htmlFor="coupon" className="text-sm font-medium flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Código de cupón
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="coupon"
                        placeholder="Ingresa tu código"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError('');
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyCoupon();
                          }
                        }}
                        disabled={validatingCoupon}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon || !couponCode.trim()}
                        size="sm"
                      >
                        {validatingCoupon ? '...' : 'Aplicar'}
                      </Button>
                    </div>
                    {couponError && (
                      <FormError message={couponError} />
                    )}
                  </div>
                ) : (
<div className="bg-accent/10 border border-accent rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Cupón aplicado: {appliedCoupon.code}
                          </p>
                          <p className="text-xs text-muted-foreground">
                          {appliedCoupon.name} - Descuento: {formatPrice(appliedCoupon.discount)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm gap-2">
                    <div className="min-w-0">
                      <span>
                        {item.product.name}
                        {item.productVariant && ` - ${item.productVariant.name}`} x {item.quantity}
                      </span>
                      {(item.product as { adultsOnly?: boolean }).adultsOnly && (
                        <p className="text-xs text-muted-foreground mt-0.5">Requiere entrega solo a mayores de 18 años.</p>
                      )}
                    </div>
                    <span className="shrink-0">
                      {formatPrice(
                        item.productVariant?.priceUSD || item.product.priceUSD,
                        item.productVariant?.priceMNs || item.product.priceMNs
                      )}
                      {item.quantity > 1 && ` x ${item.quantity}`}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-accent">
                    <span>Descuento ({appliedCoupon.code})</span>
                    <span>-{formatPrice(appliedCoupon.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Subtotal con descuento</span>
                  <span>{formatPrice(subtotalWithDiscount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
                <span aria-hidden>🔒</span> Pago 100% seguro
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

