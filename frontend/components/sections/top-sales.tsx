"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { HeartIcon } from "@/components/icons/streamline-icons"
import { toNumber } from "@/lib/money"
import { SmartImage } from "@/components/ui/smart-image"
import { ShoppingCart } from "lucide-react"
import { useCartStore } from "@/lib/store/cart-store"
import { useToast } from "@/hooks/use-toast"
import { getTriggerRect } from "@/lib/contextual-toast-utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface Product {
  id: string
  slug: string
  name: string
  images?: string[]
  priceUSD?: number
  comparePriceUSD?: number
  adultsOnly?: boolean
  variants?: Array<{
    priceUSD?: number
    comparePriceUSD?: number
  }>
}

interface TopSalesProps {
  products: Product[]
  /** Para ritmo vertical (ej. pb-16 md:pb-24). */
  className?: string
}

export function TopSales({ products, className }: TopSalesProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const addToCart = useCartStore((s) => s.addToCart)
  const { toast, showAddToCart } = useToast()

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(id)) {
        newFavorites.delete(id)
      } else {
        newFavorites.add(id)
      }
      return newFavorites
    })
  }

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = getTriggerRect(e.currentTarget)
    try {
      await addToCart({
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          priceUSD: product.priceUSD ?? product.variants?.[0]?.priceUSD ?? null,
          images: product.images || [],
        },
        productVariant: null,
        quantity: 1,
      })
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

  if (!products || products.length === 0) return null

  const featuredProduct = products[0]
  const otherProducts = products.slice(1, 5)

  const getPrice = (product: Product) => toNumber(product.variants?.[0]?.priceUSD ?? product.priceUSD) ?? 0
  const getComparePrice = (product: Product) => toNumber(product.variants?.[0]?.comparePriceUSD ?? product.comparePriceUSD)

  return (
    <section className={`py-16 md:py-24 bg-background ${className ?? ""}`}>
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="flex items-center justify-between mb-8 md:mb-10">
          <h2 className="font-heading text-xl md:text-2xl font-semibold text-foreground">Top Ventas</h2>
          <Link
            href="/products?filter=top"
            className="text-sm font-medium text-primary hover:underline transition-opacity duration-200"
          >
            Ver todo
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          <Link
            href={`/products/${featuredProduct.slug}`}
            className="col-span-2 lg:row-span-2 group"
          >
            <div className="relative h-full bg-card rounded-xl overflow-hidden border border-border hover-card">
              <div className="aspect-[4/3] lg:aspect-auto lg:h-full relative overflow-hidden">
                <SmartImage
                  src={featuredProduct.images?.[0] || ''}
                  alt={featuredProduct.name}
                  fill
                  className="p-4 md:p-8 object-cover transition-transform duration-200 group-hover:scale-105 lg:object-contain"
                  sizes="(max-width: 1024px) 66vw, 40vw"
                  objectFit="cover"
                  priority
                />
                <button
                  onClick={(e) => toggleFavorite(featuredProduct.id, e)}
                  aria-label={favorites.has(featuredProduct.id) ? `Quitar ${featuredProduct.name} de favoritos` : `Agregar ${featuredProduct.name} a favoritos`}
                  className={`heart-btn absolute top-3 right-3 p-2 md:p-3 rounded-lg transition-colors duration-200 ${
                    favorites.has(featuredProduct.id)
                      ? "bg-red-500/10 text-red-500"
                      : "bg-card/80 backdrop-blur-sm text-muted-foreground hover:bg-card hover:text-foreground"
                  }`}
                >
                  <HeartIcon className="w-5 h-5 md:w-6 md:h-6" filled={favorites.has(featuredProduct.id)} />
                </button>
                <button
                  onClick={(e) => handleAddToCart(featuredProduct, e)}
                  className="cart-btn absolute bottom-3 right-3 md:bottom-4 md:right-4 p-2.5 md:p-3 rounded-lg bg-card/80 backdrop-blur-sm text-foreground hover:bg-card transition-colors duration-200"
                  aria-label={`Añadir ${featuredProduct.name} al carrito`}
                  type="button"
                >
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-[1]">
                  <span className="px-2 md:px-3 py-1 md:py-1.5 bg-highlight text-highlight-foreground text-[10px] md:text-xs font-bold uppercase rounded-full shadow-lg">
                    #1 Top
                  </span>
                  {featuredProduct.adultsOnly && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="animate-adults-badge px-2 md:px-3 py-1 md:py-1.5 text-[9px] md:text-[10px] font-bold rounded-full shadow-lg bg-foreground/90 text-background cursor-help">
                          +18
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[260px]">
                        Producto con entrega restringida a mayores de 18 años
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
              <div className="p-4 md:p-5">
                <h3 className="text-sm md:text-base font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
                  {featuredProduct.name}
                </h3>
                <p className="text-base md:text-lg font-semibold text-primary mt-2">
                  ${getPrice(featuredProduct).toFixed(2)}
                </p>
              </div>
            </div>
          </Link>

          {otherProducts.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="group">
              <div className="relative bg-card rounded-xl overflow-hidden h-full border border-border hover-card">
                <div className="aspect-square relative overflow-hidden">
                  <SmartImage
                    src={product.images?.[0] || ''}
                    alt={product.name}
                    fill
                    className="object-cover p-3 md:p-4 transition-transform duration-200 group-hover:scale-105"
                    sizes="(max-width: 1024px) 33vw, 20vw"
                    objectFit="cover"
                  />
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1.5 z-10">
                    {product.adultsOnly && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="animate-adults-badge px-2 md:px-3 py-1 md:py-1.5 text-[9px] md:text-[10px] font-bold rounded-full shadow-lg bg-foreground/90 text-background cursor-help">
                            +18
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-[260px]">
                          Producto con entrega restringida a mayores de 18 años
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <button
                    onClick={(e) => toggleFavorite(product.id, e)}
                    aria-label={favorites.has(product.id) ? `Quitar ${product.name} de favoritos` : `Agregar ${product.name} a favoritos`}
                    className={`heart-btn absolute top-2 right-2 p-2 rounded-lg transition-colors duration-200 ${
                      favorites.has(product.id)
                        ? "bg-red-500/10 text-red-500"
                        : "bg-card/80 backdrop-blur-sm text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-card hover:text-foreground"
                    }`}
                  >
                    <HeartIcon className="w-4 h-4 md:w-5 md:h-5" filled={favorites.has(product.id)} />
                  </button>
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    className="cart-btn absolute bottom-2 right-2 p-2 rounded-lg bg-card/80 backdrop-blur-sm text-foreground hover:bg-card transition-colors duration-200 md:opacity-0 md:group-hover:opacity-100"
                    aria-label={`Añadir ${product.name} al carrito`}
                    type="button"
                  >
                    <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="text-xs md:text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 md:gap-2 mt-1.5 md:mt-2">
                    <span className="text-sm md:text-base font-bold dark:font-extrabold text-primary">
                      ${getPrice(product).toFixed(2)}
                    </span>
                    {getComparePrice(product) !== null && getComparePrice(product)! > getPrice(product) && (
                      <span className="text-[10px] md:text-xs text-foreground dark:text-highlight line-through">
                        ${getComparePrice(product)!.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
