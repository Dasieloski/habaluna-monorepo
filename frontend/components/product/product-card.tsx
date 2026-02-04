"use client"

import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { HeartIcon, CartIcon } from "@/components/icons/streamline-icons"
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AdultsOnlyModal } from "@/components/ui/adults-only-modal"

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

const badgeColorClasses = {
  coral: "bg-red-500/90 text-white",
  blue: "bg-primary text-primary-foreground",
  mint: "bg-accent text-accent-foreground",
} as const

function ProductCardContent({
  product,
  badge,
  badgeColor = "coral",
  priority,
  isReducedMotion,
}: ProductCardProps & { isReducedMotion: boolean }) {
  const [isHovered, setIsHovered] = useState(false)
  const [addedFeedback, setAddedFeedback] = useState(false)
  const [showAdultsModal, setShowAdultsModal] = useState(false)
  const { toast, showAddToCart } = useToast()
  const addToCart = useCartStore((s) => s.addToCart)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const toggleWishlist = useWishlistStore((s) => s.toggle)
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id))

  const price = toNumber(product.variants?.[0]?.priceUSD ?? product.priceUSD) ?? 0
  const comparePrice = toNumber(product.variants?.[0]?.comparePriceUSD ?? product.comparePriceUSD)
  const hasDiscount = comparePrice !== null && comparePrice > price

  const normalizedImages = (product.images || []).map((img) => getImageUrl(img)).filter(Boolean) as string[]
  const firstImage = normalizedImages[0] || ""
  const secondImage = normalizedImages[1] || firstImage
  const currentImage = isHovered && normalizedImages[1] ? secondImage : firstImage

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
              name: (product.variants?.[0] as { name?: string })?.name || "Variante",
              priceUSD: (product.variants?.[0] as { priceUSD?: number })?.priceUSD ?? null,
              priceMNs: (product.variants?.[0] as { priceMNs?: number })?.priceMNs ?? null,
            }
          : null,
        quantity: 1,
      })
      setAddedFeedback(true)
      setTimeout(() => setAddedFeedback(false), 2000)
      if (rect) showAddToCart({ productName: product.name, triggerRect: rect })
      else toast({ title: "¡Al carrito! 🛒" })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Intenta de nuevo."
      toast({
        title: "Ups… no se pudo añadir 😅",
        description: typeof (err as { response?: { data?: { message?: string } } })?.response?.data?.message === "string"
          ? (err as { response: { data: { message: string } } }).response.data.message
          : message,
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

  const handleWishlistClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated()) {
      toast({
        title: "¡Entra primero! 🔐",
        description: "Inicia sesión para guardar en tu wishlist.",
        variant: "destructive",
      })
      return
    }
    toggleWishlist(product.id).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : "Intenta de nuevo."
      toast({
        title: "Ups… la wishlist se resistió 😅",
        description: typeof (err as { response?: { data?: { message?: string } } })?.response?.data?.message === "string"
          ? (err as { response: { data: { message: string } } }).response.data.message
          : message,
        variant: "destructive",
      })
    })
  }

  const cardInner = (
    <>
      {/* Imagen: aspecto cuadrado, marco interior redondeado (estilo material/glass) */}
      <div className="relative aspect-square overflow-hidden rounded-t-xl md:rounded-t-2xl bg-muted">
        <div className="absolute inset-2 md:inset-3 rounded-lg md:rounded-xl bg-card overflow-hidden shadow-inner">
          <SmartImage
            src={currentImage}
            alt={product.name}
            fill
            priority={priority}
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            objectFit="cover"
          />
        </div>

        {/* Badges: esquina superior izquierda */}
        <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-wrap gap-1.5 z-10">
          {badge && (
            <span
              className={`px-2 md:px-2.5 py-1 md:py-1.5 text-[9px] md:text-[10px] font-bold uppercase tracking-wide rounded-lg shadow-md ${badgeColorClasses[badgeColor]}`}
            >
              {badge}
            </span>
          )}
          {product.adultsOnly && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="animate-adults-badge px-2 md:px-2.5 py-1 md:py-1.5 text-[9px] md:text-[10px] font-bold rounded-lg shadow-md bg-foreground/90 text-background cursor-help">
                  +18
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[260px]">
                Producto restringido a mayores de edad según la ley cubana.
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Wishlist: esquina superior derecha */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isInWishlist ? `Quitar ${product.name} de la wishlist` : `Agregar ${product.name} a la wishlist`}
          className={`heart-btn absolute top-2 right-2 md:top-3 md:right-3 z-10 p-2 md:p-2.5 rounded-lg md:rounded-xl transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            isInWishlist
              ? "bg-red-500/15 text-red-500 scale-110"
              : "bg-card/90 backdrop-blur-sm text-muted-foreground opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-card hover:text-foreground"
          }`}
        >
          <HeartIcon className="w-4 h-4 md:w-5 md:h-5" filled={isInWishlist} />
        </button>
      </div>

      {/* Detalles: título > precio > acciones, padding consistente */}
      <div className="flex flex-col flex-1 min-w-0 p-3 md:p-4 gap-2 md:gap-3 bg-card rounded-b-xl md:rounded-b-2xl">
        <h3 className="font-medium text-foreground text-sm md:text-base line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-200">
          {product.name}
        </h3>
        {product.averageRating != null && product.reviewCount != null && product.reviewCount > 0 && (
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-accent text-accent shrink-0" />
            <span className="text-xs font-semibold text-foreground">{Number(product.averageRating).toFixed(1)}</span>
            <span className="text-[10px] md:text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
        )}
        <div className="mt-auto flex items-end justify-between gap-2 flex-wrap">
          <div className="flex items-baseline gap-1.5 md:gap-2">
            <span className="text-base md:text-lg font-bold text-primary">${price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-xs md:text-sm text-muted-foreground line-through">${comparePrice!.toFixed(2)}</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddToCartClick}
            aria-label={addedFeedback ? "Añadido" : `Añadir ${product.name} al carrito`}
            className="cart-btn flex items-center justify-center gap-1.5 p-2 md:p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shrink-0"
          >
            <CartIcon className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline text-xs md:text-sm font-semibold">
              {addedFeedback ? "Añadido" : "Al carrito"}
            </span>
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      <Link
        href={`/products/${product.slug}`}
        className="group block h-full rounded-xl overflow-hidden border border-border bg-card text-left shadow-sm hover-card focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.99]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <article className="flex flex-col h-full">
          {cardInner}
        </article>
      </Link>
      <AdultsOnlyModal
        open={showAdultsModal}
        onOpenChange={setShowAdultsModal}
        onConfirm={() => doAddToCart()}
        productName={product.name}
      />
    </>
  )
}

export function ProductCard(props: ProductCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const isReducedMotion = !!prefersReducedMotion

  if (isReducedMotion) {
    return <ProductCardContent {...props} isReducedMotion={true} />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="h-full"
    >
      <ProductCardContent {...props} isReducedMotion={false} />
    </motion.div>
  )
}
