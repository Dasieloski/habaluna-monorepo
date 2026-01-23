"use client"

import { SnowEffect } from "./SnowEffect"
import { GarlandHeader } from "./GarlandHeader"
import { ChristmasBanner } from "./ChristmasBanner"
import { FestiveOrnaments } from "./FestiveOrnaments"
import { AmbientLights } from "./AmbientLights"
import { ErrorBoundary } from "../../error-boundary"

export interface ChristmasThemeProps {
  /** Activa o desactiva todo el tema navideño */
  enabled: boolean
  /** Mostrar efecto de nieve cayendo */
  showSnow?: boolean
  /** Mostrar guirnalda decorativa en el header */
  showGarland?: boolean
  /** Mostrar banner de temporada */
  showBanner?: boolean
  /** Mostrar adornos festivos flotantes */
  showOrnaments?: boolean
  /** Mostrar iluminación ambiental */
  showAmbientLights?: boolean
  /** Mensaje personalizado del banner */
  bannerMessage?: string
  /** Submensaje personalizado del banner */
  bannerSubMessage?: string
}

/**
 * ChristmasTheme - Componente principal del tema navideño profesional
 *
 * Crea una experiencia festiva completa y visualmente impactante con:
 * - Nieve realista con efectos de brillo y viento
 * - Guarlanda con luces parpadeantes
 * - Banner animado con efectos de vidrio y chispas
 * - Adornos festivos flotantes
 * - Iluminación ambiental cálida
 * - Animaciones suaves con Framer Motion
 *
 * Todas las decoraciones usan position fixed/absolute con pointer-events: none
 * para no interferir con la funcionalidad del sitio.
 *
 * @example
 * // Tema completo
 * <ChristmasTheme enabled />
 *
 * @example
 * // Control granular
 * <ChristmasTheme
 *   enabled
 *   showSnow
 *   showGarland
 *   showOrnaments
 *   showAmbientLights
 *   showBanner={false}
 * />
 *
 * @example
 * // Mensajes personalizados
 * <ChristmasTheme
 *   enabled
 *   bannerMessage="¡Feliz Navidad!"
 *   bannerSubMessage="Descubre nuestras ofertas especiales"
 * />
 */
export function ChristmasTheme({
  enabled,
  showSnow = true,
  showGarland = true,
  showBanner = true,
  showOrnaments = true,
  showAmbientLights = true,
  bannerMessage,
  bannerSubMessage,
}: ChristmasThemeProps) {
  // Si no está habilitado, no renderizar nada
  if (!enabled) return null

  // Validar configuración básica antes de renderizar
  try {
    // Verificar que los colores existan
    if (!christmasConfig.colors || typeof christmasConfig.colors !== 'object') {
      console.warn('Christmas theme: Invalid color configuration')
      return null
    }
  } catch (error) {
    console.warn('Christmas theme: Configuration error', error)
    return null
  }

  return (
    <>
      {/* Iluminación ambiental - fondo de la escena */}
      {showAmbientLights && (
        <ErrorBoundary fallback={null}>
          <AmbientLights />
        </ErrorBoundary>
      )}

      {/* Adornos festivos flotantes - elementos decorativos */}
      {showOrnaments && (
        <ErrorBoundary fallback={null}>
          <FestiveOrnaments />
        </ErrorBoundary>
      )}

      {/* Efecto de nieve - copos realistas con brillo */}
      {showSnow && (
        <ErrorBoundary fallback={null}>
          <SnowEffect />
        </ErrorBoundary>
      )}

      {/* Guirnalda en el header - luces parpadeantes */}
      {showGarland && (
        <ErrorBoundary fallback={null}>
          <GarlandHeader />
        </ErrorBoundary>
      )}

      {/* Banner de temporada - animado y moderno */}
      {showBanner && (
        <ErrorBoundary fallback={null}>
          <ChristmasBanner
            message={bannerMessage}
            subMessage={bannerSubMessage}
          />
        </ErrorBoundary>
      )}
    </>
  )
}

// Exportar componentes individuales para uso flexible
export { SnowEffect } from "./SnowEffect"
export { GarlandHeader } from "./GarlandHeader"
export { ChristmasBanner } from "./ChristmasBanner"
export { FestiveOrnaments } from "./FestiveOrnaments"
export { AmbientLights } from "./AmbientLights"
export { christmasConfig } from "./themeConfig"
