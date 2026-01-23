"use client"

import { ChristmasTheme } from "./christmas"

// Componente que renderiza el tema correcto basado en el tipo
interface ThemeRendererProps {
  theme: {
    type: string
    config?: Record<string, any>
  }
}

export function ThemeRenderer({ theme }: ThemeRendererProps) {
  if (!theme) return null

  switch (theme.type) {
    case 'CHRISTMAS':
      return (
        <ChristmasTheme
          enabled={true}
          showSnow={theme.config?.showSnow ?? true}
          showGarland={theme.config?.showGarland ?? true}
          showBanner={theme.config?.showBanner ?? true}
          bannerMessage={theme.config?.bannerMessage}
          bannerSubMessage={theme.config?.bannerSubMessage}
        />
      )

    case 'VALENTINES':
      // TODO: Implement ValentineTheme component
      return null

    case 'MOTHERS_DAY':
      // TODO: Implement MothersDayTheme component
      return null

    default:
      return null
  }
}