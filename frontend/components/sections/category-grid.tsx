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

export function CategoryGrid({ categories, variant = "cards", title }: CategoryGridProps) {
  if (!categories?.length) return null

  if (variant === "circles") {
    return (
      <section className="py-20 md:py-24">
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          {title && <h2 className="mb-12 text-center font-heading text-3xl md:text-4xl font-bold tracking-tight text-foreground">{title}</h2>}
          <div className="grid grid-cols-3 gap-8 md:flex md:flex-wrap md:justify-center md:gap-12">
            {categories.slice(0, 6).map((category, index) => (
              <Link
                key={category.id}
                href={`/products?categoryId=${category.id}`}
                className="group flex flex-col items-center gap-4 animate-fade-in-up transition-all duration-300 hover:scale-110"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {/* Glass circle background */}
                <div 
                  className="relative h-24 w-24 overflow-hidden rounded-full md:h-32 md:w-32 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-blue-500/30"
                  style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 8px 32px rgba(15, 23, 42, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <SmartImage 
                    src={getImageUrl(category.image) || ""} 
                    alt={category.name} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-110" 
                    sizes="(max-width: 768px) 96px, 128px" 
                    objectFit="cover" 
                  />
                </div>
                <span className="line-clamp-1 text-center text-sm font-semibold text-foreground transition-colors duration-300 group-hover:text-primary">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (variant === "banners") {
    return (
      <section className="py-20 md:py-24">
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 4).map((category, index) => (
              <Link
                key={category.id}
                href={`/products?categoryId=${category.id}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-3 hover:scale-105 animate-fade-in-up"
                style={{ 
                  animationDelay: `${index * 70}ms`,
                  background: "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 12px 40px rgba(15, 23, 42, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                }}
              >
                <SmartImage 
                  src={getImageUrl(category.image) || ""} 
                  alt={category.name} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110" 
                  sizes="(max-width: 768px) 90vw, 25vw" 
                  objectFit="cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent group-hover:from-slate-950/60" />
                <div className="absolute bottom-6 left-6 right-6 transition-all duration-300 group-hover:translate-y-2">
                  <h3 className="text-xl font-bold text-white leading-tight">{category.name}</h3>
                  <span className="mt-2 inline-block text-xs uppercase tracking-widest font-semibold text-cyan-300">Explorar</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 md:py-24">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 4).map((category, index) => (
            <Link
              key={category.id}
              href={`/products?categoryId=${category.id}`}
              className="group relative aspect-square overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-3 hover:scale-105 animate-fade-in-up"
              style={{ 
                animationDelay: `${index * 70}ms`,
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 12px 40px rgba(15, 23, 42, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
              }}
            >
              <SmartImage 
                src={getImageUrl(category.image) || ""} 
                alt={category.name} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110" 
                sizes="(max-width: 768px) 90vw, 25vw" 
                objectFit="cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent group-hover:from-slate-950/60" />
              <div className="absolute bottom-6 left-6 right-6 transition-all duration-300 group-hover:translate-y-2">
                <h3 className="text-xl font-bold text-white leading-tight">{category.name}</h3>
                <span className="mt-2 inline-block text-xs uppercase tracking-widest font-semibold text-cyan-300">Explorar</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
