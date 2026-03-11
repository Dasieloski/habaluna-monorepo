"use client"

import { useState, useEffect } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import Script from "next/script"

export function MoonHero() {
  const prefersReducedMotion = useReducedMotion()
  const autoRotate = !prefersReducedMotion
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <>
      <Script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"
        strategy="afterInteractive"
      />
      <div className="w-full h-full relative" suppressHydrationWarning>
        {/* @ts-expect-error - model-viewer es un custom element */}
        <model-viewer
          src="/models3d/moon.glb"
          alt="Modelo 3D de la luna"
          style={{ width: "100%", height: "100%", background: "transparent", display: "block" }}
          exposure="1.1"
          shadow-intensity="0.4"
          {...(autoRotate ? { "auto-rotate": true } : {})}
          disable-zoom
        />
      </div>
    </>
  )
}


