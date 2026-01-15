# Debug: Reset Password 404 - 5 Causas Probables

## 1. El fetch falla silenciosamente y Next.js no procesa la ruta (70% probabilidad)

**Causa:** El fetch a `ui-settings` falla en producción (red, timeout, CORS) y Next.js no reconoce la ruta como dinámica.

**Cómo descartar:**
- ✅ **AGREGADO:** Logs de consola en el servidor (ver `page.tsx` líneas 61-75)
- Revisar logs de Railway después del deploy
- Si NO ves los logs `[ResetPassword]`, el componente NO se está ejecutando
- Si ves los logs pero el fetch falla, el problema es la conexión al backend

**Solución si es esta causa:**
- Verificar que `NEXT_PUBLIC_API_URL` esté configurado correctamente en Railway
- Asegurar que el backend esté accesible desde el frontend
- Usar un endpoint más confiable o hacer el fetch de forma más robusta

---

## 2. El middleware se ejecuta aunque esté excluido del matcher (15% probabilidad)

**Causa:** El regex del matcher no está funcionando correctamente o hay un bug en Next.js 16 con route groups `(main)`.

**Cómo descartar:**
- Agregar logs en el middleware:
```typescript
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // DEBUG: Log para verificar si el middleware se ejecuta
  if (pathname.startsWith('/auth/reset-password')) {
    console.log('[Middleware] Procesando ruta reset-password:', pathname)
  }
  
  if (pathname.startsWith("/auth")) {
    return NextResponse.next()
  }
  // ...
}
```
- Revisar logs de Railway
- Si ves `[Middleware] Procesando ruta reset-password`, el middleware SÍ se está ejecutando (problema)
- Si NO ves el log, el middleware NO se ejecuta (correcto)

**Solución si es esta causa:**
- Verificar que el matcher excluya correctamente `/auth`
- Considerar mover la ruta fuera del route group `(main)`
- Usar un matcher más explícito

---

## 3. Railway está usando un proxy/nginx que bloquea la ruta (10% probabilidad)

**Causa:** Railway tiene un proxy delante de Next.js que no está configurado para pasar rutas dinámicas.

**Cómo descartar:**
- Verificar la configuración de Railway (no hay nginx por defecto, pero puede haber un proxy)
- Revisar los logs de Railway para ver si la petición llega a Next.js
- Probar acceder directamente a la ruta desde el servidor (SSH a Railway si es posible)
- Comparar con `/products/[slug]` que funciona - ¿qué tiene de diferente?

**Solución si es esta causa:**
- Configurar el proxy para pasar todas las rutas a Next.js
- Verificar que Railway no tenga reglas de routing que bloqueen rutas dinámicas
- Considerar usar `output: 'standalone'` en `next.config.js`

---

## 4. Error en el componente que causa fallo silencioso (3% probabilidad)

**Causa:** El componente `ResetPasswordClient` o alguna dependencia está fallando y el error boundary no lo está capturando.

**Cómo descartar:**
- Agregar error boundary explícito:
```typescript
// En page.tsx, antes del return
try {
  return <ResetPasswordClient token={decodedToken} />
} catch (error) {
  console.error('[ResetPassword] Error renderizando:', error)
  throw error
}
```
- Revisar si `ResetPasswordClient` tiene algún import que falle
- Verificar que todas las dependencias estén instaladas en producción
- Revisar logs de Railway para errores de renderizado

**Solución si es esta causa:**
- Corregir el error en el componente
- Agregar error boundaries más robustos
- Verificar que todas las dependencias estén en `package.json`

---

## 5. Next.js 16 no reconoce la ruta dinámica en Railway (2% probabilidad)

**Causa:** Bug conocido de Next.js 16 con rutas dinámicas en ciertos entornos de producción.

**Cómo descartar:**
- Verificar la versión de Next.js: `npm list next`
- Revisar si hay issues conocidos en GitHub de Next.js sobre rutas dinámicas
- Probar con `output: 'standalone'` en `next.config.js`
- Comparar la estructura de `/products/[slug]` que funciona vs `/auth/reset-password/[token]`

**Solución si es esta causa:**
- Actualizar Next.js a la última versión
- Usar `output: 'standalone'` en `next.config.js`
- Considerar usar `generateStaticParams` con un enfoque diferente
- Reportar el bug a Next.js si es un issue conocido

---

## Pasos de Debug Recomendados (en orden)

1. **Revisar logs de Railway** después del deploy con los nuevos logs
2. **Verificar variables de entorno** en Railway (`NEXT_PUBLIC_API_URL`)
3. **Probar la ruta localmente** con `npm run build && npm start` para simular producción
4. **Comparar con `/products/[slug]`** que funciona - ver diferencias
5. **Revisar la consola del navegador** para errores de JavaScript
6. **Verificar que el build incluya la ruta**: `npm run build` debe mostrar `├ ƒ /auth/reset-password/[token]`

---

## Comandos Útiles para Debug

```bash
# Verificar que la ruta está en el build
npm run build | grep "reset-password"

# Probar localmente en modo producción
npm run build
npm start

# Ver logs en Railway
railway logs

# Verificar variables de entorno
railway variables
```
