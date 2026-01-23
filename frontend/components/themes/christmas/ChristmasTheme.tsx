"use client"

import { SnowEffect } from "./SnowEffect"
import { GarlandHeader } from "./GarlandHeader"
import { ChristmasBanner } from "./ChristmasBanner"

export interface ChristmasThemeProps {
  /** Activa o desactiva todo el tema navideño */
  enabled: boolean
  /** Mostrar efecto de nieve cayendo */
  showSnow?: boolean
  /** Mostrar guirnalda decorativa en el header */
  showGarland?: boolean
  /** Mostrar banner de temporada */
  showBanner?: boolean
  /** Mensaje personalizado del banner */
  bannerMessage?: string
  /** Submensaje personalizado del banner */
  bannerSubMessage?: string
}

/**
 * ChristmasTheme - Componente principal del tema navideño
 * 
 * Renderiza overlays decorativos sin afectar el layout existente.
 * Todas las decoraciones usan position fixed/absolute con pointer-events: none.
 * 
 * @example
 * // Uso básico
 * <ChristmasTheme enabled />
 * 
 * @example
 * // Control granular
 * <ChristmasTheme 
 *   enabled 
 *   showSnow 
 *   showGarland 
 *   showBanner={false} 
 * />
 * 
 * @example
 * // Mensaje personalizado
 * <ChristmasTheme 
 *   enabled 
 *   bannerMessage="¡Feliz Navidad!" 
 *   bannerSubMessage="Envío gratis en pedidos +$50"
 * />
 */
export function ChristmasTheme({
  enabled,
  showSnow = true,
  showGarland = true,
  showBanner = true,
  bannerMessage,
  bannerSubMessage,
}: ChristmasThemeProps) {
  // Si no está habilitado, no renderizar nada
  if (!enabled) return null

  return (
    <>
      {/* Efecto de nieve - z-index alto pero sin bloquear interacciones */}
      {showSnow && <SnowEffect />}
      
      {/* Guirnalda en el header - se posiciona sobre el header existente */}
      {showGarland && <GarlandHeader />}
      
      {/* Banner de temporada - esquina inferior derecha */}
      {showBanner && (
        <ChristmasBanner 
          message={bannerMessage} 
          subMessage={bannerSubMessage} 
        />
      )}
    </>
  )
}

// Exportar componentes individuales para uso flexible
export { SnowEffect } from "./SnowEffect"
export { GarlandHeader } from "./GarlandHeader"
export { ChristmasBanner } from "./ChristmasBanner"
export { christmasConfig } from "./themeConfig"
