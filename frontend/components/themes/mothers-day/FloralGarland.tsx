"use client"

import { useMemo } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { mothersDayConfig } from "./themeConfig"

interface Flower {
  id: number
  x: number
  color: string
  delay: number
  size: number
  type: "flower" | "leaf"
}

export function FloralGarland() {
  const prefersReducedMotion = useReducedMotion()
  const { colors, garland } = mothersDayConfig

  const flowers = useMemo<Flower[]>(() => {
    return Array.from({ length: garland.flowerCount }, (_, i) => ({
      id: i,
      x: (i / garland.flowerCount) * 100,
      color: garland.colors[i % garland.colors.length],
      delay: i * 0.08,
      size: 10 + Math.random() * 6,
      type: i % 3 === 0 ? "leaf" : "flower",
    }))
  }, [garland])

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-14 pointer-events-none z-[9997] overflow-visible"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      aria-hidden="true"
    >
      {/* Vine/stem line */}
      <svg
        className="absolute top-0 left-0 w-full h-14"
        viewBox="0 0 1200 56"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="vineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.sage.deep} stopOpacity="0" />
            <stop offset="20%" stopColor={colors.sage.primary} />
            <stop offset="50%" stopColor={colors.sage.deep} />
            <stop offset="80%" stopColor={colors.sage.primary} />
            <stop offset="100%" stopColor={colors.sage.deep} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Main vine */}
        <path
          d="M0,8 Q150,22 300,12 T600,18 T900,12 T1200,8"
          stroke="url(#vineGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Secondary vine */}
        <path
          d="M0,6 Q150,18 300,10 T600,14 T900,10 T1200,6"
          stroke={colors.sage.soft}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
          fill="none"
        />
      </svg>

      {/* Flowers and leaves */}
      {flowers.map((flower) => (
        <motion.div
          key={flower.id}
          className="absolute"
          style={{
            left: `${flower.x}%`,
            top: 6 + Math.sin((flower.x / 100) * Math.PI * 4) * 8,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: flower.delay + 0.3 }}
        >
          <motion.div
            animate={
              prefersReducedMotion
                ? {}
                : {
                    rotate: [-5, 5, -5],
                    y: [0, -2, 0],
                  }
            }
            transition={{
              duration: 3 + Math.random() * 2,
              delay: flower.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {flower.type === "flower" ? (
              <svg
                width={flower.size}
                height={flower.size}
                viewBox="0 0 24 24"
                fill={flower.color}
                style={{
                  filter: `drop-shadow(0 2px 4px ${flower.color}40)`,
                }}
              >
                {/* Simple flower shape */}
                <circle cx="12" cy="12" r="4" fill={colors.gold.primary} />
                <ellipse cx="12" cy="5" rx="3" ry="4" />
                <ellipse cx="12" cy="19" rx="3" ry="4" />
                <ellipse cx="5" cy="12" rx="4" ry="3" />
                <ellipse cx="19" cy="12" rx="4" ry="3" />
                <ellipse cx="7" cy="7" rx="3" ry="3" />
                <ellipse cx="17" cy="7" rx="3" ry="3" />
                <ellipse cx="7" cy="17" rx="3" ry="3" />
                <ellipse cx="17" cy="17" rx="3" ry="3" />
              </svg>
            ) : (
              <svg
                width={flower.size * 0.8}
                height={flower.size}
                viewBox="0 0 16 24"
                fill={colors.sage.primary}
                style={{
                  filter: `drop-shadow(0 2px 4px ${colors.sage.primary}30)`,
                }}
              >
                {/* Leaf shape */}
                <path d="M8 0 C16 8 16 16 8 24 C0 16 0 8 8 0" />
                <path d="M8 4 L8 20" stroke={colors.sage.deep} strokeWidth="1" opacity="0.5" />
              </svg>
            )}
          </motion.div>
        </motion.div>
      ))}

      {/* Gold shimmer */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(90deg, transparent, ${colors.gold.shimmer}, transparent)`,
        }}
        animate={
          prefersReducedMotion
            ? {}
            : {
                x: ["-100%", "100%"],
              }
        }
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 2,
        }}
      />
    </motion.div>
  )
}
