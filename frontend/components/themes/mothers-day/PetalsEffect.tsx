"use client"

import { useEffect, useState, useMemo } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { mothersDayConfig } from "./themeConfig"

interface Petal {
  id: number
  x: number
  size: number
  duration: number
  delay: number
  opacity: number
  rotation: number
  drift: number
  color: string
}

export function PetalsEffect() {
  const [isVisible, setIsVisible] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const { petals, colors } = mothersDayConfig

  const petalColors = [
    colors.pink.soft,
    colors.pink.primary,
    colors.lavender.soft,
    colors.sage.soft,
  ]

  const floatingPetals = useMemo<Petal[]>(() => {
    return Array.from({ length: petals.particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: petals.minSize + Math.random() * (petals.maxSize - petals.minSize),
      duration: petals.minDuration + Math.random() * (petals.maxDuration - petals.minDuration),
      delay: Math.random() * 6,
      opacity: petals.minOpacity + Math.random() * (petals.maxOpacity - petals.minOpacity),
      rotation: Math.random() * 360,
      drift: (Math.random() - 0.5) * 150,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
    }))
  }, [petals])

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
      {floatingPetals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute"
          style={{
            left: `${petal.x}%`,
            top: -30,
            width: petal.size,
            height: petal.size * 0.6,
          }}
          initial={{ y: -30, x: 0, opacity: 0, rotate: petal.rotation }}
          animate={{
            y: ["0vh", "100vh"],
            x: [0, petal.drift, petal.drift * 0.5],
            opacity: [0, petal.opacity, petal.opacity, 0],
            rotate: [petal.rotation, petal.rotation + 180, petal.rotation + 360],
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* Petal shape */}
          <svg
            viewBox="0 0 20 12"
            fill={petal.color}
            style={{
              width: "100%",
              height: "100%",
              filter: `drop-shadow(0 2px 4px ${petal.color}40)`,
            }}
          >
            <ellipse cx="10" cy="6" rx="10" ry="6" />
          </svg>
        </motion.div>
      ))}
    </motion.div>
  )
}
