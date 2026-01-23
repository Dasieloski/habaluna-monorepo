"use client"

import { useEffect, useState, useMemo } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { christmasConfig } from "./themeConfig"

interface Snowflake {
  id: number
  x: number
  size: number
  duration: number
  delay: number
  opacity: number
  drift: number
}

export function SnowEffect() {
  const [isVisible, setIsVisible] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const { snow, colors } = christmasConfig

  const snowflakes = useMemo<Snowflake[]>(() => {
    return Array.from({ length: snow.particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: snow.minSize + Math.random() * (snow.maxSize - snow.minSize),
      duration: snow.minDuration + Math.random() * (snow.maxDuration - snow.minDuration),
      delay: Math.random() * 5,
      opacity: snow.minOpacity + Math.random() * (snow.maxOpacity - snow.minOpacity),
      drift: (Math.random() - 0.5) * 100,
    }))
  }, [snow])

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
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute rounded-full"
          style={{
            left: `${flake.x}%`,
            top: -20,
            width: flake.size,
            height: flake.size,
            background: `radial-gradient(circle at 30% 30%, ${colors.snow.pure}, ${colors.snow.soft})`,
            boxShadow: `0 0 ${flake.size * 2}px ${colors.snow.muted}`,
          }}
          initial={{ y: -20, x: 0, opacity: 0 }}
          animate={{
            y: ["0vh", "100vh"],
            x: [0, flake.drift, 0],
            opacity: [0, flake.opacity, flake.opacity, 0],
          }}
          transition={{
            duration: flake.duration,
            delay: flake.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </motion.div>
  )
}
