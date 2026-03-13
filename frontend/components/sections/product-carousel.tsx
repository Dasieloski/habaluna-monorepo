"use client"

import { useRef, useState, useEffect } from "react"
import { ProductCard } from "@/components/product/product-card"
import Link from "next/link"
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons/streamline-icons"

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

interface ProductCarouselProps {
  title: string
  products: Product[]
  viewAllLink?: string
  badgeType?: "bestseller" | "new" | "sale" | "personalized"
  autoSlide?: boolean
  className?: string
}

export function ProductCarousel({ title, products, viewAllLink, badgeType, autoSlide = false, className }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setIsVisible(true), { threshold: 0.1 })
    if (scrollRef.current) observer.observe(scrollRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (autoSlide && scrollRef.current) {
      const interval = setInterval(() => {
        if (scrollRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
          if (scrollLeft + clientWidth >= scrollWidth - 10) scrollRef.current.scrollTo({ left: 0, behavior: "smooth" })
          else scrollRef.current.scrollBy({ left: clientWidth >= 768 ? 260 : 180, behavior: "smooth" })
        }
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [autoSlide])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: direction === "left" ? -280 : 280, behavior: "smooth" })
  }

  const getBadge = (index: number) => {
    if (badgeType === "bestseller" && index < 3) return { text: "TOP VENTA", color: "blue" as const }
    if (badgeType === "new") return { text: "NUEVO", color: "blue" as const }
    if (badgeType === "sale") return { text: "OFERTA", color: "coral" as const }
    if (badgeType === "personalized") return { text: "DESTACADO", color: "mint" as const }
    return null
  }

  if (!products?.length) return null

  return (
    <section className={`py-20 md:py-24 ${className ?? ""}`}>
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        {/* Section header */}
        <div className="mb-12 md:mb-14 flex items-end justify-between gap-4">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest font-semibold text-slate-500 dark:text-slate-400">Selección editorial</p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-foreground">{title}</h2>
          </div>
          {viewAllLink && (
            <Link 
              href={viewAllLink} 
              aria-label={`Ver todos los productos de ${title}`} 
              className="rounded-xl border border-slate-200/60 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-900 transition-all duration-300 hover:scale-105 hover:border-slate-300 hover:bg-white/90 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:hover:border-cyan-300/60 dark:hover:bg-white/10 dark:hover:text-cyan-300"
              style={{
                backdropFilter: "blur(12px)",
              }}
            >
              Ver todo
            </Link>
          )}
        </div>

        {/* Carousel container with glass panel */}
        <div 
          className="group relative rounded-2xl p-3 md:p-4 transition-all duration-300"
          style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(200, 230, 255, 0.2) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 25px 70px rgba(15, 23, 42, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
          }}
        >
          {/* Scroll buttons */}
          <button 
            onClick={() => scroll("left")} 
            aria-label="Desplazar carrusel hacia la izquierda" 
            className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-lg p-2.5 opacity-0 transition-all duration-300 group-hover:opacity-100 md:block hover:scale-110 active:scale-95"
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button 
            onClick={() => scroll("right")} 
            aria-label="Desplazar carrusel hacia la derecha" 
            className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-lg p-2.5 opacity-0 transition-all duration-300 group-hover:opacity-100 md:block hover:scale-110 active:scale-95"
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>

          {/* Scrollable products */}
          <div ref={scrollRef} className="-mx-2 flex gap-4 overflow-x-auto px-2 pb-2 scrollbar-hide md:gap-6">
            {products.map((product, index) => {
              const badge = getBadge(index)
              return (
                <div key={product.id} className={`shrink-0 w-[175px] md:w-[248px] transition duration-500 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
                  <ProductCard product={product} badge={badge?.text} badgeColor={badge?.color} priority={index < 4} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
