'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { AddToCartButton } from '@/components/product/add-to-cart-button';
import { ProductVariants } from '@/components/product/product-variants';
import { ProductImageGallery } from '@/components/product/product-image-gallery';

interface ProductClientProps {
  product: any;
}

export function ProductClient({ product }: ProductClientProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    product.variants && product.variants.length > 0 ? product.variants[0].id : undefined
  );

  const selectedVariant = product.variants?.find((v: any) => v.id === selectedVariantId);

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <ProductImageGallery images={product.images || []} productName={product.name} />
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <div className="flex items-center gap-4 mb-6">
            <div>
              <p className="text-3xl font-bold text-primary">
                {formatPrice(
                  selectedVariant?.priceUSD || product.priceUSD,
                  selectedVariant?.priceMNs || product.priceMNs
                )}
              </p>
              {(selectedVariant?.comparePriceUSD || selectedVariant?.comparePriceMNs || product.comparePriceUSD || product.comparePriceMNs) && (
                <p className="text-xl text-gray-400 line-through">
                  {formatPrice(
                    selectedVariant?.comparePriceUSD || product.comparePriceUSD,
                    selectedVariant?.comparePriceMNs || product.comparePriceMNs
                  )}
                </p>
              )}
            </div>
          </div>

          <p className="text-lg mb-6">{product.description}</p>

          {product.allergens && product.allergens.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Alérgenos:</h3>
              <p className="text-sm text-gray-600">{product.allergens.join(', ')}</p>
            </div>
          )}

          {/* Variantes del producto */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <ProductVariants
                variants={product.variants}
                selectedVariantId={selectedVariantId}
                onSelectVariant={setSelectedVariantId}
                basePrice={product.price}
                baseComparePrice={product.comparePrice}
              />
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">
              Stock disponible: {selectedVariant 
                ? selectedVariant.stock 
                : product.stock} unidades
            </p>
          </div>

          <AddToCartButton 
            productId={product.id} 
            productName={product.name}
            productVariantId={selectedVariantId}
            variantName={selectedVariant?.name}
          />
        </div>
      </div>
    </div>
  );
}

