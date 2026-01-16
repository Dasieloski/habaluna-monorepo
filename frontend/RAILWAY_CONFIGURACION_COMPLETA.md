# Configuración Completa de Railway para Next.js 16

## 📋 Configuración del Servicio Frontend en Railway

### Settings → General

**Root Directory:**
```
frontend
```

### Settings → Build & Deploy

**Build Command:**
```bash
npm run build
```

**Start Command:**
```bash
npm start
```

**Healthcheck Path (opcional):**
```
/
```

### Settings → Variables

**Variables de Entorno Requeridas:**

```env
NEXT_PUBLIC_API_URL=https://habanaluna-backend-production.up.railway.app
NODE_ENV=production
```

**⚠️ IMPORTANTE:**
- `NEXT_PUBLIC_API_URL` debe estar configurada **ANTES** del build
- No debe terminar con `/api` (el código lo agrega automáticamente)
- Debe usar `https://` (no `http://`)

## 📋 Configuración del Servicio Backend en Railway

### Settings → Variables

**Variables de Entorno Requeridas:**

```env
FRONTEND_URL=https://habaluna.com
NODE_ENV=production
PORT=4000
DATABASE_URL=<generado automáticamente por Railway>
JWT_SECRET=<tu-secreto-jwt>
JWT_REFRESH_SECRET=<tu-secreto-refresh>
```

## 🔍 Verificación Post-Deploy

### 1. Verificar que las rutas dinámicas funcionan

Visita en el navegador:
```
https://habaluna.com/auth/reset-password/test-token-123
```

**Debería:**
- ✅ Cargar la página (no 404)
- ✅ Mostrar el formulario de reset password
- ✅ No mostrar errores en la consola

### 2. Verificar que los fetch usan la URL correcta

Abre la consola del navegador (F12) y ejecuta:
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
- La variable `NEXT_PUBLIC_API_URL` no está configurada en Railway
- O no se configuró antes del build
- **Solución:** Configurar la variable y hacer un nuevo deploy

### 3. Verificar logs de Railway

En Railway Dashboard → Frontend Service → Deployments → Logs:

**Deberías ver:**
```
✓ Compiled successfully
✓ Creating an optimized production build
✓ Generating static pages
```

**No deberías ver:**
```
✗ Error: Route "/auth/reset-password/[slug]" not found
```

## 🐛 Troubleshooting

### Problema: 404 en rutas dinámicas

**Causa:** Falta `export const dynamic = 'force-dynamic'` en `page.tsx`

**Solución:** Verificar que `frontend/app/auth/reset-password/[slug]/page.tsx` tenga:
```typescript
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0
```

### Problema: Fetch a localhost:4000

**Causa:** `NEXT_PUBLIC_API_URL` no está configurada o no se configuró antes del build

**Solución:**
1. Ir a Railway Dashboard → Frontend Service → Variables
2. Agregar/editar: `NEXT_PUBLIC_API_URL=https://habanaluna-backend-production.up.railway.app`
3. Hacer un nuevo deploy (Railway lo hará automáticamente)

### Problema: Build falla

**Causa:** Dependencias faltantes o errores de TypeScript

**Solución:**
- Verificar que `package.json` tenga todas las dependencias
- Los errores de TypeScript están ignorados (`ignoreBuildErrors: true`)
- Revisar logs de build en Railway

### Problema: Middleware bloquea rutas

**Causa:** El middleware se ejecuta en rutas que debería excluir

**Solución:** Verificar que `middleware.ts` tenga:
```typescript
matcher: [
  '/((?!api|_next|favicon.ico|auth|admin|maintenance|coming-soon).*)',
]
```

## 📝 Checklist Pre-Deploy

- [ ] Root Directory configurado: `frontend`
- [ ] Build Command: `npm run build`
- [ ] Start Command: `npm start`
- [ ] Variable `NEXT_PUBLIC_API_URL` configurada (sin `/api` al final)
- [ ] Variable `NODE_ENV=production` configurada
- [ ] `page.tsx` tiene `export const dynamic = 'force-dynamic'`
- [ ] `next.config.js` no tiene `output: 'standalone'`
- [ ] Middleware excluye `/auth` del matcher

## 🚀 Pasos para Deploy

1. **Commit y push de cambios:**
   ```bash
   git add .
   git commit -m "fix: Configurar rutas dinámicas y fetch a producción"
   git push origin master
   ```

2. **Railway detectará el push y hará deploy automáticamente**

3. **Verificar variables de entorno en Railway Dashboard**

4. **Esperar a que el build complete**

5. **Probar la ruta dinámica:**
   ```
   https://habaluna.com/auth/reset-password/test-token
   ```

6. **Verificar en consola del navegador:**
   ```javascript
   window.__HABANALUNA_API_CONFIG
   ```
