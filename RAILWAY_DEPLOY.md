# Guía de Despliegue en Railway

Esta guía te ayudará a desplegar Habanaluna en Railway.

## Prerrequisitos

1. Cuenta de Railway creada
2. Proyecto vinculado con GitHub
3. Railway CLI instalado

## Paso 1: Autenticarse en Railway

```bash
railway login
```

## Paso 2: Vincular el Proyecto

Si ya tienes un proyecto creado en Railway:

```bash
railway link
```

O crea un nuevo proyecto:

```bash
railway init
```

## Paso 3: Crear Base de Datos PostgreSQL

1. En el dashboard de Railway, crea un nuevo servicio
2. Selecciona "Database" → "Add PostgreSQL"
3. Anota la URL de conexión que se genera automáticamente

## Paso 4: Desplegar Backend

1. Navega a la carpeta del backend:
```bash
cd backend
```

2. Vincula el servicio del backend:
```bash
railway link
```

3. Configura las variables de entorno en Railway (Dashboard → Variables):
   - `DATABASE_URL` - URL de la base de datos PostgreSQL (se genera automáticamente si usas el plugin)
   - `JWT_SECRET` - Secreto JWT (genera uno seguro)
   - `JWT_REFRESH_SECRET` - Secreto JWT para refresh tokens
   - `JWT_EXPIRATION` - `15m`
   - `JWT_REFRESH_EXPIRATION` - `7d`
   - `PORT` - `4000` (Railway lo asigna automáticamente, pero puedes especificarlo)
   - `NODE_ENV` - `production`
   - `FRONTEND_URL` - URL de tu frontend (ej: `https://habanluna.com`)

4. Conecta la base de datos al servicio backend:
   - En el dashboard, ve al servicio backend
   - Haz clic en "Variables" → "Add Reference"
   - Selecciona la variable `DATABASE_URL` del servicio PostgreSQL

5. Despliega:
```bash
railway up
```

O desde el dashboard, conecta el repositorio de GitHub y Railway desplegará automáticamente.

## Paso 5: Ejecutar Migraciones de Prisma

Después de desplegar el backend, ejecuta las migraciones:

```bash
railway run npx prisma migrate deploy
```

O desde el dashboard:
- Ve al servicio backend
- Abre la terminal
- Ejecuta: `npx prisma migrate deploy`

## Paso 6: Desplegar Frontend

1. Navega a la carpeta del frontend:
```bash
cd ../frontend
```

2. Vincula el servicio del frontend:
```bash
railway link
```

3. Configura las variables de entorno:
   - `NEXT_PUBLIC_API_URL` - URL de tu backend (ej: `https://api.habanluna.com/api` o la URL que Railway asigne al backend)

4. Despliega:
```bash
railway up
```

## Paso 7: Configurar Dominio Personalizado

### En Railway:

1. Ve al servicio del frontend
2. Haz clic en "Settings" → "Networking"
3. Haz clic en "Generate Domain" para obtener un dominio temporal
4. O haz clic en "Custom Domain" y agrega `habanluna.com` y `www.habanluna.com`

### En GoDaddy:

1. Inicia sesión en tu cuenta de GoDaddy
2. Ve a "DNS Management" para el dominio `habanluna.com`
3. Agrega/modifica los siguientes registros:

   **Para el frontend (habanluna.com):**
   - Tipo: `CNAME`
   - Nombre: `@` (o deja en blanco)
   - Valor: [URL proporcionada por Railway para el frontend]
   - TTL: 3600

   - Tipo: `CNAME`
   - Nombre: `www`
   - Valor: [URL proporcionada por Railway para el frontend]
   - TTL: 3600

   **Para el backend (api.habanluna.com):**
   - Tipo: `CNAME`
   - Nombre: `api`
   - Valor: [URL proporcionada por Railway para el backend]
   - TTL: 3600

**Nota:** Railway proporcionará una URL como `xxx.up.railway.app`. Usa esa URL como valor del CNAME.

## Paso 8: Actualizar Variables de Entorno

Después de configurar los dominios, actualiza:

**Backend:**
- `FRONTEND_URL` → `https://habanluna.com`

**Frontend:**
- `NEXT_PUBLIC_API_URL` → `https://api.habanluna.com/api`

## Verificación

1. Verifica que el backend esté funcionando:
   - Visita: `https://api.habanluna.com/api/docs` (Swagger)
   - O: `https://api.habanluna.com/api/health` (si tienes un endpoint de health)

2. Verifica que el frontend esté funcionando:
   - Visita: `https://habanluna.com`

3. Verifica la conexión a la base de datos:
   - El backend debería poder conectarse y ejecutar queries

## Troubleshooting

- Si hay errores de CORS, verifica que `FRONTEND_URL` en el backend coincida con la URL del frontend
- Si el frontend no puede conectar con el backend, verifica `NEXT_PUBLIC_API_URL`
- Si hay errores de base de datos, verifica que `DATABASE_URL` esté correctamente configurada
- Para ver logs: `railway logs` o desde el dashboard

