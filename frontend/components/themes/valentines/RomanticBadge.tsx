"use client"

import { motion, useReducedMotion } from "framer-motion"
import { valentinesConfig } from "./themeConfig"

interface RomanticBadgeProps {
  variant?: "love" | "gift" | "exclusive" | "couple"
}

export function RomanticBadge({ variant = "love" }: RomanticBadgeProps) {
  const prefersReducedMotion = useReducedMotion()
  const { colors } = valentinesConfig

  const badges = {
    love: {
      label: "With Love",
      bg: colors.rose.muted,
      border: colors.rose.primary,
      text: colors.rose.primary,
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ),
    },
    gift: {
      label: "Gift Idea",
      bg: colors.blush.muted,
      border: colors.blush.primary,
      text: colors.blush.primary,
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" />
        </svg>
      ),
    },
    exclusive: {
      label: "Exclusive",
      bg: colors.gold.muted,
      border: colors.gold.primary,
      text: colors.gold.primary,
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
    couple: {
      label: "For Two",
      bg: "rgba(212, 165, 116, 0.15)",
      border: colors.rose.light,
      text: colors.rose.primary,
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      ),
    },
  }

  const badge = badges[variant]

  return (
    <motion.div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
      style={{
        background: badge.bg,
        borderColor: badge.border,
        color: badge.text,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={
        prefersReducedMotion
          ? {}
          : {
              scale: 1.05,
              boxShadow: `0 0 12px ${badge.border}40`,
            }
      }
    >
      {badge.icon}
      <span>{badge.label}</span>
    </motion.div>
  )
}
