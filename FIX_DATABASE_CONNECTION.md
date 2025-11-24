# 🔧 Solución: Error de Conexión a Base de Datos

## Problema
```
Error: P1001: Can't reach database server at `postgres.railway.internal:5432`
```

Esto indica que la variable `DATABASE_URL` no está correctamente configurada o el servicio PostgreSQL no está conectado.

## ✅ Solución Paso a Paso

### Paso 1: Verificar que PostgreSQL esté Conectado

1. **Ve a Railway Dashboard**
   - Abre: https://railway.app
   - Selecciona tu proyecto

2. **Verifica el Servicio PostgreSQL**
   - Deberías ver un servicio de tipo "PostgreSQL" o "Database"
   - Si NO existe, créalo:
     - Haz clic en "+ New"
     - Selecciona "Database" → "Add PostgreSQL"

### Paso 2: Conectar PostgreSQL al Backend

1. **Ve al servicio Backend**
   - Haz clic en el servicio Backend

2. **Conecta la Base de Datos**
   - Ve a la pestaña **Variables**
   - Haz clic en **"Add Reference"** o **"Connect Database"**
   - Selecciona el servicio PostgreSQL
   - Esto creará automáticamente la variable `DATABASE_URL`

### Paso 3: Verificar DATABASE_URL

1. **En Railway → Backend → Variables**
   - Verifica que `DATABASE_URL` exista
   - Debería tener un formato como:
     ```
     postgresql://postgres:password@containers-us-xxx.railway.app:5432/railway
     ```
     O la URL interna:
     ```
     postgresql://postgres:password@postgres.railway.internal:5432/railway
     ```

### Paso 4: Obtener la URL Pública (Si es Necesario)

Si la URL interna no funciona, usa la URL pública:

1. **Ve al servicio PostgreSQL**
2. **Ve a Variables**
3. **Busca `DATABASE_URL` o `POSTGRES_URL`**
4. **Copia la URL completa** (debe ser la URL pública, no la interna)

### Paso 5: Ejecutar el Comando

**Opción A: Desde Railway Dashboard Terminal (Recomendada)**

1. Railway → Backend → Deployments → Último deployment → **Terminal**
2. Ejecuta:
   ```bash
   npx prisma db push
   ```

**Opción B: Usar URL Pública Temporalmente**

Si necesitas ejecutar desde tu terminal local:

```bash
# Obtén la URL pública de Railway → PostgreSQL → Variables
export DATABASE_URL="postgresql://postgres:password@containers-us-xxx.railway.app:5432/railway"

cd backend
npx prisma db push
```

⚠️ **Nota:** No uses esta URL en producción, solo para este comando. Después, elimina la variable de entorno local.

## 🔍 Verificación Rápida

### Verificar que DATABASE_URL esté Configurada

```bash
# Desde Railway Terminal
echo $DATABASE_URL
```

Deberías ver la URL de la base de datos.

### Verificar Conexión

```bash
# Desde Railway Terminal
npx prisma db pull
```

Si funciona, la conexión está bien.

## 🆘 Si Sigue Fallando

### Opción 1: Crear Nueva Base de Datos

1. Railway → "+ New" → "Database" → "Add PostgreSQL"
2. Conecta al servicio Backend (Add Reference)
3. Intenta nuevamente

### Opción 2: Verificar que el Servicio PostgreSQL esté Activo

1. Railway → Servicio PostgreSQL
2. Verifica que esté "Active" o "Running"
3. Si está detenido, inícialo

### Opción 3: Usar Migraciones en Lugar de db push

Si `db push` no funciona, intenta crear migraciones:

```bash
# Desde Railway Terminal
npx prisma migrate dev --name init
npx prisma migrate deploy
```

## 📋 Checklist

- [ ] Servicio PostgreSQL existe en Railway
- [ ] PostgreSQL está conectado al servicio Backend (Add Reference)
- [ ] Variable `DATABASE_URL` existe en Backend → Variables
- [ ] El servicio PostgreSQL está activo
- [ ] Ejecutaste el comando desde Railway Terminal (no local)

## ✅ Después de Solucionar

Una vez que `prisma db push` funcione:

1. Verás: "The database is now in sync with your schema"
2. Las tablas se habrán creado
3. El login debería funcionar

