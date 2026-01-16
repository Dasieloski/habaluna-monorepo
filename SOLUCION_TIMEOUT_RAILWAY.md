# Solución: Error "activity StartToClose timeout" en Railway

## 🔍 Problema

Railway está reportando el error **"activity StartToClose timeout"** durante el despliegue de frontend y backend. Este error indica que el proceso de build o start está tardando más del tiempo permitido por Railway.

## ⏱️ Timeouts por Defecto en Railway

- **Build timeout**: ~20 minutos
- **Start timeout**: ~5 minutos

## 🎯 Causas Identificadas

### Backend
1. **Compilación de `sharp`**: La instalación de `sharp` (dependencia nativa) puede tardar **10-15 minutos** en compilar
2. **Prisma generate/migrate**: En `start.sh` se ejecutan `prisma generate` y `prisma migrate deploy`, que pueden tardar varios minutos
3. **npm install**: Instalación de todas las dependencias sin optimización de cache

### Frontend
1. **Build de Next.js**: El build con `output: 'standalone'` puede tardar **5-10 minutos**
2. **Postbuild script**: El script `copy-standalone-assets.js` agrega tiempo adicional
3. **npm install**: Instalación de dependencias sin optimización

## ✅ Optimizaciones Implementadas

### 1. Backend Dockerfile

**Mejoras:**
- ✅ Instalación de dependencias del sistema necesarias para `sharp` (python3, make, g++)
- ✅ Mejor cacheo de dependencias: copiar `package*.json` antes del código fuente
- ✅ Uso de `npm ci --prefer-offline` para usar cache cuando está disponible
- ✅ `--no-audit` para acelerar instalación
- ✅ Prisma Client se genera durante el build (no en start.sh)

**Antes:**
```dockerfile
RUN npm install
COPY . .
RUN npm run build
RUN npx prisma generate
```

**Después:**
```dockerfile
# Copiar dependencias primero (mejor cacheo)
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --prefer-offline --no-audit

# Copiar código después
COPY . .
RUN npm run build && npx prisma generate
```

### 2. Backend start.sh

**Mejoras:**
- ✅ Verificar si Prisma Client ya está generado (evita regenerar en cada start)
- ✅ Timeouts opcionales para `prisma migrate deploy` y `prisma db seed` (si `timeout` está disponible)
- ✅ Fallback si `timeout` no está disponible

**Antes:**
```bash
npx prisma generate  # Siempre ejecutaba
npx prisma migrate deploy
```

**Después:**
```bash
# Solo generar si no existe
if [ ! -d "node_modules/.prisma/client" ]; then
  npx prisma generate
fi

# Con timeout opcional
if command -v timeout >/dev/null 2>&1; then
  timeout 60 npx prisma migrate deploy
fi
```

### 3. Frontend Dockerfile

**Mejoras:**
- ✅ Instalación de dependencias del sistema para `sharp` (si se usa)
- ✅ Uso de `npm ci` cuando existe `package-lock.json` (más rápido y determinístico)
- ✅ `--prefer-offline` para usar cache
- ✅ `--no-audit` para acelerar instalación
- ✅ Variables de entorno para optimizar build

**Antes:**
```dockerfile
RUN npm install --production=false
```

**Después:**
```dockerfile
RUN if [ -f package-lock.json ]; then \
      npm ci --prefer-offline --no-audit; \
    else \
      npm install --prefer-offline --no-audit --production=false; \
    fi
```

### 4. Archivos railway.json

**Creados para ambos servicios:**
- ✅ Configuración explícita de builder (DOCKERFILE)
- ✅ Política de reinicio en caso de fallo
- ✅ Comandos de start explícitos

## 📋 Configuración en Railway Dashboard

### Backend

**Settings → Build & Deploy:**
- **Root Directory**: `backend`
- **Build Command**: (vacío, usa Dockerfile)
- **Start Command**: (vacío, usa `railway.json` o Dockerfile CMD)

**Variables de Entorno:**
- `DATABASE_URL`: URL de PostgreSQL
- `DIRECT_URL`: (opcional) URL directa para Prisma
- `NODE_ENV=production`

### Frontend

**Settings → Build & Deploy:**
- **Root Directory**: `frontend`
- **Build Command**: (vacío, usa Dockerfile)
- **Start Command**: (vacío, usa `railway.json` o Dockerfile CMD)

**Variables de Entorno:**
- `NEXT_PUBLIC_API_URL`: URL del backend
- `NODE_ENV=production`

## 🚀 Tiempos Esperados Después de Optimizaciones

### Backend
- **Build**: 8-15 minutos (primera vez con sharp), 3-5 minutos (con cache)
- **Start**: 30-60 segundos (con Prisma Client pre-generado)

### Frontend
- **Build**: 5-8 minutos (primera vez), 3-5 minutos (con cache)
- **Start**: 10-20 segundos

## ⚠️ Si Aún Hay Timeouts

### Opción 1: Aumentar Recursos en Railway

En Railway Dashboard → Service → Settings → Resources:
- Aumentar CPU/Memory puede acelerar builds

### Opción 2: Usar Build Cache de Railway

Railway cachea automáticamente:
- `node_modules` entre builds
- Layers de Docker entre builds

**Verificar que Railway esté usando cache:**
- En logs de build, buscar: `Using cache` o `CACHED`

### Opción 3: Pre-build en CI/CD

Si los timeouts persisten, considerar:
- Pre-build en GitHub Actions
- Push de imágenes Docker pre-construidas a Railway

## 📊 Monitoreo

**Verificar en Railway Logs:**
1. Tiempo de build: Buscar `Build completed in X minutes`
2. Tiempo de start: Buscar `Server started in X seconds`
3. Errores de timeout: Buscar `activity StartToClose timeout`

**Logs Esperados (Backend):**
```
🔧 Generando Prisma Client...
✅ Prisma Client ya está generado, omitiendo...
🔄 Sincronizando schema de Prisma...
🚀 Iniciando servidor...
[Nest] Server listening on port 4000
```

**Logs Esperados (Frontend):**
```
> habanaluna-frontend@1.0.0 build
> next build --webpack
Creating an optimized production build...
✓ Compiled successfully
✓ Creating standalone build
> habanaluna-frontend@1.0.0 start
> node .next/standalone/server.js
▲ Next.js 16.0.10
- Local: http://localhost:3000
```

## ✅ Checklist de Verificación

- [x] Backend Dockerfile optimizado (cacheo de dependencias)
- [x] Backend start.sh optimizado (evita regenerar Prisma Client)
- [x] Frontend Dockerfile optimizado (npm ci, cacheo)
- [x] Archivos railway.json creados
- [ ] Railway configurado con Root Directory correcto
- [ ] Variables de entorno configuradas
- [ ] Primer build completado (puede tardar 15-20 min)
- [ ] Builds subsecuentes más rápidos (3-8 min)

## 🔗 Referencias

- [Railway Build Timeouts](https://docs.railway.app/deploy/builds#build-timeouts)
- [Docker Layer Caching](https://docs.docker.com/build/cache/)
- [npm ci vs npm install](https://docs.npmjs.com/cli/v9/commands/npm-ci)
