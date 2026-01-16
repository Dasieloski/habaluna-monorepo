#!/bin/sh
set -e

if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ DATABASE_URL no está configurada. Configúrala en Railway (Variables) o añade un plugin de PostgreSQL."
  exit 1
fi

# Si no se define DIRECT_URL, usar DATABASE_URL como fallback (evita fallo de Prisma por env faltante).
export DIRECT_URL="${DIRECT_URL:-$DATABASE_URL}"

# Verificar si Prisma Client ya está generado (en Dockerfile ya se ejecutó)
if [ ! -d "node_modules/.prisma/client" ]; then
  echo "🔧 Generando Prisma Client..."
  npx prisma generate
else
  echo "✅ Prisma Client ya está generado, omitiendo..."
fi

echo "🔄 Sincronizando schema de Prisma con la base de datos..."
# En producción preferimos migraciones; si no hay migraciones, usamos db push.
# Usar timeout si está disponible, sino ejecutar directamente
if command -v timeout >/dev/null 2>&1; then
  timeout 60 npx prisma migrate deploy || timeout 60 npx prisma db push || echo "⚠️  Advertencia: Error al sincronizar base de datos (puede ser normal si ya está sincronizada)"
else
  npx prisma migrate deploy || npx prisma db push || echo "⚠️  Advertencia: Error al sincronizar base de datos (puede ser normal si ya está sincronizada)"
fi

if [ "${RUN_SEED:-}" = "true" ] || [ "${RUN_SEED:-}" = "1" ]; then
  echo "🌱 Ejecutando seed (RUN_SEED=${RUN_SEED})..."
  if command -v timeout >/dev/null 2>&1; then
    timeout 120 npx prisma db seed || echo "⚠️  Seed falló (continuando)."
  else
    npx prisma db seed || echo "⚠️  Seed falló (continuando)."
  fi
else
  echo "ℹ️  Seed omitido (set RUN_SEED=true para ejecutar)."
fi

echo "🚀 Iniciando servidor..."
exec npm run start:prod

