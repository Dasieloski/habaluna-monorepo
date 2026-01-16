# Solución: Turbopack y Standalone Build

## 🔍 Problema Identificado

**Next.js 16.0.10 con Turbopack NO genera `output: 'standalone'` correctamente.**

### Síntomas:
- El build se ejecuta exitosamente
- La ruta `/auth/reset-password/[slug]` se lista en el build
- Pero `.next/standalone/server.js` NO se genera
- El start falla con: `Cannot find module '.next/standalone/server.js'`

### Causa Raíz:
Turbopack (el nuevo bundler de Next.js) aún no soporta completamente `output: 'standalone'`. Cuando Next.js 16 detecta que puede usar Turbopack, lo hace automáticamente, pero esto rompe la generación del standalone.

## ✅ Solución Aplicada

### 1. Forzar Webpack en el Build

**package.json:**
```json
{
  "scripts": {
    "build": "NEXT_PRIVATE_SKIP_TURBOPACK=1 next build"
  }
}
```

**Por qué funciona:**
- `NEXT_PRIVATE_SKIP_TURBOPACK=1` fuerza a Next.js a usar Webpack
- Webpack soporta completamente `output: 'standalone'`
- El standalone se genera correctamente en `.next/standalone/server.js`

### 2. Simplificar start.sh

**start.sh (antes):**
```sh
# Intentaba hacer rebuild si no existía
if [ ! -f ".next/standalone/server.js" ]; then
  npm run build  # ❌ Demasiado tarde, ya se ejecutó con Turbopack
fi
```

**start.sh (ahora):**
```sh
# Solo verifica que existe (el build ya se ejecutó)
if [ ! -f ".next/standalone/server.js" ]; then
  echo "❌ Error: El build debe ejecutarse ANTES del start"
  exit 1
fi
node .next/standalone/server.js
```

**Por qué:**
- El build DEBE ejecutarse en Railway Build Command (con NEXT_PRIVATE_SKIP_TURBOPACK=1)
- Si el standalone no existe, es un error de configuración, no algo que deba arreglarse en start
- El rebuild en start fallaría porque usaría Turbopack por defecto

## 🔧 Configuración de Railway

### Build Command (CRÍTICO):
```
npm run build
```

Esto ejecutará:
```bash
NEXT_PRIVATE_SKIP_TURBOPACK=1 next build
```

### Start Command:
```
npm start
```

Esto ejecutará:
```bash
sh start.sh
# Que verifica y ejecuta: node .next/standalone/server.js
```

### Root Directory:
```
frontend
```

## 📋 Verificación Post-Deploy

### 1. Logs de Build deben mostrar:
```
Creating an optimized production build ...
✓ Compiled successfully
✓ Creating standalone build  ← DEBE aparecer esto
✓ Generating static pages
Route (app)
├ ƒ /auth/reset-password/[slug]  ← La ruta debe aparecer
```

**NO debe aparecer:**
```
▲ Next.js 16.0.10 (Turbopack)  ← Si aparece esto, Turbopack se está usando
```

### 2. Logs de Start deben mostrar:
```
✅ Servidor standalone encontrado. Iniciando...
▲ Next.js 16.0.10
- Local: http://localhost:8080
```

### 3. Verificar que el standalone existe:
En Railway, después del build, debería existir:
```
/app/frontend/.next/standalone/server.js
```

## 🚨 Si el Problema Persiste

### Verificar que Railway ejecute el build correcto:

1. **Revisa los logs de build:**
   - Debe ejecutar: `npm run build`
   - NO debe mostrar: `(Turbopack)`
   - Debe mostrar: `Creating standalone build`

2. **Verifica Build Command en Railway:**
   - Settings → Build & Deploy → Build Command
   - Debe ser exactamente: `npm run build`
   - NO debe estar vacío

3. **Verifica variables de entorno:**
   - Railway puede tener variables que afecten el build
   - Asegúrate de que no haya `NEXT_PRIVATE_SKIP_TURBOPACK=0` o similar

4. **Verifica Root Directory:**
   - Debe ser: `frontend`
   - Si está vacío o en raíz, Railway puede no encontrar el package.json correcto

## 📝 Notas Técnicas

### ¿Por qué Turbopack no genera standalone?

Turbopack es el nuevo bundler de Next.js, aún en desarrollo. Aunque es más rápido que Webpack, aún no tiene soporte completo para todas las características, incluyendo `output: 'standalone'`. Esta es una limitación conocida de Next.js 16.

### ¿Cuándo se solucionará?

Next.js está trabajando en soporte completo de standalone en Turbopack, pero por ahora, para producción con `output: 'standalone'`, es necesario usar Webpack.

### Alternativa: Actualizar Next.js

Si en futuras versiones de Next.js (16.1+, 17+) Turbopack soporta standalone, se puede remover `NEXT_PRIVATE_SKIP_TURBOPACK=1`. Por ahora, es necesario mantenerlo.

## ✅ Resultado Esperado

Después de estos cambios:
- ✅ El build usa Webpack (no Turbopack)
- ✅ El standalone se genera correctamente
- ✅ El start ejecuta el servidor standalone sin errores
- ✅ La ruta `/auth/reset-password/[slug]` funciona en producción
