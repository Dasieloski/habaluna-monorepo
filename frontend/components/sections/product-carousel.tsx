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
        <div className="mb-8 md:mb-10 flex items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Selección editorial</p>
            <h2 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight text-foreground">{title}</h2>
          </div>
          {viewAllLink && (
            <Link href={viewAllLink} aria-label={`Ver todos los productos de ${title}`} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:text-sky-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-cyan-300/60 dark:hover:text-cyan-300">
              Ver todo
            </Link>
          )}
        </div>

        <div className="group relative rounded-[2rem] border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/70 p-3 shadow-[0_25px_70px_rgba(15,23,42,0.1)] dark:border-white/10 dark:from-white/[0.07] dark:to-white/[0.02]">
          <button onClick={() => scroll("left")} aria-label="Desplazar carrusel hacia la izquierda" className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 p-2.5 shadow-sm opacity-0 transition group-hover:opacity-100 md:block dark:border-white/10 dark:bg-slate-900/90">
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button onClick={() => scroll("right")} aria-label="Desplazar carrusel hacia la derecha" className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 p-2.5 shadow-sm opacity-0 transition group-hover:opacity-100 md:block dark:border-white/10 dark:bg-slate-900/90">
            <ChevronRightIcon className="h-5 w-5" />
          </button>

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
