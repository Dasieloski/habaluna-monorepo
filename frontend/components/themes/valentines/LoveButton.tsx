"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { valentinesConfig } from "./themeConfig"

interface LoveButtonProps {
  children: ReactNode
  variant?: "rose" | "blush" | "gold"
  onClick?: () => void
  className?: string
}

export function LoveButton({
  children,
  variant = "rose",
  onClick,
  className = "",
}: LoveButtonProps) {
  const prefersReducedMotion = useReducedMotion()
  const { colors } = valentinesConfig

  const variants = {
    rose: {
      bg: colors.rose.primary,
      hover: colors.rose.deep,
      glow: colors.rose.glow,
      text: colors.cream.pure,
    },
    blush: {
      bg: colors.blush.primary,
      hover: colors.blush.deep,
      glow: colors.blush.soft,
      text: colors.cream.pure,
    },
    gold: {
      bg: colors.gold.primary,
      hover: colors.gold.light,
      glow: colors.gold.shimmer,
      text: colors.rose.deep,
    },
  }

  const v = variants[variant]

  return (
    <motion.button
      onClick={onClick}
      className={`relative overflow-hidden px-5 py-2.5 rounded-xl text-sm font-medium ${className}`}
      style={{
        background: v.bg,
        color: v.text,
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: `0 0 24px ${v.glow}`,
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Shimmer effect */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)`,
          }}
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      )}
      
      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  )
}
