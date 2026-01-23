"use client"

import { useEffect, useState } from "react"
import { christmasConfig } from "./themeConfig"

export function GarlandHeader() {
  const [isVisible, setIsVisible] = useState(false)
  const { colors } = christmasConfig

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`fixed top-0 left-0 right-0 h-[3px] pointer-events-none z-[9997] transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      {/* Minimal accent line with subtle gradient */}
      <div 
        className="w-full h-full"
        style={{
          background: `linear-gradient(90deg, 
            transparent 0%, 
            ${colors.pine} 15%, 
            ${colors.gold} 50%, 
            ${colors.pine} 85%, 
            transparent 100%
          )`,
        }}
      />
    </div>
  )
}
