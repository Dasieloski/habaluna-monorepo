# 🗄️ Ejecutar Migraciones de Prisma en Railway

## Problema
```
The table `public.users` does not exist in the current database.
```

Esto significa que las migraciones de Prisma no se han ejecutado en la base de datos de producción.

## ✅ Solución: Ejecutar Migraciones

### Opción 1: Desde Railway Dashboard (Recomendado)

1. **Ve a Railway Dashboard**
   - Abre: https://railway.app
   - Selecciona tu proyecto
   - Haz clic en el servicio **Backend**

2. **Abre la Terminal**
   - Ve a la pestaña **Deployments**
   - Haz clic en el último deployment
   - Haz clic en **Terminal** o **View Logs** → **Terminal**

3. **Ejecuta las migraciones**
   ```bash
   npx prisma migrate deploy
   ```

4. **Espera a que termine**
   - Deberías ver mensajes como: "Applied migration: xxxxx"
   - Si hay errores, compártelos

### Opción 2: Desde Railway CLI

```bash
# Desde la raíz del proyecto
cd backend
railway run npx prisma migrate deploy
```

### Opción 3: Verificar y Ejecutar

Primero verifica el estado:
```bash
railway run npx prisma migrate status
```

Luego ejecuta:
```bash
railway run npx prisma migrate deploy
```

## 📋 Pasos Completos

1. **Ejecutar migraciones:**
   ```bash
   railway run npx prisma migrate deploy
   ```

2. **Verificar que se crearon las tablas:**
   ```bash
   railway run npx prisma db pull
   ```

3. **Opcional: Poblar con datos iniciales (seed):**
   ```bash
   railway run npx prisma db seed
   ```
   O si el comando seed no está configurado:
   ```bash
   railway run ts-node prisma/seed.ts
   ```

## ✅ Verificación

Después de ejecutar las migraciones, intenta hacer login nuevamente. Debería funcionar.

Si aún hay errores, verifica:
- Que `DATABASE_URL` esté correctamente configurada
- Que la base de datos esté accesible
- Los logs del backend para ver si hay otros errores

## 🆘 Si hay Errores

Si ves errores al ejecutar las migraciones, comparte:
1. El mensaje de error completo
2. El resultado de: `railway run npx prisma migrate status`

