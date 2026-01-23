#!/bin/bash

# Script para aplicar migraciones de Prisma en Railway
# Uso: ./scripts/apply-migrations.sh

echo "🚀 Aplicando migraciones de Prisma..."

# Ir al directorio del backend
cd backend

# Generar cliente de Prisma
echo "📦 Generando cliente de Prisma..."
npx prisma generate

# Aplicar migraciones
echo "🗄️ Aplicando migraciones..."
npx prisma migrate deploy

echo "✅ Migraciones aplicadas exitosamente!"
echo "🎨 El sistema de temas ahora debería funcionar correctamente."