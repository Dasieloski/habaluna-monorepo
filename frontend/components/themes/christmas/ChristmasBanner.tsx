"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { christmasConfig } from "./themeConfig"

interface ChristmasBannerProps {
  message?: string
  subMessage?: string
  ctaText?: string
  onCtaClick?: () => void
}

export function ChristmasBanner({
  message = "Season's Greetings",
  subMessage = "Discover our holiday collection with exclusive offers",
  ctaText = "Shop Now",
  onCtaClick,
}: ChristmasBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const { banner, colors } = christmasConfig

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
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-6 right-6 z-[9999] max-w-sm"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          role="complementary"
          aria-label="Seasonal promotion"
        >
          <div
            className="relative overflow-hidden rounded-2xl shadow-2xl border"
            style={{
              background: `linear-gradient(135deg, ${colors.green.deep} 0%, ${colors.red.deep} 100%)`,
              borderColor: colors.gold.muted,
            }}
          >
            {/* Shimmer effect */}
            {!prefersReducedMotion && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(110deg, transparent 30%, ${colors.gold.shimmer} 50%, transparent 70%)`,
                }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut",
                }}
              />
            )}

            {/* Gold accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-0.5"
              style={{
                background: `linear-gradient(90deg, transparent, ${colors.gold.primary}, transparent)`,
              }}
            />

            <div className="relative p-5 pr-10">
              {/* Star icon */}
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: colors.gold.muted }}
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill={colors.gold.primary}
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className="text-base font-semibold tracking-wide"
                    style={{ color: colors.snow.pure }}
                  >
                    {message}
                  </h3>
                  <p
                    className="text-sm mt-1 leading-relaxed"
                    style={{ color: colors.snow.muted }}
                  >
                    {subMessage}
                  </p>

                  {/* CTA Button with glow */}
                  <motion.button
                    onClick={onCtaClick}
                    className="mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: colors.gold.primary,
                      color: colors.green.deep,
                    }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: `0 0 20px ${colors.gold.shimmer}`,
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {ctaText}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Dismiss button */}
            {banner.dismissible && (
              <motion.button
                onClick={handleDismiss}
                className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full transition-colors"
                style={{ color: colors.snow.muted }}
                whileHover={{ 
                  color: colors.snow.pure,
                  background: "rgba(255,255,255,0.1)",
                }}
                aria-label="Dismiss"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.button>
            )}

            {/* Decorative corner elements */}
            <div
              className="absolute bottom-0 left-0 w-16 h-16 opacity-10"
              style={{
                background: `radial-gradient(circle at bottom left, ${colors.gold.primary}, transparent 70%)`,
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
