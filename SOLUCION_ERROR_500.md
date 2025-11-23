# Solución de Error 500 en Login

## 🔴 Error Actual
```
POST https://habanaluna-backend-production.up.railway.app/api/auth/login 500 (Internal Server Error)
```

## ✅ Pasos para Diagnosticar y Solucionar

### 1. Verificar Variables de Entorno en Railway Backend

Ve a Railway → Backend → Variables y verifica que tengas **TODAS** estas variables:

```env
# JWT - OBLIGATORIAS
JWT_SECRET=tu-secreto-jwt-aqui
JWT_REFRESH_SECRET=tu-secreto-refresh-diferente-aqui
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Base de Datos - OBLIGATORIA
DATABASE_URL=postgresql://usuario:password@host:puerto/database

# Frontend - OBLIGATORIA
FRONTEND_URL=https://www.habaluna.com

# Configuración
NODE_ENV=production
PORT=4000
```

**⚠️ IMPORTANTE:**
- `JWT_SECRET` y `JWT_REFRESH_SECRET` **DEBEN** estar configuradas
- Deben ser valores diferentes y seguros
- Si no las tienes, genera nuevas con: `openssl rand -hex 32`

### 2. Verificar los Logs del Backend

**En Railway Dashboard:**
1. Ve al servicio **Backend**
2. Ve a la pestaña **Logs** o **Deployments** → Último deployment → **Logs**
3. Busca mensajes que empiecen con `❌`:

**Errores comunes que verás:**

#### Error: "JWT_SECRET is not configured"
```
❌ JWT_SECRET no está configurado
```
**Solución:** Agrega la variable `JWT_SECRET` en Railway

#### Error: "JWT_REFRESH_SECRET is not configured"
```
❌ JWT_REFRESH_SECRET no está configurado
```
**Solución:** Agrega la variable `JWT_REFRESH_SECRET` en Railway

#### Error: "Database table refreshToken does not exist"
```
❌ Error al crear refreshToken en la base de datos: ...
Database table refreshToken does not exist. Please run migrations.
```
**Solución:** Ejecuta las migraciones de Prisma (ver paso 3)

#### Error: "Error en login"
```
❌ Error en login: [detalles del error]
```
**Solución:** Revisa el mensaje completo del error en los logs

### 3. Ejecutar Migraciones de Prisma

Si la tabla `RefreshToken` no existe, necesitas ejecutar las migraciones:

**Opción A: Desde Railway Terminal**
1. Ve a Railway → Backend → **Deployments**
2. Haz clic en el último deployment
3. Abre la **Terminal**
4. Ejecuta:
```bash
npx prisma migrate deploy
```

**Opción B: Desde Railway CLI**
```bash
cd backend
railway run npx prisma migrate deploy
```

**Opción C: Verificar el Schema**
Verifica que el schema de Prisma tenga la tabla `RefreshToken`:
```bash
# Ver el schema
cat backend/prisma/schema.prisma | grep -A 10 RefreshToken
```

### 4. Verificar Conexión a la Base de Datos

**En Railway:**
1. Ve al servicio **Backend** → **Variables**
2. Verifica que `DATABASE_URL` esté configurada
3. Si usas el plugin de PostgreSQL, debería generarse automáticamente

**Probar la conexión:**
```bash
# Desde Railway Terminal
railway run npx prisma db pull
```

### 5. Verificar que el Usuario Exista

Si el error es específico de un usuario, verifica que exista en la base de datos:

**Opción A: Desde Prisma Studio**
```bash
railway run npx prisma studio
```

**Opción B: Crear un usuario de prueba**
Si no tienes usuarios, puedes crear uno desde el endpoint de registro o desde Prisma Studio.

### 6. Desplegar los Cambios Mejorados

Los cambios que hice mejoran el logging. Desplégalos:

```bash
git add backend/src/auth/auth.service.ts backend/src/main.ts
git commit -m "Fix: Mejorar logging y manejo de errores en login"
git push
```

Espera a que Railway despliegue automáticamente (1-2 minutos).

### 7. Probar Nuevamente

Después de verificar todo:
1. Reinicia el servicio Backend en Railway
2. Intenta hacer login nuevamente
3. Revisa los logs para ver el error específico

## 🔍 Checklist de Verificación

- [ ] `JWT_SECRET` está configurada en Railway
- [ ] `JWT_REFRESH_SECRET` está configurada en Railway
- [ ] `DATABASE_URL` está configurada en Railway
- [ ] `FRONTEND_URL` está configurada en Railway
- [ ] Las migraciones de Prisma se han ejecutado
- [ ] El backend se ha desplegado correctamente
- [ ] Los logs muestran el error específico

## 📝 Generar Secretos JWT Seguros

Si necesitas generar nuevos secretos:

```bash
# Opción 1: OpenSSL
openssl rand -hex 32

# Opción 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Opción 3: Online
# Visita: https://generate-secret.vercel.app/32
```

**Ejemplo de valores:**
```
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
JWT_REFRESH_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4
```

## 🆘 Si Nada Funciona

Comparte:
1. **Los logs del backend** (especialmente los que empiezan con `❌`)
2. **Las variables de entorno** que tienes configuradas (puedes ocultar los valores)
3. **El error exacto** que ves en la consola del navegador
4. **Si las migraciones se ejecutaron** correctamente

## 📚 Recursos

- [Railway Logs](https://docs.railway.app/develop/logs)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [NestJS Error Handling](https://docs.nestjs.com/exception-filters)

