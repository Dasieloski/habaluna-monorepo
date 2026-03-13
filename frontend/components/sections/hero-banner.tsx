"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronRightIcon } from "@/components/icons/streamline-icons"
import { SmartImage } from "@/components/ui/smart-image"

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
  const [isLoaded, setIsLoaded] = useState(false)
  const displayBanners = banners === undefined ? defaultBanners : banners.length > 0 ? banners : []

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating) return
      setIsAnimating(true)
      setCurrentSlide(index)
      setTimeout(() => setIsAnimating(false), 700)
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
      }, 7000)
      return () => clearInterval(timer)
    }
  }, [displayBanners.length, nextSlide])

  if (displayBanners.length === 0) return null

  const currentBanner = displayBanners[currentSlide]

  return (
    <section className="relative h-screen max-h-[900px] min-h-[500px] overflow-hidden text-white"
    >
      {/* Full-width carousel background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-950/80 to-slate-950/95" />
      
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-blue-500/15 blur-3xl animate-float" />
        <div className="absolute -bottom-40 right-1/4 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      {/* Main carousel container - full width image with overlayed content */}
      <div className="relative h-full w-full overflow-hidden">
        {/* Image carousel - fills entire container */}
        {currentBanner?.image && (
          <div 
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              opacity: isAnimating ? 0 : 1,
            }}
          >
            <SmartImage
              src={currentBanner.image}
              alt={currentBanner.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
              objectFit="cover"
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/30 to-slate-950/60" />
          </div>
        )}

        {/* Content overlay - centered text and CTAs */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 md:px-8">
          <div className="max-w-3xl text-center space-y-8">
            {/* Headline */}
            <div className="space-y-4">
              <h1 
                className={`font-heading text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-white text-balance transition-all duration-700 ${
                  isLoaded && !isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                {currentBanner?.title || "Compra productos premium"}
              </h1>

              {/* Subtitle */}
              {currentBanner?.subtitle && (
                <p 
                  className={`text-lg md:text-xl text-white/80 leading-relaxed transition-all duration-700 ${
                    isLoaded && !isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{
                    transitionDelay: "0.1s",
                  }}
                >
                  {currentBanner.subtitle}
                </p>
              )}
            </div>

            {/* CTA Buttons */}
            <div 
              className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 ${
                isLoaded && !isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: "0.2s",
              }}
            >
              {currentBanner?.buttonText && (
                <a
                  href={currentBanner.link || "#"}
                  aria-label={currentBanner.buttonText}
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 px-8 py-4 text-base font-semibold text-slate-900 transition-all duration-300 hover:scale-105 hover:shadow-[0_24px_48px_rgba(59,130,246,0.35)] active:scale-95"
                >
                  {currentBanner.buttonText}
                  <ChevronRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </a>
              )}
              <a
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 backdrop-blur-xl px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:bg-white/20 hover:border-white/60 hover:scale-105 active:scale-95"
              >
                Ver Catálogo
              </a>
            </div>

            {/* Slide indicators - bottom of hero */}
            {displayBanners.length > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                {displayBanners.map((banner, index) => (
                  <button
                    key={banner.id}
                    onClick={() => goToSlide(index)}
                    aria-label={`Ir a slide ${index + 1}`}
                    className={`transition-all duration-500 rounded-full ${
                      index === currentSlide 
                        ? "w-8 h-2 bg-gradient-to-r from-cyan-400 to-blue-400" 
                        : "w-2 h-2 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}
