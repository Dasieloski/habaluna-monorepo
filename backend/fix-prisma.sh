#!/bin/bash

echo "🧹 Limpiando dependencias..."
rm -rf node_modules package-lock.json

echo "📦 Instalando dependencias..."
npm install

echo "🔧 Generando cliente Prisma..."
npx prisma generate

echo "✅ Listo!"