'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth-store';
import { useCartStore } from '@/lib/store/cart-store';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { getFirstImage } from '@/lib/image-utils';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { isCatalogMode } from '@/lib/catalog-mode';

export default function CartPage() {
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();
  const { items, subtotal, total, setCart, clearCart } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    // En modo catálogo, redirigir a productos
    if (isCatalogMode()) {
      router.push('/products');
      return;
    }

    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    const fetchCart = async () => {
      try {
        const response = await api.get('/cart');
        setCart(response.data.items, response.data.subtotal, response.data.total);
      } catch (error) {
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [isAuthenticated, router, setCart]);

  const handleRemoveItem = async (itemId: string) => {
    try {
      await api.delete(`/cart/${itemId}`);
      const response = await api.get('/cart');
      setCart(response.data.items, response.data.subtotal, response.data.total);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await api.patch(`/cart/${itemId}`, { quantity });
      const response = await api.get('/cart');
      setCart(response.data.items, response.data.subtotal, response.data.total);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  if (loading) {
    return (
      <div className="container py-12">
        <p>Cargando carrito...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-12 text-center">
        <ShoppingBag className="h-24 w-24 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Tu carrito está vacío</h2>
        <Link href="/products">
          <Button>Explorar Productos</Button>
        </Link>
      </div>
    );
  }

  const tax = subtotal * 0.21;
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const finalTotal = subtotal + tax + shipping;

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">Carrito de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-6 flex gap-6">
              <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                {getFirstImage(item.product.images) ? (
                  <img
                    src={getFirstImage(item.product.images)!}
                    alt={item.product.name}
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    Sin imagen
                  </div>
                )}
              </div>

              <div className="flex-1">
                <Link href={`/products/${item.product.slug}`}>
                  <h3 className="text-lg font-semibold hover:text-primary mb-2">
                    {item.product.name}
                  </h3>
                </Link>
                <p className="text-primary font-bold mb-4">
                  {formatPrice(
                    item.productVariant?.priceUSD || item.product.priceUSD,
                    item.productVariant?.priceMNs || item.product.priceMNs
                  )}
                </p>
                {item.productVariant && (
                  <p className="text-sm text-gray-500 mb-2">
                    Variante: {item.productVariant.name}
                  </p>
                )}

                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <span className="px-4">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Resumen del Pedido</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (21%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-600">Gratis</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>
            </div>

            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {subtotal < 50 && (
              <p className="text-sm text-gray-600 mb-4">
                Añade {formatPrice(50 - subtotal)} más para envío gratis
              </p>
            )}

            <Link href="/checkout" className="block">
              <Button className="w-full" size="lg">
                Proceder al Pago
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

