#!/bin/sh
set -e

# Verificar si el build existe
if [ ! -f ".next/standalone/server.js" ]; then
  echo "⚠️  Servidor standalone no encontrado. Ejecutando build..."
  echo "⚠️  Deshabilitando Turbopack para generar standalone correctamente..."
  NEXT_PRIVATE_SKIP_TURBOPACK=1 npm run build
  
  # Verificar nuevamente después del build
  if [ ! -f ".next/standalone/server.js" ]; then
    echo "❌ Error: El build no generó el servidor standalone"
    echo "❌ Verifica que next.config.js tenga 'output: standalone'"
    echo "❌ Verifica los logs del build para más detalles"
    exit 1
  fi
  echo "✅ Build completado exitosamente"
fi

echo "✅ Iniciando servidor standalone..."
node .next/standalone/server.js
