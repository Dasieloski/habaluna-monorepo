"use client"

import { type ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { christmasConfig } from "./themeConfig"

interface HolidayBadgeProps {
  children?: ReactNode
  variant?: "sale" | "gift" | "limited" | "new"
  size?: "sm" | "md"
  className?: string
}

export function HolidayBadge({
  children,
  variant = "sale",
  size = "sm",
  className = "",
}: HolidayBadgeProps) {
  const prefersReducedMotion = useReducedMotion()
  const { colors } = christmasConfig

  const variants = {
    sale: {
      bg: colors.red.primary,
      text: colors.snow.pure,
      label: "Holiday Sale",
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
    gift: {
      bg: colors.green.primary,
      text: colors.snow.pure,
      label: "Gift Ready",
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 12v10H4V12m16-4v4H4V8h16M12 2a4 4 0 014 4H8a4 4 0 014-4z" />
        </svg>
      ),
    },
    limited: {
      bg: colors.gold.primary,
      text: colors.green.deep,
      label: "Limited Edition",
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" />
        </svg>
      ),
    },
    new: {
      bg: `linear-gradient(135deg, ${colors.red.deep}, ${colors.green.deep})`,
      text: colors.snow.pure,
      label: "New",
      icon: (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.5 3A6.5 6.5 0 0116 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 019.5 16 6.5 6.5 0 013 9.5 6.5 6.5 0 019.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z" />
        </svg>
      ),
    },
  }

  const style = variants[variant]
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"

  return (
    <motion.span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses} ${className}`}
      style={{
        background: style.bg,
        color: style.text,
      }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={
        prefersReducedMotion
          ? {}
          : {
              scale: 1.05,
            }
      }
    >
      {style.icon}
      {children || style.label}
    </motion.span>
  )
}
