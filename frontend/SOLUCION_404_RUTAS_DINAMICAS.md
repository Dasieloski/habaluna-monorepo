# Solución Completa: 404 en Rutas Dinámicas y Fetch a localhost

## 🔍 Análisis del Problema

### 1. Por qué Next.js devuelve 404 en `/auth/reset-password/[slug]`

**Causa raíz:**
- Next.js 16 con App Router intenta pre-renderizar rutas dinámicas durante el build
- Si no hay `export const dynamic = 'force-dynamic'`, Next.js puede intentar generar la ruta estáticamente
- En producción, si la ruta no se generó durante el build, Next.js devuelve 404
- El middleware puede estar interfiriendo aunque esté excluido del matcher

**Problemas específicos:**
1. Falta `export const dynamic = 'force-dynamic'` en `page.tsx`
2. `dynamicParams = true` no es suficiente sin `dynamic = 'force-dynamic'`
3. El fetch en `generateMetadata` o en el componente puede estar fallando y causando que Next.js no reconozca la ruta

### 2. Por qué los fetch apuntan a localhost:4000

**Causa raíz:**
- `NEXT_PUBLIC_*` se inyecta en **tiempo de build**, no en runtime
- Si la variable no está configurada durante el build, se usa el fallback `localhost:4000`
- La función `getApiBaseUrl()` se ejecuta cuando se carga el módulo, y en ese momento puede no tener acceso a la variable

## ✅ Solución Completa

### Paso 1: Corregir `page.tsx` de reset-password

```typescript
// frontend/app/auth/reset-password/[slug]/page.tsx

// CRÍTICO: Forzar renderizado dinámico en cada request
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

// ... resto del código
```

### Paso 2: Actualizar `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  
  // CRÍTICO: Configurar para rutas dinámicas
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // CRÍTICO: Asegurar que las rutas dinámicas se sirvan correctamente
  // Sin output: 'standalone', Next.js usa el servidor Node.js estándar
  // que debe manejar rutas dinámicas correctamente
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'habanaluna-backend-production.up.railway.app',
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
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

module.exports = nextConfig;
```

### Paso 3: Mejorar función `getApiBaseUrl()` para funcionar en build y runtime

El problema es que `getApiBaseUrl()` se ejecuta cuando se carga el módulo. Necesitamos que se ejecute en cada llamada.

### Paso 4: Configuración de Railway

**Frontend Service:**
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Variables de Entorno:**
  ```
  NEXT_PUBLIC_API_URL=https://habanaluna-backend-production.up.railway.app
  NODE_ENV=production
  ```

**Backend Service:**
- **Root Directory:** `backend`
- **Variables de Entorno:**
  ```
  FRONTEND_URL=https://habaluna.com
  NODE_ENV=production
  PORT=4000
  ```

## 📝 Cambios en Archivos
