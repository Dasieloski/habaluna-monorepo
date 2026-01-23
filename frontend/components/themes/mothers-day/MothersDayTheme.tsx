"use client"

import { PetalsEffect } from "./PetalsEffect"
import { FloralGarland } from "./FloralGarland"
import { MothersDayBanner } from "./MothersDayBanner"

export interface MothersDayThemeProps {
  enabled?: boolean
  showPetals?: boolean
  showGarland?: boolean
  showBanner?: boolean
  bannerMessage?: string
  bannerSubMessage?: string
  bannerCtaText?: string
  onBannerCtaClick?: () => void
}

export function MothersDayTheme({
  enabled = true,
  showPetals = true,
  showGarland = true,
  showBanner = true,
  bannerMessage,
  bannerSubMessage,
  bannerCtaText,
  onBannerCtaClick,
}: MothersDayThemeProps) {
  if (!enabled) return null

  return (
    <>
      {showPetals && <PetalsEffect />}
      {showGarland && <FloralGarland />}
      {showBanner && (
        <MothersDayBanner
          message={bannerMessage}
          subMessage={bannerSubMessage}
          ctaText={bannerCtaText}
          onCtaClick={onBannerCtaClick}
        />
      )}
    </>
  )
}
