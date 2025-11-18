'use client';

import { formatPrice } from '@/lib/utils';
import { useCurrencyStore } from '@/lib/store/currency-store';

interface PriceDisplayProps {
  price: number | string;
  comparePrice?: number | string;
  showSecondary?: boolean;
  className?: string;
  compareClassName?: string;
}

export function PriceDisplay({ 
  price, 
  comparePrice, 
  showSecondary = true,
  className = '',
  compareClassName = '',
}: PriceDisplayProps) {
  const { secondaryCurrency } = useCurrencyStore();
  
  return (
    <div>
      <span className={className}>
        {formatPrice(price, undefined, showSecondary && !!secondaryCurrency)}
      </span>
      {comparePrice && (
        <span className={compareClassName}>
          {formatPrice(comparePrice, undefined, showSecondary && !!secondaryCurrency)}
        </span>
      )}
    </div>
  );
}

