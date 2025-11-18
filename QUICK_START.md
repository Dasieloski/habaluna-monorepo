# 🚀 Inicio Rápido - Habanaluna

## ⚡ Inicio Rápido con Docker

### 1. Iniciar Docker Desktop

**IMPORTANTE:** Asegúrate de que Docker Desktop esté corriendo antes de continuar.

- **macOS:** Abre Docker Desktop desde Aplicaciones
- **Windows:** Abre Docker Desktop desde el menú de inicio
- **Linux:** `sudo systemctl start docker`

### 2. Iniciar Base de Datos

```bash
# Iniciar PostgreSQL
docker-compose up -d postgres

# Esperar a que esté listo (unos 5-10 segundos)
sleep 5
```

### 3. Configurar Base de Datos

```bash
# Ejecutar script de configuración
./scripts/setup-database.sh
```

### 4. Configurar Prisma

```bash
cd backend
npm run prisma:migrate
npm run prisma:seed
```

### 5. Iniciar Proyecto

```bash
# Desde la raíz del proyecto
npm run dev
```

## 🔄 Si Docker no está disponible

### Usar PostgreSQL Local

1. **Instalar PostgreSQL** (si no lo tienes):
   - macOS: `brew install postgresql@15`
   - Ubuntu: `sudo apt-get install postgresql postgresql-contrib`
   - Windows: Descargar desde [postgresql.org](https://www.postgresql.org/download/)

2. **Crear base de datos manualmente**:

```bash
# Conectar a PostgreSQL
psql -U postgres

# Ejecutar estos comandos:
CREATE USER habanaluna WITH PASSWORD 'habanaluna123';
CREATE DATABASE habanaluna_db;
GRANT ALL PRIVILEGES ON DATABASE habanaluna_db TO habanaluna;
ALTER DATABASE habanaluna_db OWNER TO habanaluna;
\c habanaluna_db
GRANT ALL ON SCHEMA public TO habanaluna;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO habanaluna;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO habanaluna;
\q
```

3. **Verificar conexión en `backend/.env`**:

```env
DATABASE_URL="postgresql://habanaluna:habanaluna123@localhost:5432/habanaluna_db?schema=public"
```

4. **Ejecutar migraciones**:

```bash
cd backend
npm run prisma:migrate
npm run prisma:seed
```

5. **Iniciar proyecto**:

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## ✅ Verificación

Una vez iniciado, deberías poder acceder a:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000/api
- **Swagger Docs:** http://localhost:4000/api/docs

## 🔑 Credenciales de Prueba

Después de ejecutar el seed:

- **Admin:** `admin@habanaluna.com` / `admin123`
- **Usuario:** `user@habanaluna.com` / `user123`

## 🆘 Problemas Comunes

### Docker no inicia
- Verifica que Docker Desktop esté instalado y corriendo
- Reinicia Docker Desktop
- En macOS, verifica los permisos en Preferencias del Sistema

### Error de conexión a la base de datos
- Verifica que PostgreSQL esté corriendo: `docker ps` o `psql -U postgres`
- Verifica las credenciales en `backend/.env`
- Ejecuta el script de configuración: `./scripts/setup-database.sh`

### Error de permisos
- Ejecuta: `./scripts/setup-database.sh`
- O manualmente otorga permisos (ver `DATABASE_SETUP.md`)

