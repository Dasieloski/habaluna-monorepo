// Premium Valentine's Day Theme Configuration
// Romantic palette with sophisticated rose and blush tones

export const valentinesConfig = {
  colors: {
    // Rose - primary romantic color
    rose: {
      deep: "#9F1239",
      primary: "#E11D48",
      light: "#FB7185",
      muted: "rgba(225, 29, 72, 0.15)",
      glow: "rgba(225, 29, 72, 0.4)",
    },
    // Blush pink - soft and elegant
    blush: {
      deep: "#BE185D",
      primary: "#EC4899",
      light: "#F9A8D4",
      muted: "rgba(236, 72, 153, 0.15)",
      soft: "rgba(249, 168, 212, 0.3)",
    },
    // Rose gold accent - luxurious
    gold: {
      primary: "#D4A574",
      light: "#E8C4A0",
      muted: "rgba(212, 165, 116, 0.3)",
      shimmer: "rgba(232, 196, 160, 0.6)",
    },
    // Cream white
    cream: {
      pure: "#FFFBF5",
      soft: "#FFF5EB",
      muted: "rgba(255, 251, 245, 0.9)",
    },
  },

  // Hearts effect
  hearts: {
    particleCount: 25,
    minSize: 10,
    maxSize: 20,
    minDuration: 12,
    maxDuration: 20,
    minOpacity: 0.3,
    maxOpacity: 0.7,
  },

  // Decorative roses
  roses: {
    count: 12,
    colors: ["#E11D48", "#EC4899", "#FB7185", "#F9A8D4"],
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
    float: {
      animate: {
        y: [0, -10, 0],
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
      },
    },
    pulse: {
      animate: {
        scale: [1, 1.05, 1],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
      },
    },
  },
} as const

export type ValentinesConfig = typeof valentinesConfig
