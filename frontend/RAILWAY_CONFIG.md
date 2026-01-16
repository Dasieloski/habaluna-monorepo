# Configuración de Railway para Frontend

## ⚠️ Problema Actual

Railway está ejecutando `npm start` sin ejecutar `npm run build` primero, causando que `.next/standalone/server.js` no exista.

## ✅ Solución Temporal

Se creó `start.sh` que verifica si el standalone existe y ejecuta el build si es necesario.

## 🔧 Configuración Correcta en Railway

### Settings → Build & Deploy

**Build Command:**
```
npm run build
```

**Start Command:**
```
npm start
```

**Root Directory:**
```
frontend
```

**Nixpacks Build Plan:**
- Si Railway usa Nixpacks, debería detectar automáticamente el `package.json` y ejecutar el build

### Verificar que el Build se Ejecute

En los logs de Railway, deberías ver:
```
> habanaluna-frontend@1.0.0 build
> next build
...
Creating an optimized production build
...
Route (app)                              Size     First Load JS
├ ○ /auth/reset-password/[slug]         XXX kB   XXX kB
```

### Si el Build NO se Ejecuta

1. **Verifica el Root Directory:**
   - Debe estar configurado como `frontend` (no vacío ni raíz)

2. **Verifica el Build Command:**
   - Debe ser exactamente: `npm run build`
   - No debe estar vacío

3. **Verifica que Railway detecte el proyecto:**
   - Railway debería detectar automáticamente que es un proyecto Node.js
   - Si no, puedes forzar usando Nixpacks

### Solución Definitiva

El script `start.sh` es una solución temporal. La solución definitiva es asegurar que Railway ejecute el build antes del start.

**Opción 1: Usar Dockerfile (Recomendado)**
- Railway usará el Dockerfile que ya ejecuta el build correctamente

**Opción 2: Configurar Build Command en Railway**
- Asegurar que el Build Command esté configurado correctamente
- Railway debería ejecutar build → start en ese orden

**Opción 3: Usar Nixpacks**
- Crear `nixpacks.toml` en `frontend/`:
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

## 📋 Verificación Post-Deploy

Después del deploy, verifica en los logs:

1. **Build se ejecuta:**
   ```
   > npm run build
   Creating an optimized production build
   ```

2. **Standalone se genera:**
   ```
   ✓ Creating standalone build
   ```

3. **Start ejecuta correctamente:**
   ```
   ✅ Iniciando servidor standalone...
   ```

4. **Servidor inicia:**
   ```
   ▲ Next.js 16.0.10
   - Local: http://localhost:8080
   ```
