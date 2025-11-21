# 🚀 Instrucciones de Despliegue en Railway

## Resumen

Este proyecto está configurado para desplegarse en Railway con:
- **Backend**: NestJS API
- **Frontend**: Next.js
- **Base de Datos**: PostgreSQL

## ⚡ Inicio Rápido (5 minutos)

### Paso 1: Autenticarse

```bash
railway login
```

### Paso 2: Ejecutar Script de Configuración

```bash
./railway-setup.sh
```

Este script te guiará a través de:
- Vinculación del proyecto
- Configuración de servicios backend y frontend
- Recordatorios de variables de entorno

### Paso 3: Crear Base de Datos

En el dashboard de Railway:
1. Ve a tu proyecto
2. Click en "New" → "Database" → "Add PostgreSQL"
3. Railway creará automáticamente `DATABASE_URL`

### Paso 4: Configurar Variables de Entorno

#### Backend (en Railway Dashboard → Backend Service → Variables):

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=[genera uno con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
JWT_REFRESH_SECRET=[genera otro diferente]
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
NODE_ENV=production
FRONTEND_URL=https://habanluna.com
PORT=4000
```

#### Frontend (en Railway Dashboard → Frontend Service → Variables):

```env
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app/api
```

**Nota:** Actualiza `NEXT_PUBLIC_API_URL` después de obtener la URL del backend.

### Paso 5: Desplegar

**Opción A: Desde CLI**
```bash
cd backend && railway up
cd ../frontend && railway up
```

**Opción B: Desde Dashboard**
- Conecta tu repositorio de GitHub
- Railway desplegará automáticamente en cada push

### Paso 6: Configurar Dominio habanluna.com

#### En Railway:

1. **Frontend Service:**
   - Settings → Networking → Custom Domain
   - Agrega: `habanluna.com` y `www.habanluna.com`
   - Copia los valores CNAME que Railway proporciona

2. **Backend Service:**
   - Settings → Networking → Custom Domain
   - Agrega: `api.habanluna.com`
   - Copia el valor CNAME

#### En GoDaddy:

1. Inicia sesión en GoDaddy
2. DNS Management para `habanluna.com`
3. Agrega estos registros CNAME:

```
@ → [CNAME del frontend de Railway]
www → [CNAME del frontend de Railway]
api → [CNAME del backend de Railway]
```

**TTL:** 3600 (o el valor por defecto)

### Paso 7: Actualizar Variables Finales

Después de que los dominios estén activos (puede tardar 1-2 horas):

**Backend:**
```env
FRONTEND_URL=https://habanluna.com
```

**Frontend:**
```env
NEXT_PUBLIC_API_URL=https://api.habanluna.com/api
```

### Paso 8: Verificar

- ✅ Backend: https://api.habanluna.com/api/docs
- ✅ Frontend: https://habanluna.com
- ✅ Base de datos: Las migraciones se ejecutan automáticamente

## 📋 Checklist de Despliegue

- [ ] Autenticado en Railway (`railway login`)
- [ ] Proyecto vinculado (`railway link` en la raíz)
- [ ] Servicio PostgreSQL creado
- [ ] Servicio Backend vinculado y variables configuradas
- [ ] Servicio Frontend vinculado y variables configuradas
- [ ] Backend desplegado
- [ ] Frontend desplegado
- [ ] Dominios configurados en Railway
- [ ] DNS configurado en GoDaddy
- [ ] Variables de entorno actualizadas con URLs finales
- [ ] Todo funcionando correctamente

## 🔧 Comandos Útiles

```bash
# Ver logs
railway logs

# Ver logs en tiempo real
railway logs --follow

# Ejecutar comandos
railway run [comando]

# Ejecutar migraciones manualmente
railway run npx prisma migrate deploy

# Ver variables
railway variables

# Abrir dashboard
railway open

# Ver estado del servicio
railway status
```

## 🐛 Solución de Problemas

### Error: "Cannot login in non-interactive mode"
**Solución:** Ejecuta `railway login` en tu terminal local (no en scripts automatizados).

### Error de CORS
**Solución:** Verifica que `FRONTEND_URL` en el backend coincida exactamente con la URL del frontend (incluyendo `https://`).

### Frontend no puede conectar con backend
**Solución:** 
- Verifica que `NEXT_PUBLIC_API_URL` termine en `/api`
- Verifica que el backend esté funcionando visitando `/api/docs`

### Dominio no funciona
**Solución:**
- Los cambios DNS pueden tardar hasta 48 horas (normalmente 1-2 horas)
- Verifica los CNAME en GoDaddy
- Usa `dig habanluna.com` o `nslookup habanluna.com` para verificar

### Error de base de datos
**Solución:**
- Verifica que `DATABASE_URL` esté correctamente configurada
- Asegúrate de usar la referencia `${{Postgres.DATABASE_URL}}` si usas el plugin de PostgreSQL
- Revisa los logs del backend

## 📚 Documentación Adicional

- [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) - Guía detallada paso a paso
- [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md) - Documentación completa
- [Railway Docs](https://docs.railway.app)

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs: `railway logs`
2. Verifica las variables de entorno
3. Consulta la documentación de Railway
4. Revisa los archivos de configuración en este proyecto

