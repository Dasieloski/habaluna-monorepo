# Configuración de Base de Datos

Este documento explica cómo configurar la base de datos PostgreSQL para el proyecto.

## 🐳 Opción 1: Usando Docker (Recomendado)

### Paso 1: Iniciar Docker

Asegúrate de que Docker Desktop esté corriendo en tu sistema.

### Paso 2: Iniciar PostgreSQL

```bash
# Iniciar solo el servicio de PostgreSQL
docker-compose up -d postgres

# Esperar unos segundos a que PostgreSQL esté listo
sleep 5
```

### Paso 3: Configurar Base de Datos

```bash
# Ejecutar el script de configuración
./scripts/setup-database.sh
```

O manualmente:

```bash
docker exec -i habanaluna-db psql -U postgres << EOF
-- Crear usuario
CREATE USER habanaluna WITH PASSWORD 'habanaluna123';

-- Crear base de datos
CREATE DATABASE habanaluna_db;

-- Otorgar privilegios
GRANT ALL PRIVILEGES ON DATABASE habanaluna_db TO habanaluna;
ALTER DATABASE habanaluna_db OWNER TO habanaluna;
EOF

# Conectar a la base de datos y otorgar permisos en el schema
docker exec -i habanaluna-db psql -U postgres -d habanaluna_db << EOF
GRANT ALL ON SCHEMA public TO habanaluna;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO habanaluna;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO habanaluna;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO habanaluna;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO habanaluna;
EOF
```

### Paso 4: Ejecutar Migraciones

```bash
cd backend
npm run prisma:migrate
npm run prisma:seed
```

## 💻 Opción 2: PostgreSQL Local

Si tienes PostgreSQL instalado localmente:

### Paso 1: Crear Usuario y Base de Datos

```bash
# Conectar a PostgreSQL como superusuario
psql -U postgres

# O si usas otro usuario:
sudo -u postgres psql
```

Luego ejecuta:

```sql
-- Crear usuario
CREATE USER habanaluna WITH PASSWORD 'habanaluna123';

-- Crear base de datos
CREATE DATABASE habanaluna_db;

-- Otorgar privilegios
GRANT ALL PRIVILEGES ON DATABASE habanaluna_db TO habanaluna;
ALTER DATABASE habanaluna_db OWNER TO habanaluna;

-- Conectar a la base de datos
\c habanaluna_db

-- Otorgar permisos en el schema public
GRANT ALL ON SCHEMA public TO habanaluna;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO habanaluna;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO habanaluna;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO habanaluna;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO habanaluna;

-- Salir
\q
```

### Paso 2: Verificar Conexión

Verifica que el archivo `backend/.env` tenga la URL correcta:

```env
DATABASE_URL="postgresql://habanaluna:habanaluna123@localhost:5432/habanaluna_db?schema=public"
```

### Paso 3: Ejecutar Migraciones

```bash
cd backend
npm run prisma:migrate
npm run prisma:seed
```

## 🔧 Solución de Problemas

### Error: "User was denied access"

Si ves este error, significa que el usuario no tiene permisos. Ejecuta:

```bash
# Con Docker
docker exec -i habanaluna-db psql -U postgres -d habanaluna_db -c "GRANT ALL ON SCHEMA public TO habanaluna;"

# Con PostgreSQL local
psql -U postgres -d habanaluna_db -c "GRANT ALL ON SCHEMA public TO habanaluna;"
```

### Error: "Database does not exist"

Crea la base de datos:

```bash
# Con Docker
docker exec -i habanaluna-db psql -U postgres -c "CREATE DATABASE habanaluna_db;"

# Con PostgreSQL local
createdb -U postgres habanaluna_db
```

### Error: "User does not exist"

Crea el usuario:

```bash
# Con Docker
docker exec -i habanaluna-db psql -U postgres -c "CREATE USER habanaluna WITH PASSWORD 'habanaluna123';"

# Con PostgreSQL local
createuser -U postgres -P habanaluna
# (te pedirá la contraseña: habanaluna123)
```

### Verificar Estado

```bash
# Verificar que PostgreSQL está corriendo (Docker)
docker ps | grep postgres

# Verificar conexión
cd backend
npx prisma db pull
```

## 📝 Notas

- El usuario por defecto es: `habanaluna`
- La contraseña por defecto es: `habanaluna123`
- El nombre de la base de datos es: `habanaluna_db`
- El puerto por defecto es: `5432`

**⚠️ IMPORTANTE:** En producción, cambia estas credenciales por valores seguros.

