"use client"

import { useTheme } from "@/hooks/use-theme"
import { ThemeRenderer } from "./theme-renderer"

// Proveedor de temas que se integra en el layout principal
export function ThemeProvider() {
  const { activeTheme, loading } = useTheme()

  // No renderizar nada mientras carga para evitar flashes
  if (loading) return null

  // Renderizar el tema activo si existe
  if (activeTheme) {
    return <ThemeRenderer theme={activeTheme} />
  }

  // No renderizar nada si no hay tema activo
  return null
}