# Análisis Completo: 404 en Rutas Dinámicas y Fetch a localhost

## 🔍 Problema 1: Por qué Next.js devuelve 404 en `/auth/reset-password/[slug]`

### Causa Raíz

Next.js 16 con App Router tiene dos modos de renderizado para rutas dinámicas:

1. **Static Generation (SSG)**: Pre-renderiza las rutas durante el build
2. **Dynamic Rendering (SSR)**: Renderiza en el servidor en cada request

**El problema:**
- Por defecto, Next.js intenta determinar automáticamente si una ruta puede ser estática
- Si `generateMetadata` o el componente hacen fetch que fallan, Next.js puede marcar la ruta como "no válida"
- En producción, si la ruta no se generó durante el build y no está configurada como dinámica, Next.js devuelve 404

### Por qué `dynamicParams = true` no es suficiente

`dynamicParams = true` solo le dice a Next.js que **acepte** parámetros dinámicos que no se generaron durante el build. Pero no fuerza el renderizado dinámico.

**Necesitas también:**
```typescript
export const dynamic = 'force-dynamic'
```

Esto le dice explícitamente a Next.js: "Esta ruta SIEMPRE debe renderizarse en el servidor en cada request, nunca pre-renderizarla".

### Solución Implementada

```typescript
// frontend/app/auth/reset-password/[slug]/page.tsx

// CRÍTICO: Forzar renderizado dinámico
export const dynamic = 'force-dynamic'  // ← Esto es lo que faltaba
export const dynamicParams = true
export const revalidate = 0
```

**Explicación:**
- `dynamic = 'force-dynamic'`: Fuerza SSR en cada request
- `dynamicParams = true`: Acepta cualquier slug, incluso si no se generó en build
- `revalidate = 0`: No cachear (opcional, pero recomendado para reset-password)

## 🔍 Problema 2: Por qué los fetch apuntan a localhost:4000

### Causa Raíz

**Cómo funcionan las variables `NEXT_PUBLIC_*` en Next.js:**

1. **Build Time**: Next.js inyecta `process.env.NEXT_PUBLIC_*` en el código JavaScript durante el build
2. **Runtime**: El código compilado ya tiene los valores hardcodeados

**El problema:**
```typescript
// ❌ INCORRECTO: Se ejecuta cuando se carga el módulo
let API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000")
```

Si `NEXT_PUBLIC_API_URL` no está configurada durante el build:
- Next.js inyecta `undefined`
- El código usa el fallback `"http://localhost:4000"`
- Este valor queda hardcodeado en el bundle de producción

### Solución Implementada

**Lazy Initialization Pattern:**

```typescript
// ✅ CORRECTO: Se ejecuta la primera vez que se necesita
let API_BASE_URL: string | null = null

function getApiBaseUrlLazy(): string {
  if (!API_BASE_URL) {
    API_BASE_URL = getApiBaseUrl()  // Se ejecuta en runtime, no en build
  }
  return API_BASE_URL
}
```

**Por qué funciona:**
- La función `getApiBaseUrl()` se ejecuta en **runtime**, no en build time
- En runtime, `process.env.NEXT_PUBLIC_API_URL` está disponible si se configuró en Railway
- Si no está disponible, usa el fallback inteligente basado en `NODE_ENV` o `window.location.hostname`

## 📝 Cambios Implementados

### 1. `frontend/app/auth/reset-password/[slug]/page.tsx`

**Antes:**
```typescript
export const revalidate = 0
export const dynamicParams = true
```

**Después:**
```typescript
export const dynamic = 'force-dynamic'  // ← AGREGADO
export const dynamicParams = true
export const revalidate = 0
```

**Función `getApiBaseUrl()` mejorada:**
```typescript
function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || ""
  let url = raw.trim()
  
  if (!url) {
    // Fallback inteligente según entorno
    if (process.env.NODE_ENV === 'production') {
      url = "https://habanaluna-backend-production.up.railway.app"
    } else {
      url = "http://localhost:4000"
    }
  }
  
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`
  }
  
  return url.replace(/\/api\/?$/, "")
}
```

### 2. `frontend/lib/api.ts`

**Antes:**
```typescript
let API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000")
```

**Después:**
```typescript
let API_BASE_URL: string | null = null

