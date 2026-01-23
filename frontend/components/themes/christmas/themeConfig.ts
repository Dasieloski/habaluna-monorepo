// Premium Christmas Theme Configuration
// Refined color palette with sophisticated, muted tones

export const christmasConfig = {
  // Premium color palette - muted, elegant, minimal
  colors: {
    // Snow - very subtle, almost invisible
    snow: "rgba(255, 255, 255, 0.6)",
    snowSoft: "rgba(245, 245, 245, 0.3)",
    
    // Foliage - deep, sophisticated greens
    pine: "#1a3a2f",
    pineLight: "#2a4a3f",
    pineMuted: "rgba(26, 58, 47, 0.9)",
    
    // Accent - warm gold, understated
    gold: "#c9a962",
    goldMuted: "rgba(201, 169, 98, 0.7)",
    
    // Surface - for overlays
    surface: "rgba(26, 58, 47, 0.95)",
    surfaceLight: "rgba(42, 74, 63, 0.9)",
  },

  // Snow effect - sparse and gentle
  snow: {
    particleCount: 25,
    minSize: 2,
    maxSize: 4,
    minDuration: 12,
    maxDuration: 20,
    minOpacity: 0.2,
    maxOpacity: 0.5,
  },

  // Garland - minimal and refined
  garland: {
    height: 3,
    ornamentCount: 0, // No ornaments for cleaner look
  },

  // Banner - sleek and modern
  banner: {
    dismissible: true,
    delayMs: 800,
  },

  // Animation timings - smooth, professional
  animation: {
    fast: "200ms",
    normal: "300ms",
    slow: "400ms",
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const

export type ChristmasConfig = typeof christmasConfig
