# Variables de Entorno para Railway

Esta guía explica qué variables de entorno necesitas configurar en Railway para que el frontend y backend funcionen correctamente.

## 🔧 Variables del Backend

En el servicio **Backend** de Railway, configura estas variables:

### Variables Requeridas:

```env
# Base de Datos (se genera automáticamente si usas el plugin de PostgreSQL)
DATABASE_URL=postgresql://usuario:password@host:puerto/database

# JWT - Genera secretos seguros (usa: openssl rand -hex 32)
JWT_SECRET=tu-secreto-jwt-super-seguro-aqui
JWT_REFRESH_SECRET=tu-secreto-refresh-super-seguro-aqui
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# URL del Frontend (IMPORTANTE: sin trailing slash)
FRONTEND_URL=https://tu-frontend.railway.app
# O si tienes dominio personalizado:
# FRONTEND_URL=https://habanaluna.com

# Configuración de la App
PORT=4000
NODE_ENV=production

# Upload Configuration (opcional)
UPLOAD_DEST=./uploads
MAX_FILE_SIZE=5242880
```

### ⚠️ IMPORTANTE sobre FRONTEND_URL:

- **NO** debe terminar con `/` (sin trailing slash)
- Debe ser la URL completa con `https://`
- Si usas dominio personalizado, puedes usar cualquiera de estas opciones:
  - `https://habaluna.com` (sin www)
  - `https://www.habaluna.com` (con www)
  - El código automáticamente permitirá ambas versiones (con y sin www)
- Si usas Railway temporal, usa la URL que Railway te asigna

**Ejemplos correctos:**
```
FRONTEND_URL=https://habaluna.com
# O también funciona:
FRONTEND_URL=https://www.habaluna.com
# O Railway:
FRONTEND_URL=https://habanaluna-production.up.railway.app
```

**Ejemplo incorrecto:**
```
FRONTEND_URL=https://habanaluna-production.up.railway.app/  ❌ (tiene / al final)
```

**Nota:** El código ahora permite automáticamente tanto la versión con `www` como sin `www` del mismo dominio, así que puedes configurar cualquiera de las dos.

## 🎨 Variables del Frontend

En el servicio **Frontend** de Railway, configura esta variable:

### Variable Requerida:

```env
# URL del Backend (debe terminar en /api)
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app/api
# O si tienes dominio personalizado:
# NEXT_PUBLIC_API_URL=https://api.habanaluna.com/api
```

### ⚠️ IMPORTANTE sobre NEXT_PUBLIC_API_URL:

- **SÍ** debe terminar con `/api`
- Debe ser la URL completa con `https://`
- Debe apuntar al servicio backend de Railway

**Ejemplo correcto:**
```
NEXT_PUBLIC_API_URL=https://habanaluna-backend.up.railway.app/api
```

**Ejemplo incorrecto:**
```
NEXT_PUBLIC_API_URL=https://habanaluna-backend.up.railway.app  ❌ (falta /api)
```

## 📋 Checklist de Configuración

### Paso 1: Obtener las URLs de Railway

1. Ve al dashboard de Railway
2. Para cada servicio (Backend y Frontend):
   - Haz clic en el servicio
   - Ve a "Settings" → "Networking"
   - Copia la URL que Railway asigna (ej: `https://xxx.up.railway.app`)

### Paso 2: Configurar Backend

1. Ve al servicio **Backend**
2. Ve a "Variables"
3. Configura:
   - `FRONTEND_URL` = URL del servicio Frontend (sin `/` al final)
   - `DATABASE_URL` = Se genera automáticamente si usas el plugin
   - `JWT_SECRET` = Genera uno seguro
   - `JWT_REFRESH_SECRET` = Genera uno seguro diferente
   - `NODE_ENV` = `production`
   - `PORT` = `4000`

### Paso 3: Configurar Frontend

1. Ve al servicio **Frontend**
2. Ve a "Variables"
3. Configura:
   - `NEXT_PUBLIC_API_URL` = URL del servicio Backend + `/api`

### Paso 4: Verificar

1. **Backend**: Visita `https://tu-backend.railway.app/api/docs` (debe cargar Swagger)
2. **Frontend**: Visita `https://tu-frontend.railway.app` (debe cargar la app)
3. **Prueba de conexión**: Intenta hacer login o cargar productos desde el frontend

## 🔍 Solución de Problemas

### Problema: "CORS error" o "No carga nada del backend"

**Causa**: La variable `FRONTEND_URL` en el backend no coincide con la URL real del frontend.

**Solución**:
1. Verifica que `FRONTEND_URL` en el backend sea exactamente la URL del frontend (sin `/` al final)
2. Verifica que `NEXT_PUBLIC_API_URL` en el frontend apunte correctamente al backend
3. Reinicia ambos servicios después de cambiar las variables

### Problema: "Network error" o "Failed to fetch"

**Causa**: La URL del backend en el frontend es incorrecta.

**Solución**:
1. Verifica que `NEXT_PUBLIC_API_URL` termine en `/api`
2. Verifica que la URL del backend sea correcta (puedes probarla en el navegador)
3. Asegúrate de que el backend esté funcionando (visita `/api/docs`)

### Problema: "401 Unauthorized" o problemas de autenticación

**Causa**: Los secretos JWT no están configurados o son incorrectos.

**Solución**:
1. Genera nuevos secretos JWT seguros
2. Actualiza `JWT_SECRET` y `JWT_REFRESH_SECRET` en el backend
3. Reinicia el servicio backend

## 🚀 Después de Configurar

1. **Reinicia ambos servicios** en Railway (esto aplica las nuevas variables)
2. **Espera a que se desplieguen** (puede tomar 1-2 minutos)
3. **Prueba la conexión** desde el frontend

## 📝 Notas Importantes

- Las variables que empiezan con `NEXT_PUBLIC_` son públicas y se incluyen en el bundle del frontend
- Las variables del backend son privadas y solo el servidor las ve
- Railway reconstruye automáticamente cuando cambias variables de entorno
- Si cambias variables, espera a que termine el despliegue antes de probar

