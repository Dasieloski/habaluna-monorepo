"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

/**
 * Workaround defensivo:
 * En algunos edge-cases (navegación/re-renders durante modales), Radix puede dejar el <body>
 * con pointer-events/scroll-lock activos, bloqueando todos los clicks.
 * Esto fuerza un reset suave al cambiar de ruta.
 */
export function RadixSafetyReset() {
  const pathname = usePathname()

  useEffect(() => {
    const t = window.setTimeout(() => {
      // restaurar interacción
      document.body.style.pointerEvents = ""
      // restaurar scroll (Radix/removescroll usa data-radix-scroll-lock)
      document.body.style.overflow = ""
      document.body.removeAttribute("data-radix-scroll-lock")
    }, 0)

    return () => window.clearTimeout(t)
  }, [pathname])

  return null
}

