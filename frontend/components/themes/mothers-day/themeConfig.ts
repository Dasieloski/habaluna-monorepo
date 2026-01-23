// Premium Mother's Day Theme Configuration
// Elegant, soft palette celebrating maternal warmth

export const mothersDayConfig = {
  colors: {
    // Soft pinks - nurturing and warm
    pink: {
      deep: "#BE185D",
      primary: "#DB2777",
      soft: "#F472B6",
      muted: "rgba(219, 39, 119, 0.15)",
      glow: "rgba(219, 39, 119, 0.4)",
    },
    // Lavender - calm and elegant
    lavender: {
      deep: "#7C3AED",
      primary: "#A78BFA",
      soft: "#C4B5FD",
      muted: "rgba(167, 139, 250, 0.15)",
    },
    // Sage green - fresh and natural
    sage: {
      deep: "#166534",
      primary: "#22C55E",
      soft: "#86EFAC",
      muted: "rgba(34, 197, 94, 0.15)",
    },
    // Warm cream and gold
    cream: {
      pure: "#FFFDF7",
      soft: "#FEF9E7",
      muted: "rgba(255, 253, 247, 0.9)",
    },
    gold: {
      primary: "#D4A574",
      soft: "#E8C99B",
      shimmer: "rgba(212, 165, 116, 0.6)",
    },
  },

  // Floating flowers/petals effect
  petals: {
    particleCount: 30,
    minSize: 8,
    maxSize: 16,
    minDuration: 12,
    maxDuration: 20,
    minOpacity: 0.4,
    maxOpacity: 0.7,
  },

  // Floral garland
  garland: {
    flowerCount: 16,
    colors: ["#DB2777", "#A78BFA", "#22C55E", "#F472B6"],
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
    bloom: {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
    },
    float: {
      animate: {
        y: [0, -8, 0],
        rotate: [-2, 2, -2],
      },
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
} as const

export type MothersDayConfig = typeof mothersDayConfig
