'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Package, Home, ShoppingBag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/auth-store';

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, isBootstrapped } = useAuthStore();

  useEffect(() => {
    if (!isBootstrapped) return;
    
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    if (!orderId) {
      router.push('/profile');
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data);
      } catch (error: any) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router, isAuthenticated, isBootstrapped]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando confirmación...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">No se pudo cargar la información del pedido.</p>
            <Button asChild>
              <Link href="/profile">Ir a mi perfil</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Success Icon & Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 mb-4 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {order.paymentStatus === 'PAID' ? '¡Pago recibido! 🎉' : 'Estamos revisando tu pago'}
          </h1>
          <p className="text-lg text-muted-foreground">
            {order.paymentStatus === 'PAID'
              ? 'Gracias por tu compra. Tu pedido está en camino.'
              : 'Hemos recibido tu pedido y estamos esperando la confirmación final del pago. Te avisaremos en cuanto se procese.'}
          </p>
        </div>

        {/* Order Details Card */}
        <Card className="mb-6 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Detalles del pedido
            </CardTitle>
            <CardDescription>
              Número de pedido: <span className="font-mono font-semibold">{order.id}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total</p>
                <p className="text-2xl font-bold text-primary">
                  {formatPrice(Number(order.grandTotal ?? order.total) || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Estado</p>
                <p className="text-lg font-semibold text-foreground">
                  {order.status === 'PENDING' ? 'Pendiente' : 
                   order.status === 'PROCESSING' ? 'Procesando' :
                   order.status === 'SHIPPED' ? 'Enviado' :
                   order.status === 'DELIVERED' ? 'Entregado' : order.status}
                </p>
              </div>
            </div>

            {order.shippingAddress && (
              <div className="pt-4 border-t">
                <p className="text-sm font-semibold text-foreground mb-2">Dirección de envío</p>
                <p className="text-sm text-muted-foreground">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  <br />
                  {order.shippingAddress.address}
                  <br />
                  {order.shippingAddress.municipality && (
                    <>
                      {order.shippingAddress.municipality}
                      <br />
                    </>
                  )}
                  {order.shippingAddress.city}
                  {order.shippingAddress.zipCode && `, ${order.shippingAddress.zipCode}`}
                  <br />
                  {order.shippingAddress.country}
                </p>
              </div>
            )}

            {order.items && order.items.length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm font-semibold text-foreground mb-3">Productos</p>
                <div className="space-y-2">
                  {order.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.quantity}x {item.product?.name || 'Producto'}
                      </span>
                      <span className="font-semibold text-foreground">
                        {formatPrice(Number(item.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/profile">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Ver mis pedidos
            </Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/products">
              <Home className="w-4 h-4 mr-2" />
              Seguir comprando
            </Link>
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Recibirás un correo de confirmación con los detalles de tu pedido.
            <br />
            Si tienes alguna pregunta, puedes contactarnos desde tu perfil.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Cargando confirmación...</p>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
