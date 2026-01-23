"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { mothersDayConfig } from "./themeConfig"

interface BloomButtonProps {
  children: ReactNode
  variant?: "pink" | "lavender" | "sage"
  onClick?: () => void
  className?: string
}

export function BloomButton({
  children,
  variant = "pink",
  onClick,
  className = "",
}: BloomButtonProps) {
  const prefersReducedMotion = useReducedMotion()
  const { colors } = mothersDayConfig

  const variants = {
    pink: {
      bg: colors.pink.primary,
      hover: colors.pink.deep,
      text: colors.cream.pure,
      glow: colors.pink.glow,
    },
    lavender: {
      bg: colors.lavender.primary,
      hover: colors.lavender.deep,
      text: colors.cream.pure,
      glow: colors.lavender.muted,
    },
    sage: {
      bg: colors.sage.primary,
      hover: colors.sage.deep,
      text: colors.cream.pure,
      glow: colors.sage.muted,
    },
  }

  const style = variants[variant]

  return (
    <motion.button
      onClick={onClick}
      className={`relative px-4 py-2 rounded-lg text-sm font-medium overflow-hidden ${className}`}
      style={{
        background: style.bg,
        color: style.text,
      }}
      whileHover={
        prefersReducedMotion
          ? {}
          : {
              scale: 1.02,
              boxShadow: `0 0 20px ${style.glow}`,
            }
      }
      whileTap={{ scale: 0.98 }}
    >
      {/* Shimmer effect */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)`,
          }}
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}
