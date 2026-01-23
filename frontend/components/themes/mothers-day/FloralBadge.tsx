"use client"

import { motion, useReducedMotion } from "framer-motion"
import { mothersDayConfig } from "./themeConfig"

interface FloralBadgeProps {
  variant?: "mom" | "gift" | "special" | "bestseller"
}

export function FloralBadge({ variant = "mom" }: FloralBadgeProps) {
  const prefersReducedMotion = useReducedMotion()
  const { colors } = mothersDayConfig

  const variants = {
    mom: {
      bg: colors.pink.muted,
      text: colors.pink.deep,
      border: colors.pink.soft,
      label: "For Mom",
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ),
    },
    gift: {
      bg: colors.lavender.muted,
      text: colors.lavender.deep,
      border: colors.lavender.soft,
      label: "Gift Idea",
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" />
        </svg>
      ),
    },
    special: {
      bg: `linear-gradient(135deg, ${colors.pink.muted}, ${colors.lavender.muted})`,
      text: colors.pink.deep,
      border: colors.gold.soft,
      label: "Special",
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ),
    },
    bestseller: {
      bg: colors.sage.muted,
      text: colors.sage.deep,
      border: colors.sage.soft,
      label: "Bestseller",
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
    },
  }

  const style = variants[variant]

  return (
    <motion.div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
      style={{
        background: style.bg,
        color: style.text,
        borderColor: style.border,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
      whileHover={
        prefersReducedMotion
          ? {}
          : {
              scale: 1.05,
            }
      }
    >
      {style.icon}
      <span>{style.label}</span>
    </motion.div>
  )
}
