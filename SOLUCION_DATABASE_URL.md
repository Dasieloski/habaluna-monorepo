# 🔧 Solución: Error de Conexión a Base de Datos

## Problema
```
Error: P1001: Can't reach database server at `postgres.railway.internal:5432`
```

Esto ocurre porque estás ejecutando el comando desde tu terminal local, pero `DATABASE_URL` está configurada con la URL interna de Railway que solo funciona dentro del entorno de Railway.

## ✅ Solución: Ejecutar desde Railway Dashboard

### Opción 1: Terminal del Dashboard (Recomendada)

**NO ejecutes desde tu terminal local.** En su lugar:

1. **Ve a Railway Dashboard**
   - Abre: https://railway.app
   - Selecciona tu proyecto
   - Haz clic en el servicio **Backend**

2. **Abre la Terminal del Deployment**
   - Ve a la pestaña **Deployments**
   - Haz clic en el último deployment (el que está activo)
   - Busca el botón **Terminal** o **View Logs** → **Terminal**
   - Esto abrirá una terminal dentro del entorno de Railway

3. **Ejecuta el comando desde ahí:**
   ```bash
   npx prisma db push
   ```

   Desde la terminal de Railway, la `DATABASE_URL` interna funcionará correctamente.

### Opción 2: Usar Railway CLI con el servicio correcto

Si prefieres usar CLI, asegúrate de estar vinculado al servicio correcto:

```bash
# Desde la raíz del proyecto
cd backend

# Vincula al servicio backend si no está vinculado
railway link

# Selecciona el servicio backend cuando te pregunte

# Ahora ejecuta el comando
railway run npx prisma db push
```

### Opción 3: Obtener URL Pública de la Base de Datos

Si quieres ejecutar desde tu terminal local, necesitas la URL pública:

1. **En Railway Dashboard:**
   - Ve al servicio de **PostgreSQL** (no el backend)
   - Ve a la pestaña **Variables**
   - Busca `DATABASE_URL` o `POSTGRES_URL`
   - Copia la URL (debe ser algo como: `postgresql://user:pass@host.railway.app:port/railway`)

2. **Temporalmente, en tu terminal local:**
   ```bash
   export DATABASE_URL="postgresql://user:pass@host.railway.app:port/railway"
   cd backend
   npx prisma db push
   ```

   ⚠️ **Nota:** No uses esta URL en producción, solo para este comando.

## 📋 Pasos Completos (Recomendado)

### 1. Ejecutar desde Railway Dashboard Terminal

1. Railway → Backend → Deployments → Último deployment → **Terminal**
2. Ejecuta: `npx prisma db push`
3. Espera a que termine (debería decir "The database is now in sync")

### 2. Verificar

```bash
# Desde la misma terminal de Railway
npx prisma db pull
```

Si no hay errores, las tablas se crearon correctamente.

### 3. (Opcional) Poblar con datos

```bash
npx prisma db seed
```

### 4. Probar Login

Después de esto, el login debería funcionar.

## 🔍 Verificar Variables de Entorno

En Railway → Backend → Variables, verifica que `DATABASE_URL` esté configurada. Si usas el plugin de PostgreSQL, debería generarse automáticamente.

## ⚠️ Importante

- **NO ejecutes `prisma db push` desde tu terminal local** si `DATABASE_URL` usa `railway.internal`
- **SÍ ejecuta desde la terminal del dashboard de Railway** o usando `railway run`
- La URL interna (`railway.internal`) solo funciona dentro del entorno de Railway

## 🆘 Si Sigue Fallando

1. Verifica que el servicio PostgreSQL esté funcionando en Railway
2. Verifica que `DATABASE_URL` esté configurada en Railway → Backend → Variables
3. Si usas el plugin de PostgreSQL, verifica que esté conectado al servicio Backend

