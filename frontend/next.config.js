/** @type {import('next').NextConfig} */
const nextConfig = {
  // CRÍTICO: Asegurar que las rutas dinámicas funcionen en producción
  trailingSlash: false,
  // Forzar output: 'standalone' para Railway (Next.js 16 requiere esto para serverless)
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Optimización de compilación
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  typescript: {
    // Permite que `next build` (y por ende Vercel) no falle por errores de TypeScript.
    // Úsalo solo si lo necesitas temporalmente; puede ocultar bugs reales.
    ignoreBuildErrors: true,
  },
  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
        ],
      },
    ];
  },
  images: {
    // Deprecado: usar remotePatterns en su lugar
    // domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'habaluna-backend-production.up.railway.app',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '4000',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
      },
    ],
    // Optimización de imágenes mejorada
    formats: ['image/avif', 'image/webp'],
    // Tamaños de imagen para responsive (optimizados para mejor LCP)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Calidad de compresión optimizada (75-85 para balance calidad/tamaño)
    quality: 80,
    minimumCacheTTL: 31536000, // 1 año para mejor caching
    // Deshabilitar optimización solo para imágenes específicas (data URLs, etc)
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Compresión y optimización
  compress: true,
  // Optimización de producción
  swcMinify: true,
  // Reducir tamaño del bundle
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Tree shaking mejorado
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
