# Solución: Frontend se queda en "taking a snapshot" en Railway

## 🔍 Problema

El frontend se queda atascado en la fase "taking a snapshot of the code" y nunca avanza, hasta que Railway cancela el despliegue.

**Mensaje de error en logs:**
```
skipping 'Dockerfile' at 'frontend/Dockerfile' as it is not rooted at a valid path (root_dir=, fileOpts={acceptChildOfRepoRoot:false})
```

## 🎯 Causa Raíz

Railway está intentando usar el Dockerfile pero **no puede encontrarlo** porque:
1. El `railway.json` está configurado para usar `DOCKERFILE`
2. Pero el **Root Directory** en Railway Dashboard no está configurado como `frontend`
3. Railway busca el Dockerfile en la raíz del repositorio, no en `frontend/`

## ✅ Soluciones

### Opción 1: Usar Nixpacks (RECOMENDADO - Ya implementado)

**Ventajas:**
- ✅ Nixpacks detecta automáticamente el proyecto Next.js
- ✅ No requiere configuración de Root Directory específica
- ✅ Más rápido para proyectos Node.js/Next.js
- ✅ Railway lo maneja automáticamente

**Cambios realizados:**
1. ✅ Cambiado `railway.json` para usar `NIXPACKS` en lugar de `DOCKERFILE`
2. ✅ Creado `frontend/nixpacks.toml` con configuración explícita

**Configuración en Railway Dashboard:**
- **Root Directory**: `frontend` (o vacío, Nixpacks lo detectará)
- **Build Command**: (vacío, Nixpacks lo maneja automáticamente)
- **Start Command**: (vacío, usa `nixpacks.toml`)

### Opción 2: Usar Dockerfile (Requiere Root Directory)

Si prefieres usar Dockerfile:

**Configuración en Railway Dashboard:**
1. **Root Directory**: `frontend` (CRÍTICO)
2. **Build Command**: (vacío, usa Dockerfile)
3. **Start Command**: (vacío, usa Dockerfile CMD)

**railway.json:**
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  }
}
```

## 📋 Configuración Actual (Nixpacks)

### frontend/railway.json
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start"
  }
}
```

### frontend/nixpacks.toml
```toml
[phases.setup]
nixPkgs = ['nodejs-20_x', 'python3', 'make', 'gcc']

[phases.install]
cmds = ['npm ci --prefer-offline --no-audit || npm install --prefer-offline --no-audit']

[phases.build]
cmds = ['npm run build']

[start]
cmd = 'npm start'
```

## 🔧 Pasos para Resolver

### 1. Verificar Configuración en Railway Dashboard

**Frontend Service → Settings → Build & Deploy:**

- **Root Directory**: `frontend` (o dejar vacío si usas Nixpacks)
- **Build Command**: (dejar vacío)
- **Start Command**: (dejar vacío)

### 2. Verificar Variables de Entorno

**Frontend Service → Settings → Variables:**

- `NEXT_PUBLIC_API_URL=https://habanaluna-backend-production.up.railway.app`
- `NODE_ENV=production`

### 3. Hacer Nuevo Deploy

1. Hacer commit y push de los cambios
2. Railway detectará automáticamente los cambios
3. O hacer deploy manual desde Railway Dashboard

## 📊 Logs Esperados (Nixpacks)

**Fase de Setup:**
```
[setup] Installing nix packages: nodejs-20_x, python3, make, gcc
```

**Fase de Install:**
```
[install] Running: npm ci --prefer-offline --no-audit
```

**Fase de Build:**
```
[build] Running: npm run build
> next build --webpack
Creating an optimized production build...
✓ Compiled successfully
✓ Creating standalone build
```

**Fase de Start:**
```
[start] Running: npm start
> node .next/standalone/server.js
▲ Next.js 16.0.10
- Local: http://localhost:3000
```

## ⚠️ Si Aún Hay Problemas

### Verificar que Railway detecte el proyecto

En Railway Dashboard → Frontend Service → Settings:
- Verificar que Railway detecta "Node.js" o "Next.js" como tipo de proyecto
- Si no lo detecta, forzar tipo en configuración

### Verificar que los archivos estén en el repositorio

```bash
# Verificar que railway.json existe
ls -la frontend/railway.json

# Verificar que nixpacks.toml existe
ls -la frontend/nixpacks.toml

# Verificar que package.json existe
ls -la frontend/package.json
```

### Limpiar y Re-deploy

1. En Railway Dashboard → Frontend Service → Settings → Danger Zone
2. Click en "Clear Build Cache"
3. Hacer nuevo deploy

## ✅ Checklist

- [x] `frontend/railway.json` configurado para usar NIXPACKS
- [x] `frontend/nixpacks.toml` creado con configuración correcta
- [ ] Root Directory configurado en Railway Dashboard (opcional con Nixpacks)
- [ ] Variables de entorno configuradas
- [ ] Nuevo deploy iniciado
- [ ] Logs muestran fases de setup → install → build → start

## 🔗 Referencias

- [Railway Nixpacks Documentation](https://docs.railway.app/deploy/builds#nixpacks)
- [Nixpacks Configuration](https://nixpacks.com/docs/configuration)
- [Railway Root Directory](https://docs.railway.app/deploy/builds#root-directory)
