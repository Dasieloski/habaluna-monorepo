#!/bin/sh
set -e

# Verificar si el build existe
if [ ! -f ".next/standalone/server.js" ]; then
  echo "⚠️  Servidor standalone no encontrado. Ejecutando build..."
  npm run build
  
  # Verificar nuevamente después del build
  if [ ! -f ".next/standalone/server.js" ]; then
    echo "❌ Error: El build no generó el servidor standalone"
    echo "❌ Verifica que next.config.js tenga 'output: standalone'"
    exit 1
  fi
  echo "✅ Build completado exitosamente"
fi

echo "✅ Iniciando servidor standalone..."
node .next/standalone/server.js
