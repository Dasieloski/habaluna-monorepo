// Premium Christmas Theme Configuration
// Professional palette inspired by luxury brands

export const christmasConfig = {
  colors: {
    // Deep reds - luxurious, not aggressive
    red: {
      deep: "#7A0F14",
      primary: "#B91C1C",
      muted: "rgba(185, 28, 28, 0.15)",
      glow: "rgba(185, 28, 28, 0.4)",
    },
    // Forest greens - sophisticated
    green: {
      deep: "#0F3D2E",
      primary: "#14532D",
      muted: "rgba(20, 83, 45, 0.15)",
      glow: "rgba(20, 83, 45, 0.4)",
    },
    // Gold accent - warm and elegant
    gold: {
      primary: "#D4AF37",
      light: "#E8C547",
      muted: "rgba(212, 175, 55, 0.3)",
      shimmer: "rgba(232, 197, 71, 0.6)",
    },
    // Snow white
    snow: {
      pure: "#FFFFFF",
      soft: "#F8FAFC",
      muted: "rgba(248, 250, 252, 0.9)",
    },
  },

  // Snow effect - visible but elegant
  snow: {
    particleCount: 40,
    minSize: 3,
    maxSize: 6,
    minDuration: 10,
    maxDuration: 18,
    minOpacity: 0.4,
    maxOpacity: 0.8,
  },

  // Decorative lights
  lights: {
    count: 20,
    colors: ["#B91C1C", "#D4AF37", "#14532D", "#F8FAFC"],
    glowIntensity: 0.6,
  },

  // Banner
  banner: {
    dismissible: true,
    delayMs: 1000,
  },

  // Framer Motion variants
  motion: {
    fadeInUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    },
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.6 },
    },
    scale: {
      initial: { scale: 0.95, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
  },
} as const

export type ChristmasConfig = typeof christmasConfig
