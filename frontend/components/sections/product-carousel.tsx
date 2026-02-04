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
  /** Para ritmo vertical (ej. pt-12 md:pt-16 o pt-16 md:pt-20). */
  className?: string
}

// Eliminadas imágenes estáticas - solo usar imágenes de la BD o placeholder

export function ProductCarousel({ title, products, viewAllLink, badgeType, autoSlide = false, className }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (scrollRef.current) {
      observer.observe(scrollRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (autoSlide && scrollRef.current) {
      const interval = setInterval(() => {
        if (scrollRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            scrollRef.current.scrollTo({ left: 0, behavior: "smooth" })
          } else {
            const amount = clientWidth >= 768 ? 250 : 170
            scrollRef.current.scrollBy({ left: amount, behavior: "smooth" })
          }
        }
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [autoSlide])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 250
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const getBadge = (index: number) => {
    if (badgeType === "bestseller" && index < 3) return { text: "TOP VENTA", color: "blue" as const }
    if (badgeType === "new") return { text: "NUEVO", color: "blue" as const }
    if (badgeType === "sale") return { text: "OFERTA", color: "coral" as const }
    if (badgeType === "personalized") return { text: "DESTACADO", color: "mint" as const }
    return null
  }

  if (!products || products.length === 0) return null

  return (
    <section className={`py-16 md:py-24 ${className ?? ""}`}>
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="flex items-center justify-between mb-8 md:mb-10">
          <h2 className="font-heading text-xl md:text-2xl font-semibold text-foreground">{title}</h2>
          {viewAllLink && (
            <Link
              href={viewAllLink}
              aria-label={`Ver todos los productos de ${title}`}
              className="text-sm font-medium text-primary hover:underline transition-opacity duration-200"
            >
              Ver todo
            </Link>
          )}
        </div>

        <div className="relative group">
          <button
            onClick={() => scroll("left")}
            aria-label="Desplazar carrusel hacia la izquierda"
            className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2.5 bg-card border border-border rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Desplazar carrusel hacia la derecha"
            className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2.5 bg-card border border-border rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-2 -mx-2 px-2"
          >
            {products.map((product, index) => {
              const badge = getBadge(index)
              return (
                <div key={product.id} className="shrink-0 w-[160px] md:w-[240px]">
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
