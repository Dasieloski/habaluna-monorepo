# Diagnóstico: Configuración de Next.js para Standalone

## ✅ Verificación de Configuración Actual

### 1. next.config.js
```javascript
output: 'standalone',  // ✅ CORRECTO
```
**Estado:** ✅ Configurado correctamente

### 2. package.json - Scripts
```json
{
  "scripts": {
    "build": "NEXT_PRIVATE_SKIP_TURBOPACK=1 next build",  // ✅ CORRECTO
    "start": "node .next/standalone/server.js"             // ✅ CORRECTO
  }
}
```
**Estado:** ✅ Scripts correctos
- Build ejecuta `next build` (sin Turbopack)
- Start ejecuta directamente el servidor standalone
- NO usa `next start` (incompatible con standalone)

## 🔍 Análisis del Error

### Error Reportado:
```
Cannot find module '.next/standalone/server.js'
```

### Diagnóstico:
El archivo `.next/standalone/server.js` **NO existe** después del build.

### Posibles Causas:

#### 1. ❌ Build NO se ejecutó
**Síntoma:** No hay logs de `next build` antes del `npm start`
**Solución:** Railway debe tener **Build Command** configurado: `npm run build`

#### 2. ❌ Build se ejecutó pero falló
**Síntoma:** Logs muestran errores durante el build
**Solución:** Revisar logs de build para identificar el error

#### 3. ❌ Build se ejecutó con Turbopack (no genera standalone)
**Síntoma:** Logs muestran `Next.js 16.0.10 (Turbopack)`
**Solución:** Ya está resuelto con `NEXT_PRIVATE_SKIP_TURBOPACK=1`

#### 4. ❌ Build exitoso pero standalone no se generó
**Síntoma:** Build completa sin errores pero no hay `.next/standalone/`
**Solución:** Verificar que `output: 'standalone'` esté en `next.config.js` ✅

## ✅ Configuración Correcta (Actual)

### next.config.js
```javascript
const nextConfig = {
  output: 'standalone',  // ✅ Requerido para generar .next/standalone/server.js
  // ... resto de configuración
};
```

### package.json
```json
{
  "scripts": {
    "build": "NEXT_PRIVATE_SKIP_TURBOPACK=1 next build",
    "start": "node .next/standalone/server.js"
  }
}
```

**Explicación:**
- `NEXT_PRIVATE_SKIP_TURBOPACK=1`: Fuerza Webpack (Turbopack no genera standalone)
- `next build`: Ejecuta el build que genera `.next/standalone/`
- `node .next/standalone/server.js`: Ejecuta el servidor standalone (NO `next start`)

## 🔧 Configuración Requerida en Railway

### Settings → Build & Deploy

1. **Root Directory:**
   ```
   frontend
   ```

2. **Build Command:**
   ```
   npm run build
   ```
   **CRÍTICO:** Debe estar configurado explícitamente

3. **Start Command:**
   ```
   npm start
   ```
   O puede dejarse vacío (Railway usará `npm start` por defecto)

## 📋 Verificación Post-Build

Después de ejecutar `npm run build`, debe existir:

```
.next/
├── standalone/
│   ├── server.js          ← DEBE existir
│   ├── package.json
│   └── node_modules/
└── static/
```

### Comando de Verificación:
```bash
ls -la .next/standalone/server.js
```

Si el archivo existe: ✅ Build correcto
Si el archivo NO existe: ❌ Build falló o no se ejecutó

## 🚨 Si el Standalone NO se Genera

### Opción 1: Verificar que el build se ejecute
```bash
# En Railway, verificar logs de build
npm run build
# Debe mostrar: "Creating standalone build"
```

### Opción 2: Verificar next.config.js
```javascript
// Debe tener:
output: 'standalone'
```

### Opción 3: Alternativa sin Standalone
Si Railway no puede generar standalone, eliminar de `next.config.js`:
```javascript
// ELIMINAR esta línea:
// output: 'standalone',
```

Y cambiar `package.json`:
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start"  // Compatible sin standalone
  }
}
```

**⚠️ ADVERTENCIA:** Sin standalone, las rutas dinámicas pueden tener problemas en Railway.

## ✅ Checklist de Configuración

- [x] `next.config.js` tiene `output: 'standalone'`
- [x] `package.json` script `build` ejecuta `next build`
- [x] `package.json` script `start` ejecuta `node .next/standalone/server.js`
- [x] NO se usa `next start` con `output: 'standalone'`
- [x] Build deshabilita Turbopack: `NEXT_PRIVATE_SKIP_TURBOPACK=1`
- [ ] Railway tiene **Build Command** configurado: `npm run build`
- [ ] Railway tiene **Root Directory** configurado: `frontend`
- [ ] El build genera `.next/standalone/server.js`

## 📝 Resumen

**Configuración actual:** ✅ CORRECTA

**Problema:** El build NO se está ejecutando en Railway, o se ejecuta pero no genera standalone.

**Solución:** Configurar Railway para ejecutar `npm run build` antes de `npm start`.

**Resultado esperado:**
1. Railway ejecuta `npm run build`
2. Build genera `.next/standalone/server.js`
3. Railway ejecuta `npm start`
4. Servidor inicia correctamente
