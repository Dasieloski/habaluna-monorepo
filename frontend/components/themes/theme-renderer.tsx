"use client"

import { ChristmasTheme } from "./christmas"
import { ValentinesTheme } from "./valentines"
import { MothersDayTheme } from "./mothers-day"

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
      return (
        <ValentinesTheme
          enabled={true}
          showHearts={theme.config?.showHearts ?? true}
          showGarland={theme.config?.showGarland ?? true}
          showBanner={theme.config?.showBanner ?? true}
          bannerMessage={theme.config?.bannerMessage}
          bannerSubMessage={theme.config?.bannerSubMessage}
          bannerCtaText={theme.config?.bannerCtaText}
        />
      )

    case 'MOTHERS_DAY':
      return (
        <MothersDayTheme
          enabled={true}
          showPetals={theme.config?.showPetals ?? true}
          showGarland={theme.config?.showGarland ?? true}
          showBanner={theme.config?.showBanner ?? true}
          bannerMessage={theme.config?.bannerMessage}
          bannerSubMessage={theme.config?.bannerSubMessage}
          bannerCtaText={theme.config?.bannerCtaText}
        />
      )

    default:
      return null
  }
}