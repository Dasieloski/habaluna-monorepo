"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { christmasConfig } from "./themeConfig"

interface Snowflake {
  id: number
  x: number
  size: number
  duration: number
  delay: number
  opacity: number
  windOffset: number
  rotation: number
  glow: boolean
}

export function SnowEffect() {
  const [isVisible, setIsVisible] = useState(false)
  const { snow, colors, animation, performance } = christmasConfig

  const snowflakes = useMemo<Snowflake[]>(() => {
    return Array.from({ length: snow.particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: snow.minSize + Math.random() * (snow.maxSize - snow.minSize),
      duration: snow.minDuration + Math.random() * (snow.maxDuration - snow.minDuration),
      delay: Math.random() * snow.maxDuration,
      opacity: snow.minOpacity + Math.random() * (snow.maxOpacity - snow.minOpacity),
      windOffset: (Math.random() - 0.5) * snow.windStrength * 100,
      rotation: Math.random() * 360,
      glow: Math.random() > 0.7, // 30% of snowflakes glow
    }))
  }, [snow])

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200)
    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-[9998]"
      aria-hidden="true"
      style={{
        willChange: performance.useHardwareAcceleration ? 'transform' : 'auto'
      }}
    >
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute rounded-full"
          style={{
            left: `${flake.x}%`,
            top: "-10px",
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            background: flake.glow
              ? `radial-gradient(circle, ${colors.snowGlow} 0%, ${colors.snow} 70%, transparent 100%)`
              : colors.snow,
            boxShadow: flake.glow
              ? `0 0 ${flake.size * 0.5}px ${colors.snowGlow}`
              : 'none',
            willChange: 'transform',
          }}
          initial={{ y: -10, rotate: flake.rotation }}
          animate={{
            y: ["0vh", "50vh", "100vh"],
            x: [0, flake.windOffset, flake.windOffset * 0.5],
            rotate: [flake.rotation, flake.rotation + 180, flake.rotation + 360],
            opacity: [0, flake.opacity, 0],
          }}
          transition={{
            duration: flake.duration,
            delay: flake.delay,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
          }}
        />
      ))}

      {/* Ambient snow glow effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top, ${colors.snowShadow} 0%, transparent 50%)`,
          opacity: 0.1,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: animation.slow, ease: animation.easing }}
      />
    </div>
  )
}
