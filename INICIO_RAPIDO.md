# ⚡ Inicio Rápido - Despliegue en Railway

## ✅ Estado Actual

- ✅ Railway CLI instalado
- ✅ Autenticado en Railway como: ignacio garcia (ignacioga62@gmail.com)
- ✅ Proyecto "SUPERNOVA" detectado
- ✅ Frontend vinculado al proyecto

## 🚀 Pasos para Completar el Despliegue

### 1. Vincular Backend al Proyecto

```bash
cd backend
railway link
# Selecciona el proyecto "SUPERNOVA" o crea un nuevo servicio "Backend"
```

### 2. Crear Base de Datos PostgreSQL

**Opción A: Desde Dashboard**
1. Ve a https://railway.app
2. Selecciona tu proyecto "SUPERNOVA"
3. Click en "New" → "Database" → "Add PostgreSQL"
4. Railway creará automáticamente `DATABASE_URL`

**Opción B: Desde CLI**
```bash
railway add postgresql
```

### 3. Configurar Variables de Entorno del Backend

Ve al dashboard de Railway → Tu servicio Backend → Variables

Agrega estas variables:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=[genera uno con el comando de abajo]
JWT_REFRESH_SECRET=[genera otro diferente]
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
NODE_ENV=production
FRONTEND_URL=https://habanluna.com
PORT=4000
```

**Generar secretos JWT:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Ejecuta este comando dos veces para obtener dos secretos diferentes.

### 4. Configurar Variables de Entorno del Frontend

Ve al dashboard de Railway → Tu servicio Frontend → Variables

Agrega:

```env
NEXT_PUBLIC_API_URL=https://tu-backend-url.railway.app/api
```

**Nota:** Obtén la URL del backend desde el dashboard después de desplegarlo, luego actualiza esta variable.

### 5. Desplegar Servicios

**Opción A: Desde CLI**
```bash
# Backend
cd backend
railway up

# Frontend (en otra terminal o después)
cd frontend
railway up
```

**Opción B: Desde Dashboard**
- Si tienes el repositorio conectado a GitHub, Railway desplegará automáticamente
- O haz click en "Deploy" en cada servicio

### 6. Ejecutar Migraciones de Prisma

Después de desplegar el backend:

```bash
cd backend
railway run npx prisma migrate deploy
```

O desde el dashboard:
- Ve al servicio Backend
- Abre la terminal
- Ejecuta: `npx prisma migrate deploy`

### 7. Configurar Dominio habanluna.com

#### En Railway Dashboard:

**Frontend Service:**
1. Settings → Networking
2. Custom Domain → Agrega:
   - `habanluna.com`
   - `www.habanluna.com`
3. Copia los valores CNAME que Railway proporciona

**Backend Service:**
1. Settings → Networking
2. Custom Domain → Agrega:
   - `api.habanluna.com`
3. Copia el valor CNAME

#### En GoDaddy:

1. Inicia sesión en GoDaddy
2. Ve a "DNS Management" para `habanluna.com`
3. Agrega/modifica estos registros CNAME:

```
Tipo: CNAME
Nombre: @
Valor: [CNAME del frontend de Railway]
TTL: 3600

Tipo: CNAME
Nombre: www
Valor: [CNAME del frontend de Railway]
TTL: 3600

Tipo: CNAME
Nombre: api
Valor: [CNAME del backend de Railway]
TTL: 3600
```

### 8. Actualizar Variables Finales

Después de que los dominios estén activos (puede tardar 1-2 horas):

**Backend:**
```env
FRONTEND_URL=https://habanluna.com
```

**Frontend:**
```env
NEXT_PUBLIC_API_URL=https://api.habanluna.com/api
```

### 9. Verificar

- ✅ Backend: https://api.habanluna.com/api/docs
- ✅ Frontend: https://habanluna.com
- ✅ Base de datos: Las migraciones se ejecutan automáticamente

## 📋 Checklist

- [ ] Backend vinculado al proyecto
- [ ] Base de datos PostgreSQL creada
- [ ] Variables de entorno del backend configuradas
- [ ] Variables de entorno del frontend configuradas
- [ ] Backend desplegado
- [ ] Frontend desplegado
- [ ] Migraciones de Prisma ejecutadas
- [ ] Dominios configurados en Railway
- [ ] DNS configurado en GoDaddy
- [ ] Variables actualizadas con URLs finales
- [ ] Todo funcionando correctamente

## 🔧 Comandos Útiles

```bash
# Ver logs
railway logs

# Ver logs en tiempo real
railway logs --follow

# Ver estado
railway status

# Abrir dashboard
railway open

# Ejecutar comandos
railway run [comando]
```

## 📚 Documentación

- [DEPLOY_INSTRUCTIONS.md](./DEPLOY_INSTRUCTIONS.md) - Instrucciones completas
- [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) - Guía detallada
- [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md) - Documentación técnica

## 🆘 Problemas Comunes

### Error de CORS
Verifica que `FRONTEND_URL` en el backend coincida exactamente con la URL del frontend.

### Frontend no conecta con backend
Verifica que `NEXT_PUBLIC_API_URL` termine en `/api` y que el backend esté funcionando.

### Dominio no funciona
Los cambios DNS pueden tardar hasta 48 horas. Normalmente 1-2 horas.

