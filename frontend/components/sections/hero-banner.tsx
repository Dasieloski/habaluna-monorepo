"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronRightIcon } from "@/components/icons/streamline-icons"
import { SmartImage } from "@/components/ui/smart-image"
import { MoonHero } from "@/components/3d/moon-hero"

interface Banner {
  id: string
  title: string
  subtitle?: string
  image?: string
  link?: string
  buttonText?: string
  backgroundColor?: string
}

interface HeroBannerProps {
  banners?: Banner[]
}

const defaultBanners: Banner[] = [
  {
    id: "1",
    title: "PRODUCTOS FRESCOS",
    subtitle: "Spaghettis, coditos y más",
    image: "/fresh-pasta-spaghetti-variety-clean-background.jpg",
    buttonText: "Ver Alimentos",
    backgroundColor: "#e0f2fe",
  },
  {
    id: "2",
    title: "MATERIALES DE CALIDAD",
    subtitle: "Cemento, arena y más",
    image: "/construction-materials-cement-bags-modern.jpg",
    buttonText: "Ver Materiales",
    backgroundColor: "#f0f9ff",
  },
  {
    id: "3",
    title: "BEBIDAS SELECTAS",
    subtitle: "Cervezas artesanales",
    image: "/craft-beer-bottles-elegant-display.jpg",
    buttonText: "Ver Bebidas",
    backgroundColor: "#ecfeff",
  },
]

export function HeroBanner({ banners = defaultBanners }: HeroBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const displayBanners = banners === undefined ? defaultBanners : banners.length > 0 ? banners : []

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating) return
      setIsAnimating(true)
      setCurrentSlide(index)
      setTimeout(() => setIsAnimating(false), 500)
    },
    [isAnimating],
  )

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % displayBanners.length)
  }, [currentSlide, displayBanners.length, goToSlide])

  useEffect(() => {
    if (displayBanners.length > 1) {
      const timer = setInterval(() => {
        nextSlide()
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [displayBanners.length, nextSlide])

  if (displayBanners.length === 0) return null

  const currentBanner = displayBanners[currentSlide]

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#030712] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(59,130,246,0.32),transparent_34%),radial-gradient(circle_at_84%_14%,rgba(139,92,246,0.34),transparent_38%),radial-gradient(circle_at_60%_75%,rgba(34,211,238,0.24),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,7,16,0.45),rgba(5,7,16,0.9))]" />

      <div className="pointer-events-none absolute -left-24 top-20 hidden h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl lg:block" />
      <div className="pointer-events-none absolute -right-24 top-32 hidden h-72 w-72 rounded-full bg-violet-500/20 blur-3xl lg:block" />

      <div className="container relative z-10 mx-auto max-w-6xl px-4 md:px-6 py-18 md:py-24 lg:py-32">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <div className="space-y-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[11px] font-semibold tracking-[0.18em] uppercase backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse" />
              Shop premium experience
            </div>

            <div className="space-y-4">
              <h1 className="font-heading text-4xl font-semibold leading-[0.98] tracking-tight md:text-6xl lg:text-7xl xl:text-[5.2rem] text-balance">
                {currentBanner?.title || "Compra productos de nuestras marcas seleccionadas"}
              </h1>
              {currentBanner?.subtitle && (
                <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-200/90 md:text-xl lg:mx-0 text-pretty">
                  {currentBanner.subtitle}
                </p>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
              {currentBanner?.buttonText && (
                <a
                  href={currentBanner.link || "#"}
                  aria-label={currentBanner.buttonText}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300 px-6 py-3 text-sm font-semibold text-slate-900 shadow-[0_22px_50px_rgba(59,130,246,0.34)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(99,102,241,0.36)]"
                >
                  {currentBanner.buttonText}
                  <ChevronRightIcon className="h-4 w-4" />
                </a>
              )}
              <a
                href="/products"
                className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white/90 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/15 hover:text-white"
              >
                Ver catálogo completo
              </a>
            </div>

            {displayBanners.length > 1 && (
              <div className="flex items-center justify-center gap-2 lg:justify-start">
                {displayBanners.map((banner, index) => (
                  <button
                    key={banner.id}
                    onClick={() => goToSlide(index)}
                    aria-label={`Ir a slide ${index + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? "w-9 bg-white" : "w-2 bg-white/45 hover:bg-white/75"}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-55">
              <div className="h-[280px] w-[280px] md:h-[380px] md:w-[380px] lg:h-[460px] lg:w-[460px]">
                <MoonHero />
              </div>
            </div>

            {currentBanner?.image && (
              <div className="relative z-10 overflow-hidden rounded-[2rem] border border-white/20 bg-black/35 shadow-[0_35px_90px_rgba(37,99,235,0.34)] backdrop-blur-2xl">
                <div className="relative aspect-[16/10]">
                  <SmartImage
                    src={currentBanner.image}
                    alt={currentBanner.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 95vw, 45vw"
                    objectFit="cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050710]/70 via-[#050710]/20 to-transparent" />
                </div>
                <div className="absolute bottom-4 left-4 rounded-2xl border border-white/20 bg-black/45 px-4 py-2 text-xs text-white/90 backdrop-blur-xl md:text-sm">
                  Slide {currentSlide + 1} / {displayBanners.length}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
