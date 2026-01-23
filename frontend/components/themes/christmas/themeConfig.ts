// Professional Christmas Theme Configuration
// Elegant, modern and visually stunning color palette

export const christmasConfig = {
  // Premium color palette - elegant, festive and professional
  colors: {
    // Snow - crystalline and luminous
    snow: "rgba(255, 255, 255, 0.8)",
    snowGlow: "rgba(255, 255, 255, 0.95)",
    snowShadow: "rgba(255, 255, 255, 0.3)",

    // Deep forest greens - sophisticated and natural
    pine: "#0f2920",
    pineLight: "#1a3a2f",
    pineMuted: "rgba(26, 58, 47, 0.85)",
    pineGlow: "rgba(34, 197, 94, 0.1)",

    // Warm festive reds - elegant and classic
    cranberry: "#8b1e3f",
    cranberryLight: "#a8334c",
    cranberryGlow: "rgba(168, 51, 76, 0.2)",

    // Premium gold accents - luxurious and refined
    gold: "#d4af37",
    goldLight: "#f4e87c",
    goldMuted: "rgba(212, 175, 55, 0.8)",
    goldGlow: "rgba(244, 232, 124, 0.3)",

    // Surface overlays - modern glass morphism
    surface: "rgba(15, 41, 32, 0.95)",
    surfaceLight: "rgba(26, 58, 47, 0.9)",
    surfaceGlow: "rgba(15, 41, 32, 0.85)",

    // Warm festive whites and creams
    cream: "rgba(255, 248, 240, 0.9)",
    creamLight: "rgba(255, 253, 248, 0.95)",
    ivory: "rgba(255, 255, 240, 0.92)",
  },

  // Enhanced snow effect - realistic and mesmerizing
  snow: {
    particleCount: 35,
    minSize: 1.5,
    maxSize: 5,
    minDuration: 8,
    maxDuration: 18,
    minOpacity: 0.3,
    maxOpacity: 0.7,
    windStrength: 0.5,
    glowIntensity: 0.4,
  },

  // Professional garland system
  garland: {
    height: 4,
    lightCount: 12,
    twinkleSpeed: 2000,
    colors: ["#d4af37", "#f4e87c", "#8b1e3f", "#a8334c"],
    intensity: 0.8,
  },

  // Festive banner system
  banner: {
    dismissible: true,
    delayMs: 1200,
    autoHideDelay: 30000,
    cornerRadius: "16px",
    blurStrength: "20px",
  },

  // Sophisticated ornament collection
  ornaments: {
    count: 8,
    types: ["star", "bell", "candy", "snowflake"],
    minSize: 16,
    maxSize: 24,
    animationDelay: 300,
    glowEffect: true,
  },

  // Professional animation timings
  animation: {
    instant: "100ms",
    fast: "250ms",
    normal: "400ms",
    slow: "600ms",
    slower: "800ms",
    easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },

  // Sound effects (optional, subtle)
  sounds: {
    enabled: false,
    snowVolume: 0.1,
    bellVolume: 0.05,
    windVolume: 0.08,
  },

  // Performance settings
  performance: {
    reduceMotion: false,
    maxParticles: 50,
    enableWebGL: true,
    useHardwareAcceleration: true,
  },
} as const

export type ChristmasConfig = typeof christmasConfig
