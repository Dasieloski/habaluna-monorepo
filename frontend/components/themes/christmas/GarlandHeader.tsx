"use client"

import { useMemo } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { christmasConfig } from "./themeConfig"

interface Light {
  id: number
  x: number
  color: string
  delay: number
  size: number
}

export function GarlandHeader() {
  const prefersReducedMotion = useReducedMotion()
  const { colors, lights } = christmasConfig

  const decorativeLights = useMemo<Light[]>(() => {
    return Array.from({ length: lights.count }, (_, i) => ({
      id: i,
      x: (i / lights.count) * 100,
      color: lights.colors[i % lights.colors.length],
      delay: i * 0.1,
      size: 8 + Math.random() * 4,
    }))
  }, [lights])

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-12 pointer-events-none z-[9997] overflow-visible"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      aria-hidden="true"
    >
      {/* Main garland line */}
      <svg
        className="absolute top-0 left-0 w-full h-12"
        viewBox="0 0 1200 48"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="garlandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.green.deep} stopOpacity="0" />
            <stop offset="20%" stopColor={colors.green.primary} />
            <stop offset="50%" stopColor={colors.green.deep} />
            <stop offset="80%" stopColor={colors.green.primary} />
            <stop offset="100%" stopColor={colors.green.deep} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Curved garland path */}
        <path
          d="M0,6 Q150,20 300,10 T600,14 T900,10 T1200,6"
          stroke="url(#garlandGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Secondary lighter strand */}
        <path
          d="M0,4 Q150,16 300,8 T600,12 T900,8 T1200,4"
          stroke={colors.green.primary}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.4"
          fill="none"
        />
      </svg>

      {/* Decorative lights */}
      {decorativeLights.map((light) => (
        <motion.div
          key={light.id}
          className="absolute"
          style={{
            left: `${light.x}%`,
            top: 8 + Math.sin((light.x / 100) * Math.PI * 4) * 6,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: light.delay + 0.3 }}
        >
          {/* Light bulb */}
          <motion.div
            className="relative"
            animate={
              prefersReducedMotion
                ? {}
                : {
                    opacity: [0.7, 1, 0.7],
                  }
            }
            transition={{
              duration: 2 + Math.random(),
              delay: light.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Wire */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-px h-2 -top-2"
              style={{ background: colors.green.deep }}
            />
            {/* Bulb */}
            <div
              className="rounded-full"
              style={{
                width: light.size,
                height: light.size,
                background: light.color,
                boxShadow: `0 0 ${light.size}px ${light.color}, 0 0 ${light.size * 2}px ${light.color}40`,
              }}
            />
          </motion.div>
        </motion.div>
      ))}

      {/* Subtle gold shimmer overlay */}
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
