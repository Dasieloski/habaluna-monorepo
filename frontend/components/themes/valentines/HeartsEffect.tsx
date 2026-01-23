"use client"

import { useEffect, useState, useMemo } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { valentinesConfig } from "./themeConfig"

interface Heart {
  id: number
  x: number
  size: number
  duration: number
  delay: number
  opacity: number
  rotation: number
  color: string
}

export function HeartsEffect() {
  const [isVisible, setIsVisible] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const { hearts, colors } = valentinesConfig

  const floatingHearts = useMemo<Heart[]>(() => {
    const heartColors = [
      colors.rose.primary,
      colors.rose.light,
      colors.blush.primary,
      colors.blush.light,
    ]
    return Array.from({ length: hearts.particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: hearts.minSize + Math.random() * (hearts.maxSize - hearts.minSize),
      duration: hearts.minDuration + Math.random() * (hearts.maxDuration - hearts.minDuration),
      delay: Math.random() * 8,
      opacity: hearts.minOpacity + Math.random() * (hearts.maxOpacity - hearts.minOpacity),
      rotation: Math.random() * 40 - 20,
      color: heartColors[Math.floor(Math.random() * heartColors.length)],
    }))
  }, [hearts, colors])

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200)
    return () => clearTimeout(timer)
  }, [])

  if (prefersReducedMotion) return null

  return (
    <motion.div
      className="fixed inset-0 overflow-hidden pointer-events-none z-[9998]"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 1 }}
      aria-hidden="true"
    >
      {floatingHearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute"
          style={{
            left: `${heart.x}%`,
            top: -30,
          }}
          initial={{ y: -30, rotate: heart.rotation, opacity: 0 }}
          animate={{
            y: ["0vh", "100vh"],
            rotate: [heart.rotation, heart.rotation + 20, heart.rotation - 20, heart.rotation],
            opacity: [0, heart.opacity, heart.opacity, 0],
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <svg
            width={heart.size}
            height={heart.size}
            viewBox="0 0 24 24"
            fill={heart.color}
            style={{
              filter: `drop-shadow(0 0 ${heart.size / 3}px ${heart.color}40)`,
            }}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>
      ))}
    </motion.div>
  )
}
