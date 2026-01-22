@echo off

echo 🧹 Limpiando dependencias...
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul

echo 📦 Instalando dependencias...
npm install

echo 🔧 Generando cliente Prisma...
npx prisma generate

echo ✅ Listo!
pause