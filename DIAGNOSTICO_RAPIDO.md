# 🔍 Diagnóstico Rápido - Error 500 en Login

## Pasos Inmediatos para Diagnosticar

### 1. Ver los Logs del Backend en Railway

**Opción A: Desde el Dashboard**
1. Ve a https://railway.app
2. Selecciona tu proyecto
3. Haz clic en el servicio **Backend**
4. Ve a la pestaña **Logs** o **Deployments** → Último deployment → **Logs**
5. Busca mensajes que empiecen con `❌`

**Opción B: Desde la Terminal**
```bash
cd backend
railway logs --tail 100
```

### 2. Errores Comunes y Soluciones

#### ❌ Error: "JWT_SECRET is not configured"
**Solución:**
1. Ve a Railway → Backend → Variables
2. Agrega: `JWT_SECRET` con un valor seguro
3. Genera un secreto: `openssl rand -hex 32`
4. Reinicia el servicio

#### ❌ Error: "JWT_REFRESH_SECRET is not configured"
**Solución:**
1. Ve a Railway → Backend → Variables
2. Agrega: `JWT_REFRESH_SECRET` con un valor diferente
3. Genera un secreto: `openssl rand -hex 32`
4. Reinicia el servicio

#### ❌ Error: "Database table refresh_tokens does not exist"
**Solución:**
```bash
# Desde Railway Terminal o CLI
cd backend
railway run npx prisma migrate deploy
```

#### ❌ Error: "Cannot reach database server"
**Solución:**
1. Verifica que `DATABASE_URL` esté configurada en Railway
2. Si usas el plugin de PostgreSQL, verifica que esté conectado
3. Prueba la conexión: `railway run npx prisma db pull`

#### ❌ Error: "Login failed: [mensaje]"
**Solución:**
- Revisa el mensaje completo en los logs
- Comparte el error completo para diagnóstico

### 3. Verificar Variables de Entorno

**En Railway → Backend → Variables, verifica que tengas:**

```env
JWT_SECRET=xxx (debe existir)
JWT_REFRESH_SECRET=xxx (debe existir)
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
DATABASE_URL=postgresql://... (debe existir)
FRONTEND_URL=https://www.habaluna.com
NODE_ENV=production
PORT=4000
```

### 4. Verificar Migraciones

**Ejecuta:**
```bash
railway run npx prisma migrate status
```

**Si hay migraciones pendientes:**
```bash
railway run npx prisma migrate deploy
```

### 5. Probar la Conexión a la Base de Datos

```bash
railway run npx prisma db pull
```

Si esto falla, hay un problema con `DATABASE_URL`.

## 🚨 Checklist de Emergencia

- [ ] ¿Tienes `JWT_SECRET` en Railway? → **AGREGAR SI FALTA**
- [ ] ¿Tienes `JWT_REFRESH_SECRET` en Railway? → **AGREGAR SI FALTA**
- [ ] ¿Tienes `DATABASE_URL` en Railway? → **VERIFICAR**
- [ ] ¿Se ejecutaron las migraciones? → **EJECUTAR SI NO**
- [ ] ¿Los logs muestran un error específico? → **LEER Y COMPARTIR**

## 📋 Comandos Útiles

```bash
# Ver logs en tiempo real
railway logs --tail 50

# Verificar estado de migraciones
railway run npx prisma migrate status

# Ejecutar migraciones
railway run npx prisma migrate deploy

# Generar cliente Prisma
railway run npx prisma generate

# Verificar conexión a BD
railway run npx prisma db pull
```

## 🆘 Si Nada Funciona

**Comparte:**
1. Los últimos 50 líneas de logs del backend
2. Las variables de entorno que tienes (puedes ocultar los valores)
3. El resultado de: `railway run npx prisma migrate status`

