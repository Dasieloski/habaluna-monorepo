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
    comparePriceUSD?: number
    averageRating?: number | string | null
    reviewCount?: number
    adultsOnly?: boolean
    variants?: Array<{
      id?: string
      name?: string
      priceUSD?: number
      comparePriceUSD?: number
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
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)
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
          images: product.images || [],
          adultsOnly: product.adultsOnly ?? false,
        },
        productVariant: product.variants?.[0]?.id
          ? {
              id: product.variants?.[0]?.id as string,
              name: (product.variants?.[0] as { name?: string })?.name || "Variante",
              priceUSD: (product.variants?.[0] as { priceUSD?: number })?.priceUSD ?? null,
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

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMouseX(e.clientX - rect.left)
    setMouseY(e.clientY - rect.top)
  }

  const cardInner = (
    <>
      {/* Premium Glass Panel Image Section */}
      <div className="relative aspect-square overflow-hidden rounded-t-2xl">
        {/* Glass background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/40 to-slate-50/30 dark:from-slate-800/40 dark:via-slate-800/30 dark:to-slate-900/40" />
        
        {/* Glassmorphism frame with inset shadow */}
        <div 
          className="absolute inset-0 rounded-t-2xl border border-white/20 dark:border-white/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),inset_0_-1px_2px_rgba(0,0,0,0.1)]"
          style={{
            boxShadow: isHovered 
              ? "inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.15), 0 0 1px rgba(59,130,246,0.2)" 
              : "inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 2px rgba(0,0,0,0.1)"
          }}
        />

        {/* Image with premium scaling */}
        <div className="relative h-full w-full overflow-hidden">
          <SmartImage
            src={currentImage}
            alt={product.name}
            fill
            priority={priority}
            className="object-cover transition-all duration-700 ease-out"
            style={{
              transform: isHovered ? 'scale(1.12)' : 'scale(1)',
              filter: isHovered ? 'brightness(0.92)' : 'brightness(1)',
            }}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            objectFit="cover"
          />
          {/* Premium gradient overlay on hover */}
          <div 
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              background: isHovered 
                ? 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(59,130,246,0.15) 0%, transparent 70%)'
                : 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.05) 100%)',
              opacity: isHovered ? 1 : 0.3,
              '--mouse-x': `${(mouseX / 260) * 100}%`,
              '--mouse-y': `${(mouseY / 260) * 100}%`,
            } as React.CSSProperties}
          />
        </div>

        {/* Animated badges container */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
          {badge && (
            <span
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-lg backdrop-blur-xl transition-all duration-300 ${badgeColorClasses[badgeColor]} ${isHovered ? 'scale-105 shadow-lg' : 'shadow-md'}`}
            >
              {badge}
            </span>
          )}
          {product.adultsOnly && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="animate-adults-badge px-3 py-1.5 text-[10px] font-bold rounded-lg backdrop-blur-xl shadow-md bg-foreground/85 text-background cursor-help transition-all duration-300 hover:scale-105">
                  +18
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[260px]">
                Producto restringido a mayores de edad según la ley cubana.
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Premium wishlist button with reveal animation */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isInWishlist ? `Quitar ${product.name} de la wishlist` : `Agregar ${product.name} a la wishlist`}
          className={`heart-btn absolute top-3 right-3 z-10 p-2.5 rounded-xl transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 backdrop-blur-xl border ${
            isInWishlist
              ? "bg-red-500/30 border-red-500/50 text-red-500 scale-110 shadow-lg shadow-red-500/20"
              : `${isHovered ? 'opacity-100 scale-100 bg-white/25 border-white/40 text-foreground shadow-lg' : 'opacity-70 scale-95 bg-white/15 border-white/20 text-foreground/70'}`
          }`}
        >
          <HeartIcon className="w-5 h-5" filled={isInWishlist} />
        </button>

        {/* Color variants reveal on hover */}
        {product.variants && product.variants.length > 1 && (
          <div 
            className="absolute bottom-3 left-3 right-3 z-10 flex gap-2 transition-all duration-300 ease-out"
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'translateY(0)' : 'translateY(8px)',
              pointerEvents: isHovered ? 'auto' : 'none',
            }}
          >
            {product.variants.slice(0, 3).map((variant, idx) => (
              <div
                key={variant.id || idx}
                className="h-6 w-6 rounded-full border-2 border-white/60 backdrop-blur-sm shadow-md hover:scale-110 transition-transform duration-200 cursor-pointer"
                title={variant.name}
                style={{
                  background: `hsl(${(idx * 120) % 360}, 70%, 50%)`,
                  animation: isHovered ? `slideUp 0.4s ease-out ${idx * 0.08}s both` : 'none',
                }}
              />
            ))}
            {product.variants.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-[10px] font-bold backdrop-blur-sm">
                +
              </div>
            )}
          </div>
        )}
      </div>

      {/* Premium Info Section with Glass Effect */}
      <div 
        className="flex flex-col flex-1 min-w-0 p-5 gap-3 rounded-b-2xl relative overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}
      >
        {/* Dark mode background */}
        <div className="dark:absolute dark:inset-0 dark:bg-slate-900/50 dark:backdrop-blur-xl dark:border dark:border-white/10" />
        
        <div className="relative z-10">
          {/* Product name */}
          <h3 className="font-semibold text-foreground text-sm md:text-base line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-300">
            {product.name}
          </h3>

          {/* Rating reveal on hover - appears with smooth animation */}
          {product.averageRating != null && product.reviewCount != null && product.reviewCount > 0 && (
            <div 
              className="flex items-center gap-2 mt-2 transition-all duration-300"
              style={{
                opacity: isHovered ? 1 : 0.7,
                transform: isHovered ? 'translateY(0)' : 'translateY(-4px)',
              }}
            >
              <div className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-accent text-accent shrink-0" />
                <span className="text-xs font-bold text-foreground">{Number(product.averageRating).toFixed(1)}</span>
                <span className="text-[10px] text-muted-foreground">({product.reviewCount})</span>
              </div>
            </div>
          )}

          {/* Price and CTA section */}
          <div className="mt-auto pt-3 flex items-end justify-between gap-2 flex-wrap">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                ${price.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">${comparePrice!.toFixed(2)}</span>
              )}
            </div>

            {/* Add to cart button with reveal and scale animation */}
            <button
              type="button"
              onClick={handleAddToCartClick}
              aria-label={addedFeedback ? "Añadido" : `Añadir ${product.name} al carrito`}
              className="cart-btn flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-gradient-to-r from-primary to-blue-500 text-primary-foreground font-semibold text-sm transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
              style={{
                opacity: isHovered ? 1 : 0.85,
                transform: isHovered ? 'scale(1)' : 'scale(0.95)',
              }}
            >
              <CartIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{addedFeedback ? "✓ Añadido" : "Carrito"}</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes tiltHover {
          0% { transform: perspective(1000px) rotateX(0deg) rotateY(0deg); }
          100% { transform: perspective(1000px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)); }
        }
      `}</style>
    </>
  )

  return (
    <>
      <Link
        href={`/products/${product.slug}`}
        className="group block h-full overflow-hidden rounded-2xl text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setMouseX(0)
          setMouseY(0)
        }}
        onMouseMove={handleMouseMove}
        style={{
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          transform: isHovered ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)',
          boxShadow: isHovered
            ? '0 32px 72px rgba(59, 130, 246, 0.25), 0 0 1px rgba(59, 130, 246, 0.2)'
            : '0 12px 32px rgba(59, 130, 246, 0.12), 0 0 1px rgba(59, 130, 246, 0.1)',
        }}
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
