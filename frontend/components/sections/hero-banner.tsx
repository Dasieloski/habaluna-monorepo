"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
  const [scrollY, setScrollY] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const displayBanners = banners === undefined ? defaultBanners : banners.length > 0 ? banners : []
  const parallaxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const rect = parallaxRef.current.getBoundingClientRect()
        if (rect.top < window.innerHeight) {
          setScrollY(Math.max(0, -rect.top * 0.5))
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating) return
      setIsAnimating(true)
      setCurrentSlide(index)
      setTimeout(() => setIsAnimating(false), 600)
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
      }, 6000)
      return () => clearInterval(timer)
    }
  }, [displayBanners.length, nextSlide])

  if (displayBanners.length === 0) return null

  const currentBanner = displayBanners[currentSlide]

  return (
    <section 
      ref={parallaxRef}
      className="relative overflow-hidden text-white"
      style={{
        background: "linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(5, 7, 16, 0.95) 100%)",
      }}
    >
      {/* Soft gradient background layer */}
      <div 
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          background: `linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, transparent 40%, rgba(139, 92, 246, 0.12) 100%)`,
          opacity: isLoaded ? 1 : 0,
        }}
      />

      {/* Animated radial gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div 
          className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"
          style={{
            animation: "float 8s ease-in-out infinite",
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        />
        <div 
          className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl"
          style={{
            animation: "float 10s ease-in-out infinite 2s",
            transform: `translateY(${scrollY * 0.2}px)`,
          }}
        />
        <div 
          className="absolute left-1/2 -bottom-32 h-80 w-80 rounded-full bg-cyan-500/8 blur-3xl"
          style={{
            animation: "float 12s ease-in-out infinite 4s",
            transform: `translateY(${scrollY * 0.1}px)`,
          }}
        />
      </div>

      {/* Premium glassmorphism gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.08),transparent_50%)]" />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeSlideOut {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-24px);
          }
        }
        .hero-animate-in {
          animation: fadeSlideIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .hero-animate-out {
          animation: fadeSlideOut 0.4s ease-out forwards;
        }
      `}</style>

      <div className="container relative z-20 mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-24 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-12">
          {/* Content Section */}
          <div className="space-y-8">
            {/* Premium Badge */}
            <div 
              className={`inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/[0.05] px-5 py-3 backdrop-blur-2xl transition-all duration-700 ${
                isLoaded ? "hero-animate-in opacity-100" : "opacity-0"
              }`}
              style={{
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 8px 32px rgba(59, 130, 246, 0.1)",
              }}
            >
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-widest text-white/80 uppercase">Experiencia Premium</span>
            </div>

            {/* Headline */}
            <div className="space-y-5">
              <h1 
                className={`font-heading text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-white text-balance transition-all duration-700 ${
                  isLoaded ? "hero-animate-in opacity-100" : "opacity-0"
                }`}
                style={{
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(200, 230, 255, 0.85) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {currentBanner?.title || "Compra productos premium"}
              </h1>

              {/* Subtitle */}
              {currentBanner?.subtitle && (
                <p 
                  className={`text-lg md:text-xl text-white/70 leading-relaxed max-w-xl transition-all duration-700 ${
                    isLoaded ? "hero-animate-in opacity-100" : "opacity-0"
                  }`}
                  style={{
                    animationDelay: "0.1s",
                  }}
                >
                  {currentBanner.subtitle}
                </p>
              )}
            </div>

            {/* CTA Buttons */}
            <div 
              className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 ${
                isLoaded ? "hero-animate-in opacity-100" : "opacity-0"
              }`}
              style={{
                animationDelay: "0.2s",
              }}
            >
              {currentBanner?.buttonText && (
                <a
                  href={currentBanner.link || "#"}
                  aria-label={currentBanner.buttonText}
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 px-8 py-4 text-base font-semibold text-slate-900 transition-all duration-300 hover:scale-105 hover:shadow-[0_24px_48px_rgba(59,130,246,0.35)] active:scale-95"
                  style={{
                    boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
                  }}
                >
                  {currentBanner.buttonText}
                  <ChevronRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </a>
              )}
              <a
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/[0.08] px-8 py-4 text-base font-semibold text-white transition-all duration-300 backdrop-blur-xl hover:bg-white/15 hover:border-white/60 hover:scale-105 active:scale-95"
                style={{
                  boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 8px 24px rgba(255, 255, 255, 0.05)",
                }}
              >
                Ver Catálogo
              </a>
            </div>

            {/* Slide Indicators */}
            {displayBanners.length > 1 && (
              <div 
                className={`flex items-center gap-3 transition-all duration-700 ${
                  isLoaded ? "hero-animate-in opacity-100" : "opacity-0"
                }`}
                style={{
                  animationDelay: "0.3s",
                }}
              >
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

          {/* Image Section */}
          <div className="relative h-full min-h-[500px] lg:min-h-[600px]">
            {/* Decorative floating elements */}
            <div 
              className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"
              style={{
                animation: "float 8s ease-in-out infinite",
              }}
            />
            <div 
              className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-violet-500/10 blur-3xl pointer-events-none"
              style={{
                animation: "float 10s ease-in-out infinite 2s",
              }}
            />

            {/* 3D Background */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
              <div className="h-[320px] w-[320px] md:h-[420px] md:w-[420px] lg:h-[500px] lg:w-[500px]">
                <MoonHero />
              </div>
            </div>

            {/* Glassmorphism Image Panel */}
            {currentBanner?.image && (
              <div 
                className={`relative z-10 overflow-hidden rounded-2xl transition-all duration-600 h-full ${
                  isAnimating ? "hero-animate-out" : "hero-animate-in"
                }`}
                style={{
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  background: "rgba(15, 23, 42, 0.4)",
                  backdropFilter: "blur(24px)",
                  boxShadow: "0 28px 64px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                }}
              >
                <div className="relative w-full h-full">
                  <SmartImage
                    src={currentBanner.image}
                    alt={currentBanner.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 95vw, 45vw"
                    objectFit="cover"
                    priority
                  />
                  {/* Premium gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-slate-900/10 to-transparent" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
