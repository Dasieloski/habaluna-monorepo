# Habanaluna - Ecommerce Premium

Tienda online moderna y profesional de productos de alimentación gourmet.

## 🚀 Stack Tecnológico

### Frontend
- **Next.js 14** (App Router) con React Server Components
- **TailwindCSS** para estilos
- **shadcn/ui** para componentes UI
- **Zustand** para gestión de estado
- **Framer Motion** para animaciones

### Backend
- **NestJS** - Framework Node.js escalable
- **PostgreSQL** - Base de datos relacional
- **Prisma ORM** - ORM moderno y type-safe
- **JWT** - Autenticación con refresh tokens
- **Zod** - Validación de esquemas

### Infraestructura
- **Docker** + **docker-compose** para desarrollo local
- **Stripe** - Integración de pagos (simulada inicialmente)

## 📁 Estructura del Proyecto

```
habanaluna/
├── frontend/          # Next.js 14 App
├── backend/           # NestJS API
├── docker-compose.yml # Configuración Docker
└── package.json       # Workspace root
```

## 🛠️ Instalación

### Prerrequisitos
- Node.js >= 18
- Docker y Docker Compose
- PostgreSQL (o usar Docker)

### Pasos

1. **Clonar e instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

3. **Iniciar base de datos con Docker:**
```bash
npm run docker:up
```

4. **Configurar Prisma:**
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

5. **Iniciar desarrollo:**
```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Prisma Studio: `npm run prisma:studio`

## 📦 Scripts Disponibles

- `npm run dev` - Inicia frontend y backend en modo desarrollo
- `npm run build` - Construye ambos proyectos
- `npm run docker:up` - Inicia servicios Docker
- `npm run docker:down` - Detiene servicios Docker
- `npm run prisma:migrate` - Ejecuta migraciones
- `npm run prisma:seed` - Pobla la base de datos con datos iniciales

## 🏗️ Arquitectura

### Backend (NestJS)
- **Módulos:** Auth, Products, Categories, Orders, Cart, Users, Stats
- **Arquitectura:** Clean Architecture con servicios, controladores y repositorios
- **Validación:** DTOs con class-validator y Zod
- **Autenticación:** JWT con refresh tokens

### Frontend (Next.js)
- **App Router** con Server Components
- **Rutas:**
  - `/` - Landing page
  - `/products` - Catálogo de productos
  - `/products/[id]` - Detalle de producto
  - `/cart` - Carrito de compras
  - `/checkout` - Proceso de pago
  - `/auth/login` - Login
  - `/auth/register` - Registro
  - `/profile` - Perfil de usuario
  - `/admin` - Panel administrador

## 🔐 Autenticación

- JWT tokens con expiración corta (15 min)
- Refresh tokens con expiración larga (7 días)
- Roles: `USER`, `ADMIN`

## 🎨 Diseño

- Diseño premium y minimalista
- Paleta de colores gourmet
- UI responsive y accesible (AA/AAA)
- Animaciones suaves con Framer Motion

## 📝 Próximos Pasos

- [ ] Implementar integración real de Stripe
- [ ] Añadir tests E2E
- [ ] Configurar CI/CD
- [ ] Optimizar imágenes con Next.js Image
- [ ] Implementar búsqueda avanzada con filtros
- [ ] Añadir sistema de reviews

## 📄 Licencia

Privado - Todos los derechos reservados

