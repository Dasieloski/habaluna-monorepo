"use client"

import Link from "next/link"
import { useEffect, useState, useRef } from "react"
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
      <section ref={sectionRef} className="py-10 md:py-16 bg-gradient-to-b from-white to-sky-50/30">
        <div className="container mx-auto px-4">
          {title && (
            <h2
              className={`text-xl md:text-3xl font-bold text-foreground text-center mb-8 md:mb-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              {title}
            </h2>
          )}
          <div className="grid grid-cols-3 md:flex md:flex-wrap md:justify-center gap-4 md:gap-12">
            {categories.slice(0, 6).map((category, index) => (
              <Link
                key={category.id}
                href={`/products?categoryId=${category.id}`}
                aria-label={`Ver productos de ${category.name}`}
                className={`group flex flex-col items-center transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 md:w-28 md:h-28 rounded-full overflow-hidden bg-gradient-to-br from-sky-100 to-blue-100 mb-2 md:mb-4 ring-2 md:ring-4 ring-transparent group-hover:ring-sky-300 transition-all duration-300 group-hover:scale-110 shadow-lg relative">
                  <SmartImage
                    src={getImageUrl(category.image) || "/placeholder.svg"}
                    alt={category.name}
                    fill
                    className="transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 33vw, 200px"
                    objectFit="cover"
                    loading="lazy"
                  />
                </div>
                <span className="text-xs md:text-sm font-semibold text-foreground text-center group-hover:text-sky-600 transition-colors line-clamp-1">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (variant === "banners") {
    const colors = ["#e0f2fe", "#ecfeff", "#f0f9ff", "#e0f7fa"]
    return (
      <section ref={sectionRef} className="py-10 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {categories.slice(0, 4).map((category, index) => (
              <Link
                key={category.id}
                href={`/products?categoryId=${category.id}`}
                aria-label={`Ver productos de ${category.name}`}
                className={`group relative aspect-[3/4] md:aspect-[3/4] rounded-xl md:rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{
                  backgroundColor: colors[index % colors.length],
                  transitionDelay: `${index * 0.1}s`,
                }}
              >
                <SmartImage
                  src={getImageUrl(category.image) || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  objectFit="cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-3 md:bottom-5 left-3 md:left-5 right-3 md:right-5">
                  <h3 className="text-white text-sm md:text-xl font-bold mb-0.5 md:mb-1">{category.name}</h3>
                  <span className="text-white/90 text-[10px] md:text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1 group-hover:gap-2 transition-all">
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
    <section ref={sectionRef} className="py-10 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {categories.slice(0, 4).map((category, index) => (
            <Link
              key={category.id}
              href={`/products?categoryId=${category.id}`}
              aria-label={`Ver productos de ${category.name}`}
              className={`group relative aspect-[4/5] md:aspect-square rounded-xl md:rounded-2xl overflow-hidden bg-gradient-to-br from-sky-100 to-blue-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <SmartImage
                src={getImageUrl(category.image) || "/placeholder.svg"}
                alt={category.name}
                fill
                className="transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 25vw"
                objectFit="cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-3 md:bottom-5 left-3 md:left-5 right-3 md:right-5">
                <h3 className="text-white text-base md:text-2xl font-bold mb-0.5 md:mb-1">{category.name}</h3>
                <span className="text-white/90 text-[10px] md:text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1 group-hover:gap-2 transition-all">
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
