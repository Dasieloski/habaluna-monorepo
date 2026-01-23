"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { mothersDayConfig } from "./themeConfig"

interface MothersDayBannerProps {
  message?: string
  subMessage?: string
  ctaText?: string
  onCtaClick?: () => void
}

export function MothersDayBanner({
  message = "Celebrate Mom",
  subMessage = "Find the perfect gift to show her how much you care",
  ctaText = "Shop Gifts",
  onCtaClick,
}: MothersDayBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const { banner, colors } = mothersDayConfig

  useEffect(() => {
    const dismissed = sessionStorage.getItem("mothers-day-banner-dismissed")
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
      sessionStorage.setItem("mothers-day-banner-dismissed", "true")
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
          aria-label="Mother's Day promotion"
        >
          <div
            className="relative overflow-hidden rounded-2xl shadow-2xl border"
            style={{
              background: `linear-gradient(135deg, ${colors.pink.deep} 0%, ${colors.lavender.deep} 100%)`,
              borderColor: colors.gold.shimmer,
            }}
          >
            {/* Shimmer effect */}
            {!prefersReducedMotion && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(110deg, transparent 30%, ${colors.cream.muted} 50%, transparent 70%)`,
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
              <div className="flex items-start gap-4">
                {/* Flower icon */}
                <motion.div
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: colors.pink.muted }}
                  animate={
                    prefersReducedMotion
                      ? {}
                      : {
                          scale: [1, 1.05, 1],
                        }
                  }
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill={colors.pink.soft}
                  >
                    {/* Flower */}
                    <circle cx="12" cy="12" r="3" fill={colors.gold.primary} />
                    <ellipse cx="12" cy="6" rx="2.5" ry="4" />
                    <ellipse cx="12" cy="18" rx="2.5" ry="4" />
                    <ellipse cx="6" cy="12" rx="4" ry="2.5" />
                    <ellipse cx="18" cy="12" rx="4" ry="2.5" />
                  </svg>
                </motion.div>

                <div className="flex-1 min-w-0">
                  <h3
                    className="text-base font-semibold tracking-wide"
                    style={{ color: colors.cream.pure }}
                  >
                    {message}
                  </h3>
                  <p
                    className="text-sm mt-1 leading-relaxed"
                    style={{ color: colors.cream.muted }}
                  >
                    {subMessage}
                  </p>

                  {/* CTA Button */}
                  <motion.button
                    onClick={onCtaClick}
                    className="mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: colors.cream.pure,
                      color: colors.pink.deep,
                    }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: `0 0 20px ${colors.cream.muted}`,
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
                style={{ color: colors.cream.muted }}
                whileHover={{
                  color: colors.cream.pure,
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

            {/* Decorative petals */}
            <div
              className="absolute bottom-0 right-0 w-20 h-20 opacity-20 pointer-events-none"
              style={{
                background: `radial-gradient(circle at bottom right, ${colors.lavender.soft}, transparent 70%)`,
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
