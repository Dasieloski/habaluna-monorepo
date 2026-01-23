"use client"

import { useMemo } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { valentinesConfig } from "./themeConfig"

interface Rose {
  id: number
  x: number
  color: string
  delay: number
  size: number
}

export function RoseGarland() {
  const prefersReducedMotion = useReducedMotion()
  const { colors, roses } = valentinesConfig

  const decorativeRoses = useMemo<Rose[]>(() => {
    return Array.from({ length: roses.count }, (_, i) => ({
      id: i,
      x: (i / roses.count) * 100 + 4,
      color: roses.colors[i % roses.colors.length],
      delay: i * 0.08,
      size: 12 + Math.random() * 6,
    }))
  }, [roses])

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-14 pointer-events-none z-[9997] overflow-visible"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      aria-hidden="true"
    >
      {/* Main vine line */}
      <svg
        className="absolute top-0 left-0 w-full h-14"
        viewBox="0 0 1200 56"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="vineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.rose.deep} stopOpacity="0" />
            <stop offset="20%" stopColor={colors.blush.deep} />
            <stop offset="50%" stopColor={colors.rose.primary} />
            <stop offset="80%" stopColor={colors.blush.deep} />
            <stop offset="100%" stopColor={colors.rose.deep} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Curved vine */}
        <path
          d="M0,8 Q150,22 300,12 T600,18 T900,12 T1200,8"
          stroke="url(#vineGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Secondary strand */}
        <path
          d="M0,6 Q150,18 300,10 T600,14 T900,10 T1200,6"
          stroke={colors.blush.light}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.4"
          fill="none"
        />
      </svg>

      {/* Decorative rose elements */}
      {decorativeRoses.map((rose) => (
        <motion.div
          key={rose.id}
          className="absolute"
          style={{
            left: `${rose.x}%`,
            top: 6 + Math.sin((rose.x / 100) * Math.PI * 4) * 8,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: rose.delay + 0.3 }}
        >
          <motion.div
            animate={
              prefersReducedMotion
                ? {}
                : {
                    scale: [1, 1.1, 1],
                  }
            }
            transition={{
              duration: 3 + Math.random() * 2,
              delay: rose.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Stem */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-px h-3 -top-3"
              style={{ background: colors.blush.deep }}
            />
            {/* Rose/Heart */}
            <svg
              width={rose.size}
              height={rose.size}
              viewBox="0 0 24 24"
              fill={rose.color}
              style={{
                filter: `drop-shadow(0 0 ${rose.size / 2}px ${rose.color}50)`,
              }}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </motion.div>
        </motion.div>
      ))}

      {/* Rose gold shimmer */}
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
