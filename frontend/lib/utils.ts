import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { toNumber } from '@/lib/money'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea importes USD para UI.
 */
export function formatPrice(priceUSD?: number | string | null): string {
  const n = toNumber(priceUSD) ?? 0

  return `$${n.toFixed(2)}`
}
