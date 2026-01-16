# Solución para el Error 404 en Reset Password

## 🔍 Diagnóstico del Problema

El error 404 que estás viendo tiene estas características:
- `content-length: 10`
- `content-type: text/plain; charset=utf-8`
- No hay logs de Next.js en Railway

Esto sugiere que **la petición no está llegando a Next.js**, sino que está siendo bloqueada o rechazada por:
1. Un proxy/load balancer de Railway
2. La configuración del dominio personalizado
3. Un problema con el servidor standalone

## ✅ Cambios Realizados

1. **Simplificado la configuración de la ruta** - Removido `force-dynamic` que puede causar problemas
2. **Script de inicio robusto** - Detecta automáticamente si usar standalone o next start
3. **Configuración de Next.js mejorada** - Agregado experimental config

## 🔧 Soluciones Adicionales a Probar

### 1. Verificar Configuración de Railway

En el dashboard de Railway, verifica:

**Settings → Network:**
- Asegúrate de que el puerto esté configurado correctamente (8080 o el que uses)
- Verifica que no haya reglas de routing que bloqueen rutas dinámicas

**Settings → Build & Deploy:**
- Build Command: `npm run build`
- Start Command: `npm start`
- Root Directory: `frontend` (si está en el root del monorepo)

### 2. Verificar Dominio Personalizado

Si estás usando un dominio personalizado (habaluna.com):

1. Ve a **Settings → Domains** en Railway
2. Verifica que el dominio esté correctamente configurado
3. Asegúrate de que el proxy esté pasando todas las rutas a Next.js

### 3. Verificar Logs de Railway

Ejecuta en Railway:
```bash
railway logs --tail 100
```

Busca:
- Si la petición llega a Next.js (deberías ver logs de `[ResetPassword]`)
- Si hay errores de routing
- Si el servidor standalone se está iniciando correctamente

### 4. Probar con Ruta Directa

Prueba acceder directamente a la URL de Railway (sin dominio personalizado):
```
https://tu-servicio.railway.app/auth/reset-password/test-token
```

Si funciona ahí pero no con el dominio personalizado, el problema está en la configuración del dominio.

### 5. Crear Archivo de Configuración de Railway

Si el problema persiste, crea un archivo `nixpacks.toml` en `frontend/`:

```toml
[phases.setup]
nixPkgs = ['nodejs-18_x']

[phases.install]
cmds = ['npm ci']

[phases.build]
cmds = ['npm run build']

[start]
cmd = 'npm start'
```

### 6. Verificar que el Build Incluye la Ruta

Después del deploy, verifica en los logs de build que la ruta esté incluida:

```
Route (app)                              Size     First Load JS
├ ○ /auth/reset-password/[slug]         XXX kB   XXX kB
```

Si no aparece, hay un problema con el build.

## 🚨 Si Nada Funciona

Como último recurso, puedes crear una ruta API que maneje el reset-password:

1. Crear `app/api/auth/reset-password/[token]/route.ts`
2. Redirigir a una página estática con el token como query parameter
3. La página estática maneja el reset

Esto evita el problema de las rutas dinámicas en producción.

## 📝 Notas Importantes

- El servidor standalone solo funciona si el build se ejecuta correctamente
- Railway puede tener un proxy delante que necesita configuración especial
- Los dominios personalizados pueden tener reglas de routing adicionales
