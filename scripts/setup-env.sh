#!/bin/bash

# Script para configurar variables de entorno
# Uso: ./scripts/setup-env.sh

set -e

echo "🔧 Configurando variables de entorno..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backend .env
if [ ! -f "backend/.env" ]; then
    echo "📝 Creando backend/.env..."
    cp backend/.env.example backend/.env
    
    # Generar secretos JWT seguros
    if command -v node &> /dev/null; then
        JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
        JWT_REFRESH=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
        
        # Actualizar secretos en .env (compatible con macOS y Linux)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" backend/.env
            sed -i '' "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$JWT_REFRESH|" backend/.env
        else
            sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" backend/.env
            sed -i "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$JWT_REFRESH|" backend/.env
        fi
        
        echo -e "${GREEN}✅ Secretos JWT generados automáticamente${NC}"
    else
        echo -e "${YELLOW}⚠️  Node.js no encontrado. Por favor, genera secretos JWT manualmente.${NC}"
    fi
    
    echo -e "${GREEN}✅ backend/.env creado${NC}"
else
    echo -e "${YELLOW}⚠️  backend/.env ya existe${NC}"
fi

# Frontend .env.local
if [ ! -f "frontend/.env.local" ]; then
    echo "📝 Creando frontend/.env.local..."
    cp frontend/.env.example frontend/.env.local
    echo -e "${GREEN}✅ frontend/.env.local creado${NC}"
else
    echo -e "${YELLOW}⚠️  frontend/.env.local ya existe${NC}"
fi

echo ""
echo -e "${GREEN}✨ Configuración completada!${NC}"
echo ""
echo "📋 Próximos pasos:"
echo "1. Revisa backend/.env y ajusta los valores si es necesario"
echo "2. Revisa frontend/.env.local y ajusta NEXT_PUBLIC_API_URL si es necesario"
echo "3. Asegúrate de que PostgreSQL esté corriendo"
echo "4. Ejecuta: npm run prisma:migrate (desde la raíz del proyecto)"
echo "5. Ejecuta: npm run prisma:seed (desde la raíz del proyecto)"
echo "6. Inicia el proyecto: npm run dev"

