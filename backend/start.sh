#!/bin/sh
set -e

echo "🔄 Ejecutando migraciones de Prisma..."
npx prisma migrate deploy || echo "⚠️  Advertencia: Error al ejecutar migraciones (puede ser normal si ya están aplicadas)"

echo "🚀 Iniciando servidor..."
exec npm run start:prod

