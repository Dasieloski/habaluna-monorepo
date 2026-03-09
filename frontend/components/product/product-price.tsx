import { toNumber } from "@/lib/money"

interface ProductPriceProps {
  priceUSD?: number
  comparePriceUSD?: number
  variant?: "default" | "large"
}

export function ProductPrice({ priceUSD, comparePriceUSD, variant = "default" }: ProductPriceProps) {
  const price = toNumber(priceUSD) ?? 0
  const compare = toNumber(comparePriceUSD)
  const hasDiscount = compare !== null && compare > price

  if (variant === "large") {
    return (
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold text-primary">${price.toFixed(2)}</span>
        {hasDiscount && (
          <span className="text-lg text-foreground dark:text-highlight line-through">${compare!.toFixed(2)}</span>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-base font-bold text-primary">${price.toFixed(2)}</span>
      {hasDiscount && (
        <span className="text-sm text-foreground dark:text-highlight line-through">${compare!.toFixed(2)}</span>
      )}
    </div>
  )
}
