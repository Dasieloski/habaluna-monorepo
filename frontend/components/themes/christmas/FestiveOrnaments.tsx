"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { christmasConfig } from "./themeConfig"

interface Ornament {
  id: number
  type: 'star' | 'bell' | 'candy' | 'snowflake'
  x: number
  y: number
  size: number
  rotation: number
  delay: number
  color: string
}

export function FestiveOrnaments() {
  const [isVisible, setIsVisible] = useState(false)
  const { ornaments, colors, animation } = christmasConfig

  const festiveOrnaments = useMemo<Ornament[]>(() => {
    return Array.from({ length: ornaments.count }, (_, i) => ({
      id: i,
      type: ornaments.types[Math.floor(Math.random() * ornaments.types.length)] as any,
      x: Math.random() * 90 + 5, // 5% to 95% to avoid edges
      y: Math.random() * 80 + 10, // 10% to 90% to avoid header/footer
      size: ornaments.minSize + Math.random() * (ornaments.maxSize - ornaments.minSize),
      rotation: Math.random() * 360,
      delay: i * ornaments.animationDelay,
      color: Math.random() > 0.5 ? colors.gold : colors.cranberry,
    }))
  }, [ornaments, colors])

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const getOrnamentSymbol = (type: string) => {
    switch (type) {
      case 'star': return '⭐'
      case 'bell': return '🔔'
      case 'candy': return '🍬'
      case 'snowflake': return '❄️'
      default: return '✨'
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[9996]" aria-hidden="true">
      {festiveOrnaments.map((ornament) => (
        <motion.div
          key={ornament.id}
          className="absolute"
          style={{
            left: `${ornament.x}%`,
            top: `${ornament.y}%`,
            fontSize: `${ornament.size}px`,
            color: ornament.color,
            filter: ornaments.glowEffect ? `drop-shadow(0 0 4px ${ornament.color})` : 'none',
          }}
          initial={{
            scale: 0,
            rotate: ornament.rotation,
            opacity: 0
          }}
          animate={{
            scale: [0, 1.2, 1],
            rotate: [ornament.rotation, ornament.rotation + 10, ornament.rotation - 5, ornament.rotation],
            opacity: [0, 0.8, 1],
          }}
          transition={{
            duration: animation.normal,
            delay: ornament.delay / 1000,
            ease: animation.bounce,
          }}
        >
          <motion.span
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: ornament.delay / 1000,
            }}
          >
            {getOrnamentSymbol(ornament.type)}
          </motion.span>
        </motion.div>
      ))}
    </div>
  )
}