"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

/** Slider pequeño claro/oscuro. Uso: Header (storefront) y Admin. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        className={cn("h-6 w-11 shrink-0 rounded-full bg-muted", className)}
        aria-hidden
      />
    )
  }

  const isDark = theme === "dark"

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Usar modo claro" : "Usar modo oscuro"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full border border-border transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isDark ? "bg-primary/90" : "bg-muted-foreground/20",
        className
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 block h-5 w-5 rounded-full bg-background shadow-sm transition-[left] duration-200",
          isDark ? "left-0.5" : "left-5"
        )}
      />
    </button>
  )
}
