# Configuración de Railway para Monorepo/Workspace

## 🔍 Problema: Railway NO ejecuta build automáticamente en workspaces

### Contexto
- Proyecto es un **monorepo/workspace** (frontend en `/frontend`)
- Railway detecta el `package.json` en la raíz del monorepo
- Railway **NO ejecuta automáticamente** `npm run build` antes de `npm start`
- Esto causa que `.next/standalone/server.js` no exista cuando se ejecuta `start`

### ¿Por qué Railway no ejecuta build automáticamente?

En proyectos simples (no workspace), Railway:
1. Detecta `package.json`
2. Ejecuta `npm install`
3. Ejecuta `npm run build` (si existe)
4. Ejecuta `npm start`

En **workspaces/monorepos**, Railway:
1. Detecta el workspace root `package.json`
2. Ejecuta `npm install` en el root
3. **NO ejecuta build automáticamente** porque no sabe qué servicio necesita build
4. Ejecuta `npm start` directamente → ❌ Falla porque no hay build

## ✅ Solución: Configurar Build Command explícitamente

### Configuración en Railway Dashboard

**Settings → Build & Deploy:**

1. **Root Directory:**
   ```
   frontend
   ```
   Esto le dice a Railway que el servicio está en `/frontend`

2. **Build Command:**
   ```
   npm run build
   ```
   **CRÍTICO:** Debe estar configurado explícitamente. Railway NO lo ejecutará automáticamente en workspaces.

3. **Start Command:**
   ```
   npm start
   ```
   O puede dejarse vacío (Railway usará `npm start` por defecto)

### Verificación

Después de configurar, en los logs de Railway deberías ver:

**Fase de Build:**
```
> habanaluna-frontend@1.0.0 build
> NEXT_PRIVATE_SKIP_TURBOPACK=1 next build
Creating an optimized production build ...
✓ Compiled successfully
✓ Creating standalone build
✓ Generating static pages
```

**Fase de Start:**
```
> habanaluna-frontend@1.0.0 start
> node .next/standalone/server.js
▲ Next.js 16.0.10
- Local: http://localhost:8080
```

## 📋 Checklist de Configuración

- [ ] Root Directory configurado como `frontend`
- [ ] Build Command configurado como `npm run build`
- [ ] Start Command configurado como `npm start` (o vacío)
- [ ] Build se ejecuta ANTES del start (verificar en logs)
- [ ] `.next/standalone/server.js` existe después del build
- [ ] El servidor inicia sin errores

## 🚨 Si el Build NO se Ejecuta

### Síntomas:
- Logs muestran solo `npm start` sin `npm run build`
- Error: `Cannot find module '.next/standalone/server.js'`
- El start falla inmediatamente

### Solución:
1. Ve a Railway Dashboard → Settings → Build & Deploy
2. Verifica que **Build Command** esté configurado: `npm run build`
3. Verifica que **Root Directory** esté configurado: `frontend`
4. Guarda los cambios
5. Haz un nuevo deploy (Railway debería ejecutar build → start)

## 📝 Notas Técnicas

### ¿Por qué no usar start.sh con rebuild?

**Problema con rebuild en start:**
1. El build en start se ejecuta **después** de que Railway ya intentó iniciar
2. Railway puede reiniciar el servicio en loop si falla
3. El build en runtime es más lento y consume más recursos
4. Si el build falla en start, el servicio nunca inicia

**Solución correcta:**
- Build debe ejecutarse en la **fase de build** de Railway
- Start debe ser **directo** y **rápido**
- Si el standalone no existe, es un error de configuración, no algo que arreglar en runtime

### Estructura del Proyecto

```
monorepo/
├── package.json          # Workspace root
├── frontend/
│   ├── package.json      # Servicio frontend
│   ├── next.config.js    # output: 'standalone'
│   └── app/              # Next.js App Router
└── backend/
    └── package.json      # Servicio backend
```

Railway necesita saber:
- **Root Directory:** `frontend` (dónde está el servicio)
- **Build Command:** `npm run build` (qué ejecutar para build)
- **Start Command:** `npm start` (qué ejecutar para start)

## ✅ Resultado Esperado

Después de configurar correctamente:
1. ✅ Railway ejecuta `npm run build` en la fase de build
2. ✅ El build genera `.next/standalone/server.js`
3. ✅ Railway ejecuta `npm start` en la fase de start
4. ✅ El servidor inicia correctamente
5. ✅ La ruta `/auth/reset-password/[slug]` funciona
