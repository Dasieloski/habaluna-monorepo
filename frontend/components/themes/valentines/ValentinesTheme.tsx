"use client"

import { HeartsEffect } from "./HeartsEffect"
import { RoseGarland } from "./RoseGarland"
import { ValentinesBanner } from "./ValentinesBanner"

export interface ValentinesThemeProps {
  enabled?: boolean
  showHearts?: boolean
  showGarland?: boolean
  showBanner?: boolean
  bannerMessage?: string
  bannerSubMessage?: string
  bannerCtaText?: string
  onBannerCtaClick?: () => void
}

export function ValentinesTheme({
  enabled = true,
  showHearts = true,
  showGarland = true,
  showBanner = true,
  bannerMessage,
  bannerSubMessage,
  bannerCtaText,
  onBannerCtaClick,
}: ValentinesThemeProps) {
  if (!enabled) return null

  return (
    <>
      {showHearts && <HeartsEffect />}
      {showGarland && <RoseGarland />}
      {showBanner && (
        <ValentinesBanner
          message={bannerMessage}
          subMessage={bannerSubMessage}
          ctaText={bannerCtaText}
          onCtaClick={onBannerCtaClick}
        />
      )}
    </>
  )
}
