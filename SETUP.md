# Guía de Configuración - Habanaluna Ecommerce

Esta guía te ayudará a configurar y ejecutar el proyecto completo.

## Prerrequisitos

- Node.js >= 18
- Docker y Docker Compose
- PostgreSQL (opcional, se puede usar Docker)

## Instalación Paso a Paso

### 1. Instalar Dependencias

```bash
# Instalar dependencias del workspace
npm install

# O instalar en cada proyecto por separado
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configurar Variables de Entorno

#### Backend

Copia el archivo de ejemplo y configura las variables:

```bash
cd backend
cp .env.example .env
```

Edita `.env` con tus valores:

```env
DATABASE_URL="postgresql://habanaluna:habanaluna123@localhost:5432/habanaluna_db?schema=public"
JWT_SECRET=tu-secret-jwt-super-seguro
JWT_REFRESH_SECRET=tu-secret-refresh-super-seguro
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

#### Frontend

```bash
cd frontend
cp .env.example .env.local
```

Edita `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 3. Configurar Base de Datos

#### Opción A: Usando Docker (Recomendado)

```bash
# Iniciar solo la base de datos
docker-compose up -d postgres

# Esperar a que PostgreSQL esté listo (unos segundos)
```

#### Opción B: PostgreSQL Local

Asegúrate de tener PostgreSQL instalado y crea la base de datos:

```sql
CREATE DATABASE habanaluna_db;
CREATE USER habanaluna WITH PASSWORD 'habanaluna123';
GRANT ALL PRIVILEGES ON DATABASE habanaluna_db TO habanaluna;
```

### 4. Configurar Prisma

```bash
cd backend

# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Poblar base de datos con datos iniciales
npm run prisma:seed
```

### 5. Iniciar el Proyecto

#### Opción A: Desarrollo con Docker Compose (Todo junto)

```bash
# Desde la raíz del proyecto
npm run docker:up
```

Esto iniciará:
- PostgreSQL en el puerto 5432
- Backend en http://localhost:4000
- Frontend en http://localhost:3000

#### Opción B: Desarrollo Local (Recomendado para desarrollo)

Terminal 1 - Backend:
```bash
cd backend
npm run start:dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### 6. Acceder a la Aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api
- **Swagger Docs**: http://localhost:4000/api/docs
- **Prisma Studio**: `cd backend && npm run prisma:studio`

## Credenciales de Prueba

Después de ejecutar el seed, puedes usar:

**Admin:**
- Email: `admin@habanaluna.com`
- Password: `admin123`

**Usuario:**
- Email: `user@habanaluna.com`
- Password: `user123`

## Comandos Útiles

### Backend

```bash
cd backend

# Desarrollo
npm run start:dev

# Build
npm run build

# Producción
npm run start:prod

# Prisma
npm run prisma:generate    # Generar cliente
npm run prisma:migrate     # Ejecutar migraciones
npm run prisma:seed        # Poblar datos
npm run prisma:studio      # Abrir Prisma Studio

# Tests
npm run test
npm run test:e2e
```

### Frontend

```bash
cd frontend

# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm run start

# Lint
npm run lint
```

### Docker

```bash
# Iniciar todos los servicios
npm run docker:up

# Detener servicios
npm run docker:down

# Reconstruir imágenes
npm run docker:build
```

## Estructura del Proyecto

```
habanaluna/
├── backend/              # API NestJS
│   ├── src/
│   │   ├── auth/        # Autenticación
│   │   ├── users/       # Usuarios
│   │   ├── products/    # Productos
│   │   ├── categories/  # Categorías
│   │   ├── cart/        # Carrito
│   │   ├── orders/      # Pedidos
│   │   ├── stats/       # Estadísticas
│   │   └── banners/     # Banners
│   └── prisma/          # Schema y seeds
├── frontend/            # Next.js App
│   ├── app/             # App Router
│   ├── components/      # Componentes React
│   └── lib/             # Utilidades
└── docker-compose.yml   # Configuración Docker
```

## Solución de Problemas

### Error de conexión a la base de datos

1. Verifica que PostgreSQL esté corriendo
2. Verifica las credenciales en `.env`
3. Verifica que la base de datos exista

### Error de migraciones

```bash
# Resetear base de datos (¡CUIDADO! Borra todos los datos)
cd backend
npx prisma migrate reset

# O crear una nueva migración
npx prisma migrate dev --name nombre_migracion
```

### Error de CORS

Verifica que `FRONTEND_URL` en el backend coincida con la URL del frontend.

### Puerto ya en uso

Cambia los puertos en:
- Backend: `.env` → `PORT`
- Frontend: `package.json` → script `dev` o `next.config.js`
- Docker: `docker-compose.yml`

## Próximos Pasos

1. Configurar integración real de Stripe
2. Añadir tests E2E
3. Configurar CI/CD
4. Optimizar imágenes
5. Añadir más funcionalidades según necesidades

## Soporte

Para más información, consulta los README individuales:
- `backend/README.md`
- `frontend/README.md`

