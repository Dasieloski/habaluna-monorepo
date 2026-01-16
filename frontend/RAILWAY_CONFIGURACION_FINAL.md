# Configuración Final de Railway para Workspace

## ⚠️ Importante: Dos Opciones de Configuración

Dependiendo de cómo configures Railway, hay **dos formas** de hacerlo:

### Opción 1: Root Directory = `frontend` (RECOMENDADO)

**Settings → Build & Deploy:**

1. **Root Directory:**
   ```
   frontend
   ```

2. **Build Command:**
   ```
   npm run build
   ```
   (NO usar `--workspace` porque ya estás en el directorio frontend)

3. **Start Command:**
   ```
   npm start
   ```
   (NO usar `--workspace` porque ya estás en el directorio frontend)

4. **Watch Paths:**
   ```
   /frontend/**
   ```

**Ventajas:**
- ✅ Más simple y directo
- ✅ Railway ejecuta comandos directamente en `frontend/`
- ✅ No necesita conocer la estructura del workspace
- ✅ El standalone se genera en `.next/standalone/server.js` (relativo a frontend)

---

### Opción 2: Root Directory = vacío (raíz del monorepo)

**Settings → Build & Deploy:**

1. **Root Directory:**
   ```
   (vacío o raíz)
   ```

2. **Build Command:**
   ```
   npm run build --workspace=habanaluna-frontend
   ```

3. **Start Command:**
   ```
   npm run start --workspace=habanaluna-frontend
   ```

4. **Watch Paths:**
   ```
   /frontend/**
   ```

**Ventajas:**
- ✅ Railway ejecuta desde el root del monorepo
- ✅ Puede acceder a ambos workspaces (frontend y backend)
- ⚠️ Requiere usar `--workspace` en todos los comandos

**Desventajas:**
- ⚠️ Más complejo
- ⚠️ El standalone se genera en `frontend/.next/standalone/server.js`
- ⚠️ El start debe buscar en `frontend/.next/standalone/server.js`

---

## ✅ Recomendación: Opción 1

**Usa Root Directory = `frontend`** porque:
1. Es más simple
2. Railway ejecuta comandos directamente donde están los archivos
3. No necesitas `--workspace` en los comandos
4. El standalone se genera en la ubicación esperada

## 🔧 Configuración Recomendada (Opción 1)

### Settings → Build & Deploy

**Root Directory:**
```
frontend
```

**Build Command:**
```
npm run build
```

**Start Command:**
```
npm start
```

**Watch Paths:**
```
/frontend/**
```

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

## 🚨 Si Usas Opción 2 (con --workspace)

Si decides usar Root Directory vacío con `--workspace`, verifica que:

1. El build genera: `frontend/.next/standalone/server.js`
2. El start busca en: `frontend/.next/standalone/server.js`

Pero esto requiere modificar el script de start en `package.json` para buscar en la ruta correcta, lo cual es más complejo.

## ✅ Conclusión

**Usa la Opción 1 (Root Directory = `frontend`)** - Es más simple y directo.
