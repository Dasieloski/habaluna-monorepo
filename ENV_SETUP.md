# Configuración de Variables de Entorno

Esta guía te ayudará a configurar las variables de entorno necesarias para el proyecto.

## 📋 Archivos de Variables de Entorno

### Backend (`backend/.env`)

El archivo `backend/.env` ya está creado con valores por defecto. **IMPORTANTE**: Debes cambiar los secretos JWT antes de usar en producción.

#### Variables Requeridas:

```env
# Database
DATABASE_URL="postgresql://habanaluna:habanaluna123@localhost:5432/habanaluna_db?schema=public"

# JWT Authentication (¡CAMBIA ESTOS VALORES EN PRODUCCIÓN!)
JWT_SECRET=tu-secreto-jwt-super-seguro
JWT_REFRESH_SECRET=tu-secreto-refresh-super-seguro
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# App Configuration
PORT=4000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000

# Stripe (opcional, para pagos)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Upload Configuration
UPLOAD_DEST=./uploads
MAX_FILE_SIZE=5242880
```

#### Generar Secretos JWT Seguros:

Para generar secretos seguros, puedes usar:

```bash
# En Linux/Mac
openssl rand -hex 32

# O usar Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend (`frontend/.env.local`)

El archivo `frontend/.env.local` ya está creado con valores por defecto.

#### Variables Requeridas:

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## 🔧 Configuración por Entorno

### Desarrollo Local

Los archivos `.env` y `.env.local` ya están configurados para desarrollo local.

### Producción

Para producción, necesitas:

1. **Backend**: Crear un archivo `.env` con valores seguros:
   - Cambiar `JWT_SECRET` y `JWT_REFRESH_SECRET` por valores únicos y seguros
   - Actualizar `DATABASE_URL` con la URL de tu base de datos de producción
   - Cambiar `NODE_ENV=production`
   - Actualizar `FRONTEND_URL` con la URL de tu frontend en producción

2. **Frontend**: Crear un archivo `.env.production`:
   ```env
   NEXT_PUBLIC_API_URL=https://api.tudominio.com/api
   ```

## 🔐 Seguridad

### ⚠️ IMPORTANTE:

- **NUNCA** subas los archivos `.env` o `.env.local` al repositorio
- Estos archivos ya están en `.gitignore`
- Genera secretos únicos para cada entorno (desarrollo, staging, producción)
- Usa variables de entorno del sistema en plataformas de despliegue (Vercel, Render, etc.)

## 📝 Verificación

Para verificar que las variables están configuradas correctamente:

### Backend:
```bash
cd backend
npm run start:dev
# Debería iniciar sin errores en http://localhost:4000
```

### Frontend:
```bash
cd frontend
npm run dev
# Debería iniciar sin errores en http://localhost:3000
```

## 🐳 Docker

Si usas Docker, las variables se pueden pasar a través de:
- `docker-compose.yml` (ya configurado)
- Archivo `.env` en la raíz del proyecto (para docker-compose)

## 📚 Referencias

- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Prisma Environment Variables](https://www.prisma.io/docs/concepts/components/prisma-schema/working-with-prismaclient/using-prismaclient-in-a-serverless-environment)

