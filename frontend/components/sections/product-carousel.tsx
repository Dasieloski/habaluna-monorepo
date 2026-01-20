"use client"

import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
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
    if (badgeType === "new") return { text: "NUEVO", color: "coral" as const }
    if (badgeType === "sale") return { text: "OFERTA", color: "coral" as const }
    if (badgeType === "personalized") return { text: "DESTACADO", color: "mint" as const }
    return null
  }

  if (!products || products.length === 0) return null

  // Usar solo imágenes de la BD - si no hay, el ProductCard usará placeholder
  const productsWithImages = products.map((product) => ({
    ...product,
    images: product.images?.length ? product.images : ['/placeholder.svg'],
  }))

  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ type: "spring", stiffness: 80, damping: 20 }}
      className={`py-12 md:py-20 dark:py-14 dark:md:py-24 ${className ?? ""}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8 md:mb-10">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground leading-tight">{title}</h2>
          {viewAllLink && (
            <Link
              href={viewAllLink}
              aria-label={`Ver todos los productos de ${title}`}
              className="text-xs md:text-sm font-semibold text-accent hover:text-accent/90 transition-colors flex items-center gap-1 group relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-current after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
            >
              Ver todo
              <ChevronRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        <div className="relative group">
          <button
            onClick={() => scroll("left")}
            aria-label="Desplazar carrusel hacia la izquierda"
            className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-card border border-border shadow-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 -translate-x-2 group-hover:translate-x-0"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Desplazar carrusel hacia la derecha"
            className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-card border border-border shadow-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 translate-x-2 group-hover:translate-x-0"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-6 dark:gap-5 dark:md:gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-4 -mx-2 px-2"
          >
            {productsWithImages.map((product, index) => {
              const badge = getBadge(index)
              return (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-[160px] md:w-[240px] transition-all duration-500"
                  style={{
                    transitionDelay: `${index < 5 ? index * 0.08 : 0.35 + (index - 5) * 0.02}s`,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(20px)",
                  }}
                >
                  <ProductCard product={product} badge={badge?.text} badgeColor={badge?.color} priority={index < 4} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
