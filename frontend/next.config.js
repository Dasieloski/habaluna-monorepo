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
  // Headers de seguridad y cache
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production';

    const connectSrc = [
      "'self'",
      'blob:',
      'https://*.railway.app',
      'https://*.vercel.app',
      'https://vercel.live',
      'wss://*.vercel.app',
      'wss://vercel.live',
      ...(isDev ? ['http://localhost:4000'] : []),
    ].join(' ');

    return [
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob: https://vercel.live https://ajax.googleapis.com; " +
              "worker-src 'self' blob:; " +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
              "font-src 'self' https://fonts.gstatic.com data:; " +
              "img-src 'self' data: https: http: blob:; " +
              `connect-src ${connectSrc}; ` +
              "frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';",
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
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
    // Cache TTL para mejor rendimiento
    minimumCacheTTL: 31536000, // 1 año para mejor caching
    // Deshabilitar optimización solo para imágenes específicas (data URLs, etc)
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Compresión y optimización
  compress: true,
  // Configuración de Turbopack (Next.js 16 usa Turbopack por defecto)
  turbopack: {},
  // Reducir tamaño del bundle (solo para webpack, si se usa --webpack flag)
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
