#!/bin/bash

# Script interactivo para configurar Railway
# Este script te guiará a través del proceso de despliegue

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo -e "${BLUE}🚀 Configuración de Railway para Habanaluna${NC}\n"

# Verificar Railway CLI
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI no está instalado${NC}"
    echo -e "${YELLOW}Instálalo con: npm i -g @railway/cli${NC}"
    exit 1
fi

# Verificar autenticación
echo -e "${BLUE}📋 Verificando autenticación...${NC}"
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  No estás autenticado en Railway${NC}"
    echo -e "${YELLOW}Ejecutando: railway login${NC}"
    echo -e "${YELLOW}Esto abrirá tu navegador...${NC}\n"
    railway login
else
    echo -e "${GREEN}✅ Autenticado en Railway${NC}\n"
fi

# Verificar si hay un proyecto vinculado
echo -e "${BLUE}📦 Verificando proyecto...${NC}"
if [ ! -f "$PROJECT_DIR/.railway/project.toml" ]; then
    echo -e "${YELLOW}⚠️  No hay proyecto vinculado${NC}"
    echo -e "${YELLOW}Vinculando proyecto...${NC}"
    railway link
else
    echo -e "${GREEN}✅ Proyecto vinculado${NC}\n"
fi

# Configurar Backend
echo -e "\n${BLUE}🔧 Configurando Backend...${NC}"
cd "$BACKEND_DIR"

if [ ! -f ".railway/service.toml" ]; then
    echo -e "${YELLOW}Vinculando servicio backend...${NC}"
    echo -e "${YELLOW}Selecciona 'New Service' o el servicio backend existente${NC}"
    railway link
else
    echo -e "${GREEN}✅ Backend ya está vinculado${NC}"
fi

echo -e "\n${YELLOW}📝 IMPORTANTE: Configura estas variables en Railway Dashboard:${NC}"
echo -e "${YELLOW}   - DATABASE_URL (usa la referencia del servicio PostgreSQL)${NC}"
echo -e "${YELLOW}   - JWT_SECRET (genera uno seguro)${NC}"
echo -e "${YELLOW}   - JWT_REFRESH_SECRET (genera uno seguro)${NC}"
echo -e "${YELLOW}   - JWT_EXPIRATION=15m${NC}"
echo -e "${YELLOW}   - JWT_REFRESH_EXPIRATION=7d${NC}"
echo -e "${YELLOW}   - NODE_ENV=production${NC}"
echo -e "${YELLOW}   - FRONTEND_URL=https://habanluna.com${NC}"

read -p "Presiona Enter cuando hayas configurado las variables..."

# Configurar Frontend
echo -e "\n${BLUE}🔧 Configurando Frontend...${NC}"
cd "$FRONTEND_DIR"

if [ ! -f ".railway/service.toml" ]; then
    echo -e "${YELLOW}Vinculando servicio frontend...${NC}"
    echo -e "${YELLOW}Selecciona 'New Service' o el servicio frontend existente${NC}"
    railway link
else
    echo -e "${GREEN}✅ Frontend ya está vinculado${NC}"
fi

echo -e "\n${YELLOW}📝 IMPORTANTE: Configura esta variable en Railway Dashboard:${NC}"
echo -e "${YELLOW}   - NEXT_PUBLIC_API_URL=https://tu-backend-url.railway.app/api${NC}"
echo -e "${YELLOW}   (Actualiza esto después de obtener la URL del backend)${NC}"

read -p "Presiona Enter cuando hayas configurado la variable..."

# Resumen
echo -e "\n${GREEN}✅ Configuración completada!${NC}\n"
echo -e "${BLUE}📋 Próximos pasos:${NC}"
echo -e "1. Crea un servicio PostgreSQL desde el dashboard de Railway"
echo -e "2. Configura todas las variables de entorno"
echo -e "3. Despliega los servicios:"
echo -e "   ${YELLOW}cd backend && railway up${NC}"
echo -e "   ${YELLOW}cd frontend && railway up${NC}"
echo -e "4. Configura los dominios personalizados (ver QUICK_DEPLOY.md)"
echo -e "5. Actualiza las variables de entorno con las URLs finales"
echo -e "\n${BLUE}📚 Para más detalles, consulta: QUICK_DEPLOY.md${NC}"

