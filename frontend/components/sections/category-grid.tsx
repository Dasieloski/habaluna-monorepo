"use client"

import Link from "next/link"
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
  if (!categories || categories.length === 0) return null

  if (variant === "circles") {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          {title && (
            <h2 className="font-heading text-xl md:text-2xl font-semibold text-foreground text-center mb-10 md:mb-12">
              {title}
            </h2>
          )}
          <div className="grid grid-cols-3 md:flex md:flex-wrap md:justify-center gap-8 md:gap-12">
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                href={`/products?categoryId=${category.id}`}
                aria-label={`Ver productos de ${category.name}`}
                className="group flex flex-col items-center"
              >
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden bg-card mb-3 border border-border hover-card relative">
                  <SmartImage
                    src={getImageUrl(category.image) || ''}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                    sizes="(max-width: 768px) 33vw, 200px"
                    objectFit="cover"
                  />
                </div>
                <span className="text-xs md:text-sm font-medium text-foreground text-center group-hover:text-primary transition-colors duration-200 line-clamp-1">
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
    return (
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.slice(0, 4).map((category) => (
              <Link
                key={category.id}
                href={`/products?categoryId=${category.id}`}
                aria-label={`Ver productos de ${category.name}`}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-card border border-border hover-card"
              >
                <SmartImage
                  src={getImageUrl(category.image) || ''}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  objectFit="cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <h3 className="text-white text-sm md:text-base font-semibold drop-shadow-md">{category.name}</h3>
                  <span className="text-white/90 text-xs mt-1 inline-block">Ver más</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.slice(0, 4).map((category) => (
            <Link
              key={category.id}
              href={`/products?categoryId=${category.id}`}
              aria-label={`Ver productos de ${category.name}`}
              className="group relative aspect-[4/5] md:aspect-square rounded-xl overflow-hidden bg-card border border-border hover-card"
            >
              <SmartImage
                src={getImageUrl(category.image) || ''}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-200 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
                objectFit="cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <h3 className="text-white text-base md:text-lg font-semibold drop-shadow-md">{category.name}</h3>
                <span className="text-white/90 text-xs mt-1 inline-block">Explorar</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
