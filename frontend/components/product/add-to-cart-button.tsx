'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth-store';
import { useCartStore } from '@/lib/store/cart-store';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { isCatalogMode } from '@/lib/catalog-mode';

interface AddToCartButtonProps {
  productId: string;
  productName?: string;
  productVariantId?: string;
  variantName?: string;
}

export function AddToCartButton({ 
  productId, 
  productName = 'Producto',
  productVariantId,
  variantName,
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { toast } = useToast();
  const router = useRouter();

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    try {
      await api.post('/cart', {
        productId,
        productVariantId: productVariantId || undefined,
        quantity: 1,
      });
      
      // Actualizar el carrito en el store
      await fetchCart();
      
      // Mostrar notificación de éxito
      const displayName = variantName 
        ? `${productName} - ${variantName}` 
        : productName;
      
      toast({
        variant: 'success',
        title: '¡Producto añadido!',
        description: `${displayName} se ha añadido al carrito correctamente.`,
      });
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo añadir el producto al carrito',
      });
    } finally {
      setLoading(false);
    }
  };

  // En modo catálogo, no mostrar el botón
  if (isCatalogMode()) {
    return null;
  }

  return (
    <Button onClick={handleAddToCart} disabled={loading} size="lg" className="w-full">
      {loading ? (
        'Añadiendo...'
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Añadir al Carrito
        </>
      )}
    </Button>
  );
}

