"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { christmasConfig } from "./themeConfig"

export function AmbientLights() {
  const [isVisible, setIsVisible] = useState(false)
  const { colors, animation } = christmasConfig

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 800)
    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[9995]" aria-hidden="true">
      {/* Warm ambient glow from top */}
      <motion.div
        className="absolute top-0 left-0 right-0"
        style={{
          height: '40vh',
          background: `radial-gradient(ellipse at top center,
            ${colors.goldGlow} 0%,
            ${colors.pineGlow} 30%,
            transparent 70%
          )`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: animation.slower, ease: animation.easing }}
      />

      {/* Corner accent lights */}
      <motion.div
        className="absolute top-4 left-4 w-32 h-32"
        style={{
          background: `radial-gradient(circle, ${colors.goldGlow} 0%, transparent 70%)`,
          borderRadius: '50%',
        }}
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: Math.max(1, 6),
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-4 right-4 w-24 h-24"
        style={{
          background: `radial-gradient(circle, ${colors.cranberryGlow} 0%, transparent 70%)`,
          borderRadius: '50%',
        }}
        animate={{
          opacity: [0.15, 0.3, 0.15],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: Math.max(1, 8),
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      <motion.div
        className="absolute bottom-4 left-4 w-28 h-28"
        style={{
          background: `radial-gradient(circle, ${colors.pineGlow} 0%, transparent 70%)`,
          borderRadius: '50%',
        }}
        animate={{
          opacity: [0.1, 0.25, 0.1],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: Math.max(1, 10),
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />

      {/* Subtle floating particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            backgroundColor: i % 3 === 0 ? colors.gold : i % 3 === 1 ? colors.cranberry : colors.pine,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.3,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.random() * 10 - 5, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: Math.max(1, 8 + Math.random() * 4),
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.max(0, i * 0.5),
          }}
        />
      ))}
    </div>
  )
}