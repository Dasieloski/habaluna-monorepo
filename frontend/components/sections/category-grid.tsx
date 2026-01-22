"use client"

import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { SmartImage } from "@/components/ui/smart-image"
import { getImageUrl } from "@/lib/image-utils"

interface Category {
  id: string
  name: string
  image?: string
  slug?: string
}

interface CategoryGridProps {
  categories: Category[]
  variant?: "cards" | "circles" | "banners"
  title?: string
}

// Eliminadas imágenes estáticas - solo usar imágenes de la BD o placeholder

export function CategoryGrid({ categories, variant = "cards", title }: CategoryGridProps) {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  if (!categories || categories.length === 0) return null

  if (variant === "circles") {
    return (
      <motion.section
        ref={sectionRef}
        initial={{ opacity: 0, y: 28 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
        className="py-12 md:py-20 dark:py-14 dark:md:py-24 bg-background"
      >
        <div className="container mx-auto px-4">
          {title && (
            <h2 className="font-heading text-2xl md:text-4xl font-bold dark:font-extrabold text-foreground text-center mb-10 md:mb-12 leading-tight">
              {title}
            </h2>
          )}
          <div className="grid grid-cols-3 md:flex md:flex-wrap md:justify-center gap-5 md:gap-14 dark:gap-6 dark:md:gap-16">
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                href={`/products?categoryId=${category.id}`}
                aria-label={`Ver productos de ${category.name}`}
                className="group flex flex-col items-center"
              >
                <div className="w-16 h-16 md:w-28 md:h-28 rounded-full overflow-hidden bg-card mb-2 md:mb-4 ring-2 md:ring-4 ring-transparent group-hover:ring-accent transition-all duration-300 group-hover:scale-110 shadow-lg relative">
                  <SmartImage
                    src={getImageUrl(category.image) || ''}
                    alt={category.name}
                    fill
                    className="transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 33vw, 200px"
                    objectFit="cover"
                  />
                </div>
                <span className="text-xs md:text-sm font-semibold text-foreground text-center group-hover:text-accent transition-colors line-clamp-1">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </motion.section>
    )
  }

  if (variant === "banners") {
    const colors = ["#f7f6f4", "#ebe6d8", "#f7f6f4", "#ebe6d8"]
    return (
      <section ref={sectionRef} className="py-10 md:py-16 dark:py-12 dark:md:py-20 dark:bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 dark:gap-4 dark:md:gap-8">
            {categories.slice(0, 4).map((category, index) => (
              <Link
                key={category.id}
                href={`/products?categoryId=${category.id}`}
                aria-label={`Ver productos de ${category.name}`}
                className={`group relative aspect-[3/4] md:aspect-[3/4] rounded-xl md:rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:!bg-[#212125] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{
                  backgroundColor: colors[index % colors.length],
                  transitionDelay: `${index < 5 ? index * 0.08 : 0.35 + (index - 5) * 0.02}s`,
                }}
              >
                <SmartImage
                  src={getImageUrl(category.image) || ''}
                  alt={category.name}
                  fill
                  className="transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  objectFit="cover"
                />
                <div className="absolute bottom-3 md:bottom-5 left-3 md:left-5 right-3 md:right-5 z-10">
                  <h3 className="text-white text-sm md:text-xl font-bold mb-0.5 md:mb-1 drop-shadow-lg">{category.name}</h3>
                  <span className="text-white/90 text-[10px] md:text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1 group-hover:gap-2 transition-all drop-shadow-md">
                    Ver más →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Default cards variant
  return (
    <section ref={sectionRef} className="py-12 md:py-20 dark:py-14 dark:md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 dark:gap-5 dark:md:gap-10">
          {categories.slice(0, 4).map((category, index) => (
            <Link
              key={category.id}
              href={`/products?categoryId=${category.id}`}
              aria-label={`Ver productos de ${category.name}`}
              className={`group relative aspect-[4/5] md:aspect-square rounded-xl md:rounded-2xl overflow-hidden bg-card transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${index < 5 ? index * 0.08 : 0.35 + (index - 5) * 0.02}s` }}
            >
              <SmartImage
                src={getImageUrl(category.image) || ''}
                alt={category.name}
                fill
                className="transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 25vw"
                objectFit="cover"
              />
              <div className="absolute bottom-3 md:bottom-5 left-3 md:left-5 right-3 md:right-5 z-10">
                <h3 className="text-white text-base md:text-2xl font-bold mb-0.5 md:mb-1 drop-shadow-lg">{category.name}</h3>
                <span className="text-white/90 text-[10px] md:text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1 group-hover:gap-2 transition-all drop-shadow-md">
                  Explorar →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
