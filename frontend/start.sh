#!/bin/sh
set -e

# Verificar que el servidor standalone existe
# El build DEBE ejecutarse antes del start (en Railway: Build Command)
if [ ! -f ".next/standalone/server.js" ]; then
  echo "❌ Error: El servidor standalone no existe"
  echo "❌ El build debe ejecutarse ANTES del start"
  echo "❌ Verifica que Railway ejecute 'npm run build' en el Build Command"
  echo "❌ Verifica que next.config.js tenga 'output: standalone'"
  echo "❌ Verifica que el build se ejecute SIN Turbopack (NEXT_PRIVATE_SKIP_TURBOPACK=1)"
  exit 1
fi

echo "✅ Servidor standalone encontrado. Iniciando..."
node .next/standalone/server.js
