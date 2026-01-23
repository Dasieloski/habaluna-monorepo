"use client"

import { type ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { christmasConfig } from "./themeConfig"

interface ShimmerButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: "gold" | "red" | "green"
  className?: string
  disabled?: boolean
}

export function ShimmerButton({
  children,
  onClick,
  variant = "gold",
  className = "",
  disabled = false,
}: ShimmerButtonProps) {
  const prefersReducedMotion = useReducedMotion()
  const { colors } = christmasConfig

  const variants = {
    gold: {
      bg: colors.gold.primary,
      text: colors.green.deep,
      glow: colors.gold.shimmer,
    },
    red: {
      bg: colors.red.primary,
      text: colors.snow.pure,
      glow: colors.red.glow,
    },
    green: {
      bg: colors.green.primary,
      text: colors.snow.pure,
      glow: colors.green.glow,
    },
  }

  const style = variants[variant]

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden px-6 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        background: style.bg,
        color: style.text,
      }}
      whileHover={
        disabled
          ? {}
          : {
              scale: 1.02,
              boxShadow: `0 4px 20px ${style.glow}, 0 0 40px ${style.glow}40`,
            }
      }
      whileTap={disabled ? {} : { scale: 0.98 }}
    >
      {/* Shimmer overlay */}
      {!prefersReducedMotion && !disabled && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.3) 50%, transparent 75%)`,
          }}
          initial={{ x: "-100%" }}
          whileHover={{
            x: "100%",
            transition: { duration: 0.6, ease: "easeInOut" },
          }}
        />
      )}

      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}
