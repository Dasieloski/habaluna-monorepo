# Configuración: Railway Servicio Frontend Independiente

## 🔍 Problema Identificado

Railway está ejecutando el script `start` del **root del monorepo**, que intenta iniciar backend y frontend juntos:

```json
// package.json (root)
{
  "scripts": {
    "start": "concurrently \"npm run start:backend\" \"npm run start:frontend\""
  }
}
```

**Esto NO es correcto para Railway** porque:
1. Railway debe ejecutar cada servicio (frontend/backend) **independientemente**
2. El script del root intenta iniciar ambos servicios
3. El frontend falla porque el build no se ejecutó
4. El backend falla porque falta `DATABASE_URL`

## ✅ Solución: Configurar Railway Correctamente

### Para el Servicio Frontend en Railway:

**Settings → Build & Deploy:**

1. **Root Directory:**
   ```
   frontend
   ```
   **CRÍTICO:** Esto hace que Railway ejecute comandos directamente en `frontend/`, NO desde el root.

2. **Build Command:**
   ```
   npm run build
   ```
   Esto ejecutará: `NEXT_PRIVATE_SKIP_TURBOPACK=1 next build` (desde frontend/)

3. **Start Command:**
   ```
   npm start
   ```
   Esto ejecutará: `node .next/standalone/server.js` (desde frontend/)

4. **Watch Paths:**
   ```
   /frontend/**
   ```

### ¿Por qué Root Directory = `frontend`?

Con `Root Directory = frontend`:
- ✅ Railway cambia al directorio `frontend/` antes de ejecutar comandos
- ✅ `npm run build` se ejecuta en `frontend/`, no en el root
- ✅ `npm start` se ejecuta en `frontend/`, no en el root
- ✅ El standalone se genera en `frontend/.next/standalone/server.js`
- ✅ El start encuentra el archivo en `.next/standalone/server.js` (relativo a frontend/)

**NO ejecuta el script del root:**
- ❌ NO ejecuta `npm start` del root (que usa concurrently)
- ❌ NO intenta iniciar backend y frontend juntos
- ✅ Ejecuta directamente los scripts de `frontend/package.json`

## 📋 Verificación

Después de configurar, en los logs deberías ver:

**Fase de Build:**
```
> habanaluna-frontend@1.0.0 build
> NEXT_PRIVATE_SKIP_TURBOPACK=1 next build
Creating an optimized production build ...
✓ Creating standalone build
```

**Fase de Start:**
```
> habanaluna-frontend@1.0.0 start
> node .next/standalone/server.js
▲ Next.js 16.0.10
- Local: http://localhost:8080
```

**NO deberías ver:**
```
> habanaluna-ecommerce@1.0.0 start
> concurrently "npm run start:backend" "npm run start:frontend"
```

## 🚨 Error Actual

El error que estás viendo:
```
> habanaluna-ecommerce@1.0.0 start
> concurrently "npm run start:backend" "npm run start:frontend"
```

Indica que Railway está ejecutando desde el **root del monorepo**, no desde `frontend/`.

**Solución:** Configurar **Root Directory = `frontend`** en Railway.

## ✅ Checklist

- [ ] Root Directory configurado como `frontend`
- [ ] Build Command configurado como `npm run build`
- [ ] Start Command configurado como `npm start`
- [ ] NO usar `--workspace` en los comandos
- [ ] Railway ejecuta comandos desde `frontend/`, no desde root
- [ ] El build genera `.next/standalone/server.js` en `frontend/`
- [ ] El start encuentra el archivo correctamente

## 📝 Nota sobre Backend

El backend debe configurarse como un **servicio separado** en Railway:
- Root Directory: `backend`
- Build Command: `npm run build`
- Start Command: `npm run start:prod`
- Variables de entorno: `DATABASE_URL` (y otras necesarias)

Cada servicio (frontend y backend) debe ser **independiente** en Railway.
