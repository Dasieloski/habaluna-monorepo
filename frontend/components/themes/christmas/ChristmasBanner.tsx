"use client"

import { useState, useEffect } from "react"
import { christmasConfig } from "./themeConfig"

interface ChristmasBannerProps {
  message?: string
  subMessage?: string
}

export function ChristmasBanner({
  message = "Season's Greetings",
  subMessage = "Enjoy our holiday collection",
}: ChristmasBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const { banner, colors, animation } = christmasConfig

  useEffect(() => {
    const dismissed = sessionStorage.getItem("christmas-banner-dismissed")
    if (dismissed) {
      setIsDismissed(true)
      return
    }
    const timer = setTimeout(() => setIsVisible(true), banner.delayMs)
    return () => clearTimeout(timer)
  }, [banner.delayMs])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => {
      setIsDismissed(true)
      sessionStorage.setItem("christmas-banner-dismissed", "true")
    }, 300)
  }

  if (isDismissed) return null

  return (
    <div
      className="fixed bottom-5 right-5 z-[9999] max-w-xs"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(8px)",
        transition: `all ${animation.normal} ${animation.easing}`,
      }}
      role="complementary"
      aria-label="Seasonal message"
    >
      <div
        className="relative overflow-hidden rounded-xl shadow-lg"
        style={{
          background: colors.surface,
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Top accent */}
        <div 
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: colors.goldMuted }}
        />
        
        <div className="p-4 pr-9">
          <p 
            className="text-sm font-medium tracking-wide"
            style={{ color: "rgba(255,255,255,0.95)" }}
          >
            {message}
          </p>
          <p 
            className="text-xs mt-1 leading-relaxed"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            {subMessage}
          </p>
        </div>

        {banner.dismissible && (
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center rounded-full transition-colors"
            style={{ 
              color: "rgba(255,255,255,0.4)",
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.8)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
            aria-label="Dismiss"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
