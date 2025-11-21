'use client';

import { formatPrice } from '@/lib/utils';

interface PriceDisplayProps {
  priceUSD?: number | string | null;
  priceMNs?: number | string | null;
  comparePriceUSD?: number | string | null;
  comparePriceMNs?: number | string | null;
  className?: string;
  compareClassName?: string;
}

export function PriceDisplay({ 
  priceUSD, 
  priceMNs,
  comparePriceUSD,
  comparePriceMNs,
  className = '',
  compareClassName = '',
}: PriceDisplayProps) {
  return (
    <div>
      <span className={className}>
        {formatPrice(priceUSD, priceMNs)}
      </span>
      {comparePriceUSD || comparePriceMNs ? (
        <span className={compareClassName}>
          {formatPrice(comparePriceUSD, comparePriceMNs)}
        </span>
      ) : null}
    </div>
  );
}
