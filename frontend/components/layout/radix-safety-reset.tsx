"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

/**
 * Workaround defensivo:
 * En algunos edge-cases (navegación/re-renders durante modales), Radix puede dejar el <body>
 * con pointer-events/scroll-lock activos, bloqueando todos los clicks.
 *
 * Importante: el bug reportado ocurre sin navegar (misma ruta), así que además de resetear en
 * cambios de ruta, también observamos el DOM/atributos para desbloquear cuando NO hay overlays abiertos.
 */
export function RadixSafetyReset() {
  const pathname = usePathname()

  useEffect(() => {
    const isAnyRadixOverlayOpen = () => {
      // Solo overlays que realmente bloquean la UI (modales/sheets/drawers/alert-dialog).
      return Boolean(
        document.querySelector(
          [
            '[data-slot="alert-dialog-overlay"][data-state="open"]',
            '[data-slot="dialog-overlay"][data-state="open"]',
            '[data-slot="sheet-overlay"][data-state="open"]',
            '[data-slot="drawer-overlay"][data-state="open"]',
          ].join(","),
        ),
      )
    }

    const resetBodyLocks = () => {
      document.body.style.pointerEvents = ""
      document.body.style.overflow = ""
      document.body.removeAttribute("data-radix-scroll-lock")
    }

    const maybeReset = () => {
      const body = document.body
      const looksLocked =
        body.style.pointerEvents === "none" ||
        body.hasAttribute("data-radix-scroll-lock") ||
        body.style.overflow === "hidden"

      if (!looksLocked) return
      if (isAnyRadixOverlayOpen()) return

      resetBodyLocks()
    }

    // Intento inmediato (por si venimos de un estado malo)
    const t = window.setTimeout(() => maybeReset(), 0)

    // Watchdog: si Radix deja locks colgados, lo resolvemos sin recargar.
    const interval = window.setInterval(() => maybeReset(), 400)

    // Observa cambios en el body (style/attrs) y en el DOM (portales)
    const mo = new MutationObserver(() => maybeReset())
    try {
      mo.observe(document.body, { attributes: true, attributeFilter: ["style", "data-radix-scroll-lock"] })
      mo.observe(document.documentElement, { childList: true, subtree: true })
    } catch {
      // ignore
    }

    return () => {
      window.clearTimeout(t)
      window.clearInterval(interval)
      mo.disconnect()
    }
  }, [pathname])

  return null
}