function getApiBaseUrlLazy(): string {
  if (!API_BASE_URL) {
    API_BASE_URL = getApiBaseUrl()
  }
  return API_BASE_URL
}

// Todas las referencias cambiadas de API_BASE_URL a getApiBaseUrlLazy()
```

**Cambios en todas las funciones:**
- `refreshAccessToken()`: Usa `getApiBaseUrlLazy()`
- `api.get()`: Usa `getApiBaseUrlLazy()`
- `api.post()`: Usa `getApiBaseUrlLazy()`
- `api.patch()`: Usa `getApiBaseUrlLazy()`
- `api.put()`: Usa `getApiBaseUrlLazy()`
- `api.delete()`: Usa `getApiBaseUrlLazy()`
- `uploadImage()`: Usa `getApiBaseUrlLazy()`
- `normalizeImageUrl()`: Usa `getApiBaseUrlLazy()`

### 3. `frontend/next.config.js`

**No requiere cambios** - La configuración actual es correcta:
- `trailingSlash: false` ✅
- Sin `output: 'standalone'` ✅ (como solicitaste)
- `images.remotePatterns` configurado ✅

## 🚀 Configuración de Railway

### Frontend Service

**Settings → General:**
- Root Directory: `frontend`

**Settings → Build & Deploy:**
- Build Command: `npm run build`
- Start Command: `npm start`

**Settings → Variables:**
```env
NEXT_PUBLIC_API_URL=https://habanaluna-backend-production.up.railway.app
NODE_ENV=production
```

**⚠️ CRÍTICO:**
- `NEXT_PUBLIC_API_URL` debe estar configurada **ANTES** del primer build
- Si la agregas después, necesitas hacer un nuevo deploy para que se inyecte

### Backend Service

**Settings → Variables:**
```env
FRONTEND_URL=https://habaluna.com
NODE_ENV=production
PORT=4000
```

## ✅ Verificación Post-Deploy

### 1. Verificar ruta dinámica

Visita:
```
https://habaluna.com/auth/reset-password/test-token-123
```

**Debería:**
- ✅ Cargar la página (no 404)
- ✅ Mostrar el formulario
- ✅ No mostrar errores en consola

### 2. Verificar fetch URL

En consola del navegador:
```javascript
window.__HABANALUNA_API_CONFIG
```

**Debería mostrar:**
```javascript
{
  baseUrl: "https://habanaluna-backend-production.up.railway.app",
  fullApiUrl: "https://habanaluna-backend-production.up.railway.app/api",
  envVar: "https://habanaluna-backend-production.up.railway.app",
  hostname: "habaluna.com"
}
```

**❌ Si muestra `localhost:4000`:**
- La variable no está configurada en Railway
- O no se configuró antes del build
- **Solución:** Configurar variable y hacer nuevo deploy

### 3. Verificar Network Tab

Abre DevTools → Network y busca requests a la API.

**Deberían ser:**
```
https://habanaluna-backend-production.up.railway.app/api/...
```

**No deberían ser:**
```
http://localhost:4000/api/...
```

## 🐛 Troubleshooting

### 404 persiste después de los cambios

1. **Verificar que el deploy se completó:**
   - Railway Dashboard → Deployments → Verificar que el último deploy está "Active"

2. **Verificar logs de Railway:**
   - Buscar errores durante el build
   - Verificar que `export const dynamic = 'force-dynamic'` está en el código desplegado

3. **Limpiar cache del navegador:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) o `Cmd+Shift+R` (Mac)

### Fetch sigue apuntando a localhost

1. **Verificar variable en Railway:**
   - Dashboard → Frontend Service → Variables
   - Debe estar: `NEXT_PUBLIC_API_URL=https://habanaluna-backend-production.up.railway.app`

2. **Hacer nuevo deploy:**
   - La variable debe estar configurada **antes** del build
   - Si la agregaste después, hacer un nuevo deploy

3. **Verificar en consola:**
   ```javascript
   console.log(process.env.NEXT_PUBLIC_API_URL)  // undefined en navegador (normal)
   window.__HABANALUNA_API_CONFIG  // Debe mostrar la URL correcta
   ```

## 📚 Referencias

- [Next.js Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [Next.js Route Segment Config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
