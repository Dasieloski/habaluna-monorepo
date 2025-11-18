import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function formatPriceWithCurrency(price: number, currency: 'USD' | 'MNs'): string {
  if (currency === 'MNs') {
    // Para MNs, usar formato sin símbolo de moneda estándar
    return new Intl.NumberFormat('es-ES', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price) + ' MNs';
  }
  
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export function formatPrice(
  priceUSD?: number | string | null,
  priceMNs?: number | string | null,
): string {
  // Si solo se pasa un número (para órdenes que ya están en USD)
  if (priceMNs === undefined && typeof priceUSD === 'number') {
    return formatPriceWithCurrency(priceUSD, 'USD');
  }
  
  const hasUSD = priceUSD !== null && priceUSD !== undefined && priceUSD !== '';
  const hasMNs = priceMNs !== null && priceMNs !== undefined && priceMNs !== '';
  
  if (!hasUSD && !hasMNs) {
    return formatPriceWithCurrency(0, 'USD');
  }
  
  if (hasUSD && hasMNs) {
    // Mostrar ambos precios: USD / MNs
    const usd = typeof priceUSD === 'string' ? parseFloat(priceUSD) : priceUSD;
    const mns = typeof priceMNs === 'string' ? parseFloat(priceMNs) : priceMNs;
    const usdFormatted = formatPriceWithCurrency(usd, 'USD');
    const mnsFormatted = formatPriceWithCurrency(mns, 'MNs');
    return `${usdFormatted} / ${mnsFormatted}`;
  }
  
  // Mostrar solo uno
  if (hasUSD) {
    const usd = typeof priceUSD === 'string' ? parseFloat(priceUSD) : priceUSD;
    return formatPriceWithCurrency(usd, 'USD');
  }
  
  const mns = typeof priceMNs === 'string' ? parseFloat(priceMNs) : priceMNs;
  return formatPriceWithCurrency(mns, 'MNs');
}

