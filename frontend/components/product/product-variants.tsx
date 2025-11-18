'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ProductVariant {
  id: string;
  name: string;
  price: number | string;
  comparePrice?: number | string;
  stock: number;
  weight?: number | string;
  unit?: string;
  isActive: boolean;
}

interface ProductVariantsProps {
  variants: ProductVariant[];
  selectedVariantId?: string;
  onSelectVariant: (variantId: string) => void;
  basePrice?: number | string;
  baseComparePrice?: number | string;
}

export function ProductVariants({
  variants,
  selectedVariantId,
  onSelectVariant,
  basePrice,
  baseComparePrice,
}: ProductVariantsProps) {

  // Si no hay variantes, no mostrar nada
  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Opciones disponibles:</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {variants.map((variant) => {
          const isSelected = selectedVariantId === variant.id;

          return (
            <button
              key={variant.id}
              onClick={() => onSelectVariant(variant.id)}
              disabled={!variant.isActive || variant.stock === 0}
              className={cn(
                'p-4 border-2 rounded-lg text-left transition-all',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-primary/50',
                (!variant.isActive || variant.stock === 0) && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-sm mb-1">{variant.name}</div>
                  {variant.weight && variant.unit && (
                    <div className="text-xs text-gray-500 mb-2">
                      {variant.weight} {variant.unit}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(variant.priceUSD, variant.priceMNs)}
                    </span>
                    {(variant.comparePriceUSD || variant.comparePriceMNs) && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(variant.comparePriceUSD, variant.comparePriceMNs)}
                      </span>
                    )}
                  </div>
                  {variant.stock > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Stock: {variant.stock}
                    </div>
                  )}
                  {variant.stock === 0 && (
                    <div className="text-xs text-red-500 mt-1">Agotado</div>
                  )}
                </div>
                {isSelected && (
                  <div className="ml-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

