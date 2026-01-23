"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { christmasConfig } from "./themeConfig"

interface ChristmasBannerProps {
  message?: string
  subMessage?: string
}

export function ChristmasBanner({
  message = "¡Feliz Navidad! 🎄",
  subMessage = "Descubre nuestras ofertas especiales",
}: ChristmasBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [showSparkle, setShowSparkle] = useState(false)
  const { banner, colors, animation } = christmasConfig

  useEffect(() => {
    const dismissed = sessionStorage.getItem("christmas-banner-dismissed")
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    const timer = setTimeout(() => {
      setIsVisible(true)
      // Trigger sparkle animation after banner appears
      setTimeout(() => setShowSparkle(true), 500)
    }, banner.delayMs)

    return () => clearTimeout(timer)
  }, [banner.delayMs])

  const handleDismiss = () => {
    setIsVisible(false)
    setShowSparkle(false)
    setTimeout(() => {
      setIsDismissed(true)
      sessionStorage.setItem("christmas-banner-dismissed", "true")
    }, 400)
  }

  // Auto-hide after delay
  useEffect(() => {
    if (isVisible && banner.autoHideDelay) {
      const autoHideTimer = setTimeout(() => {
        handleDismiss()
      }, banner.autoHideDelay)

      return () => clearTimeout(autoHideTimer)
    }
  }, [isVisible, banner.autoHideDelay])

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          className="fixed bottom-6 right-6 z-[9999] max-w-sm"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={isVisible ? {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
              type: "spring",
              stiffness: 200,
              damping: 20,
              duration: animation.normal,
            }
          } : {}}
          exit={{
            opacity: 0,
            y: 10,
            scale: 0.95,
            transition: { duration: animation.fast }
          }}
          role="complementary"
          aria-label="Mensaje festivo de Navidad"
        >
          <div
            className="relative overflow-hidden shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.surfaceLight} 100%)`,
              backdropFilter: `blur(${banner.blurStrength})`,
              borderRadius: banner.cornerRadius,
              border: `1px solid ${colors.goldMuted}`,
              boxShadow: `
                0 20px 40px rgba(0,0,0,0.3),
                0 0 60px ${colors.goldGlow},
                inset 0 1px 0 rgba(255,255,255,0.1)
              `,
            }}
          >
            {/* Animated border glow */}
            <motion.div
              className="absolute inset-0 rounded-xl"
              style={{
                background: `linear-gradient(45deg,
                  transparent 0%,
                  ${colors.goldGlow} 25%,
                  transparent 50%,
                  ${colors.pineGlow} 75%,
                  transparent 100%
                )`,
                backgroundSize: '200% 200%',
              }}
              animate={{
                backgroundPosition: ['0% 0%', '200% 200%', '0% 0%'],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* Sparkle effects */}
            {showSparkle && (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                    style={{
                      top: `${20 + Math.random() * 60}%`,
                      left: `${20 + Math.random() * 60}%`,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  />
                ))}
              </>
            )}

            {/* Top accent with animated gradient */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-0.5"
              style={{
                background: `linear-gradient(90deg,
                  transparent 0%,
                  ${colors.gold} 20%,
                  ${colors.goldLight} 50%,
                  ${colors.gold} 80%,
                  transparent 100%
                )`,
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            <div className="relative p-5 pr-12">
              {/* Icon and title */}
              <motion.div
                className="flex items-center gap-3 mb-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: animation.fast }}
              >
                <motion.div
                  className="text-2xl"
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 5,
                    ease: "easeInOut",
                  }}
                >
                  🎄
                </motion.div>
                <div>
                  <h3
                    className="text-lg font-bold tracking-wide"
                    style={{ color: colors.cream }}
                  >
                    ¡Feliz Navidad!
                  </h3>
                  <div
                    className="w-12 h-0.5 mt-1"
                    style={{ background: colors.gold }}
                  />
                </div>
              </motion.div>

              {/* Main message */}
              <motion.p
                className="text-sm font-medium leading-relaxed mb-2"
                style={{ color: colors.creamLight }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: animation.fast }}
              >
                {message}
              </motion.p>

              {/* Sub message */}
              <motion.p
                className="text-xs leading-relaxed"
                style={{ color: colors.ivory }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: animation.fast }}
              >
                {subMessage}
              </motion.p>

              {/* Festive elements */}
              <motion.div
                className="absolute bottom-3 right-3 text-lg opacity-80"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                ✨
              </motion.div>
            </div>

            {/* Dismiss button */}
            {banner.dismissible && (
              <motion.button
                onClick={handleDismiss}
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
                style={{
                  background: colors.surfaceLight,
                  color: colors.cream,
                  boxShadow: `0 2px 8px rgba(0,0,0,0.2)`,
                }}
                whileHover={{
                  backgroundColor: colors.goldMuted,
                  scale: 1.1,
                }}
                whileTap={{ scale: 0.95 }}
                aria-label="Cerrar mensaje festivo"
              >
                <motion.svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  animate={{ rotate: isVisible ? 0 : 180 }}
                  transition={{ duration: animation.fast }}
                >
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
