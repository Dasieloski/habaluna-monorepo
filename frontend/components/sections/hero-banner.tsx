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
  // Importante:
  // - `banners === undefined` => el componente no recibió datos, usar defaults (modo demo)
  // - `banners` es [] => no hay banners activos/configurados, NO usar defaults hardcodeados
  const displayBanners =
    banners === undefined ? defaultBanners : banners.length > 0 ? banners : []

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

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + displayBanners.length) % displayBanners.length)
  }, [currentSlide, displayBanners.length, goToSlide])

  useEffect(() => {
    if (displayBanners.length > 1) {
      const timer = setInterval(() => {
        nextSlide()
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [displayBanners.length, nextSlide])

  if (displayBanners.length === 0) {
    return null
  }

  const currentBanner = displayBanners[currentSlide]

  return (
    <section className="relative overflow-hidden bg-black text-white">
      {/* Luna 3D gigante en el fondo */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-80 z-0">
        <div className="w-[320px] h-[320px] md:w-[480px] md:h-[480px] lg:w-[560px] lg:h-[560px]">
          <MoonHero />
        </div>
      </div>

      {/* Degradado superior/inferior para integrar con el resto del sitio */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent pointer-events-none z-0" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none z-0" />

      <div className="container mx-auto max-w-6xl px-4 md:px-8 py-16 md:py-24 relative z-10">
        <div className="flex flex-col items-center text-center gap-6 md:gap-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs md:text-sm font-medium tracking-wide uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Envíos a Cuba sin complicaciones</span>
          </div>

          <div className="space-y-4 md:space-y-5 max-w-2xl">
            <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-balance">
              {currentBanner?.title || "Compra productos de nuestras marcas seleccionadas"}
            </h1>
            {currentBanner?.subtitle && (
              <p className="text-base md:text-lg text-slate-200/90 max-w-xl mx-auto text-pretty">
                {currentBanner.subtitle}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            {currentBanner?.buttonText && (
              <a
                href={currentBanner.link || "#"}
                aria-label={currentBanner.buttonText}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-black px-5 py-2.5 md:px-6 md:py-3 text-sm md:text-base font-medium shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:bg-slate-100 transition-colors"
              >
                {currentBanner.buttonText}
                <ChevronRightIcon className="w-4 h-4" />
              </a>
            )}
            <a
              href="/products"
              className="text-sm md:text-base font-medium text-slate-100/85 hover:text-white underline-offset-4 hover:underline"
            >
              Ver catálogo completo
            </a>
          </div>

          {/* Info de carrusel: indicador + descripción breve */}
          {displayBanners.length > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm text-slate-300/80">
              <span className="rounded-full bg-white/5 px-3 py-1 border border-white/10">
                {currentSlide + 1} / {displayBanners.length}
              </span>
              <span className="hidden sm:inline">
                Desliza o selecciona una categoría para ver más.
              </span>
            </div>
          )}
        </div>

        {/* Tarjeta del carrusel sobre la luna */}
        {currentBanner?.image && (
          <div className="mt-10 md:mt-14 flex justify-center">
            <div className="relative w-[260px] h-[160px] md:w-[360px] md:h-[200px] lg:w-[420px] lg:h-[220px] rounded-3xl bg-black/60 border border-white/15 shadow-[0_0_40px_rgba(255,255,255,0.05)] backdrop-blur-xl overflow-hidden aspect-video">
              <SmartImage
                src={currentBanner.image}
                alt={currentBanner.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 80vw, 40vw"
                objectFit="cover"
                priority
              />
            </div>
          </div>
        )}

        {/* Dots de navegación del carrusel */}
        {displayBanners.length > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            {displayBanners.map((banner, index) => (
              <button
                key={banner.id}
                onClick={() => goToSlide(index)}
                aria-label={`Ir a slide ${index + 1}`}
                aria-current={index === currentSlide ? "true" : "false"}
                className={`h-1.5 rounded-full transition-all duration-200 ${index === currentSlide ? "bg-white w-6" : "bg-white/40 w-1.5 hover:bg-white/70"
                  }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
