"use client"

import { useEffect, useState, useMemo } from "react"
import { christmasConfig } from "./themeConfig"

interface Snowflake {
  id: number
  x: number
  size: number
  duration: number
  delay: number
  opacity: number
}

export function SnowEffect() {
  const [isVisible, setIsVisible] = useState(false)
  const { snow, colors } = christmasConfig

  const snowflakes = useMemo<Snowflake[]>(() => {
    return Array.from({ length: snow.particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: snow.minSize + Math.random() * (snow.maxSize - snow.minSize),
      duration: snow.minDuration + Math.random() * (snow.maxDuration - snow.minDuration),
      delay: Math.random() * snow.maxDuration,
      opacity: snow.minOpacity + Math.random() * (snow.maxOpacity - snow.minOpacity),
    }))
  }, [snow])

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`fixed inset-0 overflow-hidden pointer-events-none z-[9998] transition-opacity duration-700 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      <style jsx>{`
        @keyframes drift {
          0%, 100% {
            transform: translateY(-10px) translateX(0);
          }
          50% {
            transform: translateY(50vh) translateX(20px);
          }
          100% {
            transform: translateY(100vh) translateX(-10px);
          }
        }
        .flake {
          position: absolute;
          top: -10px;
          background: ${colors.snow};
          border-radius: 50%;
          animation: drift linear infinite;
          will-change: transform, opacity;
        }
      `}</style>
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="flake"
          style={{
            left: `${flake.x}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            animationDuration: `${flake.duration}s`,
            animationDelay: `-${flake.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
