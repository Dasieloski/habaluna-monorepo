'use client';

import { formatPrice } from '@/lib/utils';
import { isCatalogMode } from '@/lib/catalog-mode';

interface ProductPriceProps {
  priceUSD?: number | string | null;
  priceMNs?: number | string | null;
  comparePriceUSD?: number | string | null;
  comparePriceMNs?: number | string | null;
  variant?: 'default' | 'large';
  className?: string;
}

export function ProductPrice({
  priceUSD,
  priceMNs,
  comparePriceUSD,
  comparePriceMNs,
  variant = 'default',
  className = '',
}: ProductPriceProps) {
  // En modo catálogo, no mostrar precios
  if (isCatalogMode()) {
    return null;
  }

  const priceClass = variant === 'large' ? 'text-2xl' : 'text-xl';
  const compareClass = variant === 'large' ? 'text-sm' : 'text-sm';

  return (
    <div className={className}>
      <p className={`${priceClass} font-bold text-primary`}>
        {formatPrice(priceUSD, priceMNs)}
      </p>
      {(comparePriceUSD || comparePriceMNs) && (
        <p className={`${compareClass} text-gray-400 line-through`}>
          {formatPrice(comparePriceUSD, comparePriceMNs)}
        </p>
      )}
    </div>
  );
}

