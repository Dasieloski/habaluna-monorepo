#!/bin/bash

# Script para configurar la base de datos PostgreSQL
# Uso: ./scripts/setup-database.sh

set -e

echo "🗄️  Configurando base de datos PostgreSQL..."

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar si Docker está corriendo
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker no está corriendo. Por favor, inicia Docker primero.${NC}"
    exit 1
fi

# Verificar si el contenedor de PostgreSQL está corriendo
if ! docker ps | grep -q habanaluna-db; then
    echo -e "${YELLOW}⚠️  Contenedor de PostgreSQL no está corriendo. Iniciando...${NC}"
    docker-compose up -d postgres
    echo "⏳ Esperando a que PostgreSQL esté listo..."
    sleep 5
fi

# Configurar base de datos
echo "📝 Configurando base de datos y usuario..."

docker exec -i habanaluna-db psql -U postgres << EOF
-- Crear usuario si no existe
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'habanaluna') THEN
    CREATE USER habanaluna WITH PASSWORD 'habanaluna123';
    RAISE NOTICE 'Usuario habanaluna creado';
  ELSE
    RAISE NOTICE 'Usuario habanaluna ya existe';
  END IF;
END
\$\$;

-- Crear base de datos si no existe
SELECT 'CREATE DATABASE habanaluna_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'habanaluna_db')\gexec

-- Otorgar privilegios
GRANT ALL PRIVILEGES ON DATABASE habanaluna_db TO habanaluna;
ALTER DATABASE habanaluna_db OWNER TO habanaluna;

-- Conectar a la base de datos y otorgar permisos en el schema public
\c habanaluna_db
GRANT ALL ON SCHEMA public TO habanaluna;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO habanaluna;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO habanaluna;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO habanaluna;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO habanaluna;

\q
EOF

echo -e "${GREEN}✅ Base de datos configurada correctamente${NC}"
echo ""
echo "📋 Próximos pasos:"
echo "1. Ejecuta las migraciones: cd backend && npm run prisma:migrate"
echo "2. Pobla la base de datos: cd backend && npm run prisma:seed"

