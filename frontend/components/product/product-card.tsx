"use client"

import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { HeartIcon } from "@/components/icons/streamline-icons"
import { Star } from "lucide-react"
import { toNumber } from "@/lib/money"
import { useCartStore } from "@/lib/store/cart-store"
import { useToast } from "@/hooks/use-toast"
import { getTriggerRect } from "@/lib/contextual-toast-utils"
import { useAuthStore } from "@/lib/store/auth-store"
import { useWishlistStore } from "@/lib/store/wishlist-store"
import { SmartImage } from "@/components/ui/smart-image"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { getImageUrl } from "@/lib/image-utils"

interface ProductCardProps {
  product: {
    id: string
    slug: string
    name: string
    images?: string[]
    priceUSD?: number
    priceMNs?: number
    comparePriceUSD?: number
    comparePriceMNs?: number
    averageRating?: number | string | null
    reviewCount?: number
    adultsOnly?: boolean
    variants?: Array<{
      id?: string
      name?: string
      priceUSD?: number
      priceMNs?: number
      comparePriceUSD?: number
      comparePriceMNs?: number
    }>
  }
  badge?: string
  badgeColor?: "coral" | "blue" | "mint"
  /** Solo para las primeras imágenes above the fold (LCP). */
  priority?: boolean
}

