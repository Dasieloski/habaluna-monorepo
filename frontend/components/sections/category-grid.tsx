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
          {title && <h2 className="mb-12 text-center font-heading text-2xl md:text-3xl font-semibold tracking-tight">{title}</h2>}
          <div className="grid grid-cols-3 gap-8 md:flex md:flex-wrap md:justify-center md:gap-12">
            {categories.slice(0, 6).map((category, index) => (
              <Link
                key={category.id}
                href={`/products?categoryId=${category.id}`}
                className="group flex flex-col items-center gap-3 animate-fade-in-up"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="relative h-20 w-20 overflow-hidden rounded-full border border-slate-200/90 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_18px_38px_rgba(14,165,233,0.2)] md:h-28 md:w-28 dark:border-white/10 dark:bg-white/[0.04]">
                  <SmartImage src={getImageUrl(category.image) || ""} alt={category.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 768px) 33vw, 180px" objectFit="cover" />
                </div>
                <span className="line-clamp-1 text-center text-xs font-medium text-foreground/90 transition-colors group-hover:text-sky-600 md:text-sm dark:group-hover:text-cyan-300">{category.name}</span>
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
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 4).map((category, index) => (
              <Link
                key={category.id}
                href={`/products?categoryId=${category.id}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(14,165,233,0.2)] dark:border-white/10 dark:bg-white/[0.03] animate-fade-in-up"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <SmartImage src={getImageUrl(category.image) || ""} alt={category.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 90vw, 25vw" objectFit="cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060812]/78 via-[#060812]/20 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                  <span className="mt-1 inline-block text-[11px] uppercase tracking-[0.16em] text-slate-200">Ver más</span>
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 4).map((category, index) => (
            <Link
              key={category.id}
              href={`/products?categoryId=${category.id}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(99,102,241,0.2)] md:aspect-square dark:border-white/10 dark:bg-white/[0.03] animate-fade-in-up"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <SmartImage src={getImageUrl(category.image) || ""} alt={category.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 90vw, 25vw" objectFit="cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060812]/72 via-[#060812]/18 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                <span className="mt-1 inline-block text-[11px] uppercase tracking-[0.16em] text-slate-200">Explorar</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
