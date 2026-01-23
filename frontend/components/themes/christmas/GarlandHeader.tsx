"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { christmasConfig } from "./themeConfig"

interface Light {
  id: number
  x: number
  color: string
  delay: number
  twinkleDuration: number
}

export function GarlandHeader() {
  const [isVisible, setIsVisible] = useState(false)
  const { garland, colors, animation } = christmasConfig

  const lights = useMemo<Light[]>(() => {
    return Array.from({ length: garland.lightCount }, (_, i) => ({
      id: i,
      x: (i / (garland.lightCount - 1)) * 100, // Distribute evenly across width
      color: garland.colors[i % garland.colors.length],
      delay: (i * garland.twinkleSpeed) / garland.lightCount,
      twinkleDuration: garland.twinkleSpeed + Math.random() * 1000,
    }))
  }, [garland])

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 pointer-events-none z-[9997]"
      aria-hidden="true"
      style={{
        height: `${garland.height + 8}px`, // Extra space for glow
      }}
    >
      {/* Base garland strand */}
      <motion.div
        className="absolute top-0 left-0 right-0"
        style={{
          height: `${garland.height}px`,
          background: `linear-gradient(90deg,
            transparent 0%,
            ${colors.pine} 10%,
            ${colors.pineLight} 20%,
            ${colors.gold} 50%,
            ${colors.pineLight} 80%,
            ${colors.pine} 90%,
            transparent 100%
          )`,
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{
          duration: animation.normal,
          ease: animation.easing,
        }}
      />

      {/* Twinkling lights */}
      {lights.map((light) => (
        <motion.div
          key={light.id}
          className="absolute top-1/2 transform -translate-y-1/2 rounded-full"
          style={{
            left: `${light.x}%`,
            width: "6px",
            height: "6px",
            backgroundColor: light.color,
            boxShadow: `0 0 8px ${light.color}`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 1.2, 1],
            opacity: [0, 0.6, garland.intensity, 0.6],
          }}
          transition={{
            scale: {
              duration: Math.max(0.1, animation.fast),
              delay: Math.max(0, light.delay / 1000),
            },
            opacity: {
              duration: Math.max(0.5, light.twinkleDuration / 1000),
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: Math.max(0, light.delay / 1000),
            },
          }}
        />
      ))}

      {/* Subtle glow effect */}
      <motion.div
        className="absolute top-0 left-0 right-0"
        style={{
          height: `${garland.height + 4}px`,
          background: `linear-gradient(90deg,
            transparent 0%,
            rgba(212, 175, 55, 0.1) 20%,
            rgba(212, 175, 55, 0.2) 50%,
            rgba(212, 175, 55, 0.1) 80%,
            transparent 100%
          )`,
          filter: 'blur(2px)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: animation.slow,
          delay: animation.normal,
        }}
      />

      {/* Festive ribbon elements */}
      <motion.div
        className="absolute top-0 left-1/4 transform -translate-x-1/2"
        style={{
          width: "20px",
          height: `${garland.height + 2}px`,
          background: `linear-gradient(180deg, ${colors.cranberry} 0%, ${colors.cranberryLight} 100%)`,
          clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
        }}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 0.8 }}
        transition={{
          duration: animation.normal,
          delay: animation.fast,
          ease: animation.bounce,
        }}
      />

      <motion.div
        className="absolute top-0 right-1/4 transform translate-x-1/2"
        style={{
          width: "20px",
          height: `${garland.height + 2}px`,
          background: `linear-gradient(180deg, ${colors.cranberry} 0%, ${colors.cranberryLight} 100%)`,
          clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
        }}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 0.8 }}
        transition={{
          duration: animation.normal,
          delay: animation.fast,
          ease: animation.bounce,
        }}
      />
    </div>
  )
}