export function ProductCard({ product, badge, badgeColor = "coral", priority }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [addedFeedback, setAddedFeedback] = useState(false)
  const [showAdultsModal, setShowAdultsModal] = useState(false)
  const { toast, showAddToCart } = useToast()
  const addToCart = useCartStore((s) => s.addToCart)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const toggleWishlist = useWishlistStore((s) => s.toggle)
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id))
  const prefersReducedMotion = useReducedMotion()

  const price = toNumber(product.variants?.[0]?.priceUSD ?? product.priceUSD) ?? 0
  const comparePrice = toNumber(product.variants?.[0]?.comparePriceUSD ?? product.comparePriceUSD)
  const hasDiscount = comparePrice !== null && comparePrice > price

  // Normalizar imágenes usando la función centralizada
  const normalizedImages = (product.images || []).map(img => getImageUrl(img)).filter(Boolean) as string[]
  const firstImage = normalizedImages[0] || ''
  const secondImage = normalizedImages[1] || firstImage
  const currentImage = isHovered && normalizedImages[1] ? secondImage : firstImage

  const badgeColors = {
    coral: "bg-red-500/90 text-white",
    blue: "bg-primary text-primary-foreground",
    mint: "bg-accent text-accent-foreground",
  }

  const doAddToCart = async (ev?: React.MouseEvent<HTMLButtonElement>) => {
    const rect = ev?.currentTarget ? getTriggerRect(ev.currentTarget) : null
    try {
      await addToCart({
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          priceUSD: product.priceUSD ?? product.variants?.[0]?.priceUSD ?? null,
          priceMNs: product.priceMNs ?? product.variants?.[0]?.priceMNs ?? null,
          images: product.images || [],
          adultsOnly: product.adultsOnly ?? false,
        },
        productVariant: product.variants?.[0]?.id
          ? {
              id: product.variants?.[0]?.id as string,
              name: (product.variants?.[0] as any)?.name || "Variante",
              priceUSD: (product.variants?.[0] as any)?.priceUSD ?? null,
              priceMNs: (product.variants?.[0] as any)?.priceMNs ?? null,
            }
          : null,
        quantity: 1,
      })
      setAddedFeedback(true)
      setTimeout(() => setAddedFeedback(false), 2000)
      if (rect) showAddToCart({ productName: product.name, triggerRect: rect })
      else toast({ title: "¡Al carrito! 🛒" })
    } catch (err: any) {
      toast({
        title: "Ups… no se pudo añadir 😅",
        description: err?.response?.data?.message || err?.message || "Intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleAddToCartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.adultsOnly) {
      setShowAdultsModal(true)
    } else {
      doAddToCart(e)
    }
  }

  if (prefersReducedMotion) {
    return (
      <div className="group">
        <Link
          href={`/products/${product.slug}`}
          className="block"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative rounded-xl md:rounded-2xl overflow-hidden border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-xl">
            <div className="aspect-square relative overflow-hidden bg-muted">
              <SmartImage
                src={currentImage}
                alt={product.name}
                fill
                priority={priority}
                className="p-4 md:p-6 transition-all duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                objectFit="cover"
              />

              <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-wrap gap-1.5 z-[1]">
                {badge && (
                  <span className={`px-2 md:px-3 py-1 md:py-1.5 text-[9px] md:text-[10px] font-bold uppercase rounded-full shadow-lg ${badgeColors[badgeColor]}`}>
                    {badge}
                  </span>
                )}
                {product.adultsOnly && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="animate-adults-badge px-2 md:px-3 py-1 md:py-1.5 text-[9px] md:text-[10px] font-bold rounded-full shadow-lg bg-foreground/90 text-background cursor-help">
                        +18
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[260px]">
                      Producto restringido a mayores de edad según la ley cubana.
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault()
                  if (!isAuthenticated()) {
                    toast({
                      title: "¡Entra primero! 🔐",
                      description: "Inicia sesión para guardar en tu wishlist.",
                      variant: "destructive",
                    })
                    return
                  }
                  toggleWishlist(product.id).catch((err: any) => {
                    toast({
                      title: "Ups… la wishlist se resistió 😅",
                      description: err?.response?.data?.message || err?.message || "Intenta de nuevo.",
                      variant: "destructive",
                    })
                  })
                }}
                className={`heart-btn absolute top-2 right-2 md:top-3 md:right-3 p-1.5 md:p-2.5 rounded-lg md:rounded-xl transition-all duration-300 ${
                  isInWishlist
                    ? "bg-red-500/10 text-red-500 scale-110"
                    : "bg-card/90 backdrop-blur-sm text-muted-foreground opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-card hover:text-foreground"
                }`}
              >
                <HeartIcon className="w-4 h-4 md:w-5 md:h-5" filled={isInWishlist} />
              </button>

              {/* Desktop only */}
              <button
                onClick={handleAddToCartClick}
                className="hidden md:block absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-primary text-primary-foreground text-xs md:text-sm font-semibold py-2.5 rounded-xl hover:bg-primary/90 active:scale-95"
                type="button"
              >
                {addedFeedback ? "✓ Añadido" : "Añadir al carrito"}
              </button>
            </div>

            <div className="p-3 md:p-4">
              <h3 className="text-[11px] md:text-[13px] dark:md:text-[12px] font-medium text-foreground line-clamp-2 min-h-9 md:min-h-9 leading-relaxed group-hover:text-accent transition-colors">
                {product.name}
              </h3>
              {product.averageRating && product.reviewCount && product.reviewCount > 0 && (
                <div className="mt-1.5 md:mt-2 flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 md:h-3.5 md:w-3.5 fill-accent text-accent" />
                    <span className="text-[10px] md:text-xs font-semibold text-foreground">
                      {Number(product.averageRating).toFixed(1)}
                    </span>
                  </div>
                  <span className="text-[9px] md:text-[10px] text-muted-foreground">({product.reviewCount})</span>
                </div>
              )}
              <div className="mt-2 md:mt-3 flex items-center gap-1.5 md:gap-2">
                <span className="text-base md:text-lg font-bold dark:font-extrabold text-primary">${price.toFixed(2)}</span>
                {hasDiscount && (
                  <span className="text-[10px] md:text-sm text-foreground dark:text-highlight line-through">
                    ${comparePrice!.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Mobile actions (no hover) */}
              <div className="mt-3 grid grid-cols-1 gap-2 md:hidden">
                <button
                  onClick={handleAddToCartClick}
                  className="cart-btn w-full bg-primary text-primary-foreground text-xs font-semibold py-2.5 rounded-xl transition-transform duration-200"
                  type="button"
                >
                  {addedFeedback ? "✓ Añadido" : "Añadir al carrito"}
                </button>
              </div>
            </div>
          </div>
        </Link>
        <AdultsOnlyModal
          open={showAdultsModal}
          onOpenChange={setShowAdultsModal}
          onConfirm={() => doAddToCart()}
          productName={product.name}
        />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link
        href={`/products/${product.slug}`}
        className="block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative rounded-xl md:rounded-2xl overflow-hidden border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-xl">
        <div className="aspect-square relative overflow-hidden bg-muted">
          <SmartImage
            src={currentImage}
            alt={product.name}
            fill
            priority={priority}
            className="p-4 md:p-6 transition-all duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            objectFit="cover"
          />

          <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-wrap gap-1.5 z-[1]">
            {badge && (
              <span className={`px-2 md:px-3 py-1 md:py-1.5 text-[9px] md:text-[10px] font-bold uppercase rounded-full shadow-lg ${badgeColors[badgeColor]}`}>
                {badge}
              </span>
            )}
            {product.adultsOnly && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="animate-adults-badge px-2 md:px-3 py-1 md:py-1.5 text-[9px] md:text-[10px] font-bold rounded-full shadow-lg bg-foreground/90 text-background cursor-help">
                    +18
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[260px]">
                  Producto restringido a mayores de edad según la ley cubana.
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault()
              if (!isAuthenticated()) {
                toast({ title: "¡Entra primero! 🔐", description: "Inicia sesión para guardar en tu wishlist.", variant: "destructive" })
                return
              }
              toggleWishlist(product.id).catch((err: any) => {
                toast({
                  title: "Ups… la wishlist se resistió 😅",
                  description: err?.response?.data?.message || err?.message || "Intenta de nuevo.",
                  variant: "destructive",
                })
              })
            }}
            aria-label={isInWishlist ? `Quitar ${product.name} de la wishlist` : `Agregar ${product.name} a la wishlist`}
            className={`heart-btn absolute top-2 right-2 md:top-3 md:right-3 p-1.5 md:p-2.5 rounded-lg md:rounded-xl transition-all duration-300 ${
              isInWishlist
                ? "bg-red-500/10 text-red-500 scale-110"
                : "bg-card/90 backdrop-blur-sm text-muted-foreground opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-card hover:text-foreground"
            }`}
          >
            <HeartIcon className="w-4 h-4 md:w-5 md:h-5" filled={isInWishlist} />
          </button>

          {/* Add to cart quick action */}
          <button
            onClick={handleAddToCartClick}
            aria-label={addedFeedback ? "Añadido" : `Añadir ${product.name} al carrito`}
            className="hidden md:block absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-primary text-primary-foreground text-xs md:text-sm font-semibold py-2.5 rounded-xl hover:bg-primary/90 active:scale-95"
            type="button"
          >
            {addedFeedback ? "✓ Añadido" : "Añadir al carrito"}
          </button>
        </div>

        <div className="p-3 md:p-4">
          <h3 className="text-[11px] md:text-[13px] dark:md:text-[12px] font-medium text-foreground line-clamp-2 min-h-9 md:min-h-9 leading-relaxed group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          {product.averageRating && product.reviewCount && product.reviewCount > 0 && (
            <div className="mt-1.5 md:mt-2 flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                <Star className="h-3 w-3 md:h-3.5 md:w-3.5 fill-accent text-accent" />
                <span className="text-[10px] md:text-xs font-semibold text-foreground">
                  {Number(product.averageRating).toFixed(1)}
                </span>
              </div>
              <span className="text-[9px] md:text-[10px] text-muted-foreground">
                ({product.reviewCount})
              </span>
            </div>
          )}
          <div className="mt-2 md:mt-3 flex items-center gap-1.5 md:gap-2">
            <span className="text-base md:text-lg font-bold dark:font-extrabold text-primary">${price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-sm text-foreground dark:text-highlight line-through">
                ${comparePrice!.toFixed(2)}
              </span>
            )}
          </div>

          {/* Mobile actions (no hover) */}
          <div className="mt-3 grid grid-cols-1 gap-2 md:hidden">
            <button
              onClick={handleAddToCartClick}
              aria-label={addedFeedback ? "Añadido" : `Añadir ${product.name} al carrito`}
              className="cart-btn w-full bg-primary text-primary-foreground text-xs font-semibold py-2.5 rounded-xl transition-transform duration-200"
              type="button"
            >
              {addedFeedback ? "✓ Añadido" : "Añadir al carrito"}
            </button>
          </div>
        </div>
      </div>
    </Link>
    <AdultsOnlyModal
      open={showAdultsModal}
      onOpenChange={setShowAdultsModal}
      onConfirm={() => doAddToCart()}
      productName={product.name}
    />
    </motion.div>
  )
}
