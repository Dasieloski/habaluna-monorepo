#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const standalonePath = path.join(process.cwd(), '.next/standalone/server.js');
const standaloneExists = fs.existsSync(standalonePath);

if (standaloneExists) {
  console.log('✓ Usando servidor standalone');
  require(standalonePath);
} else {
  console.log('⚠ Servidor standalone no encontrado, usando next start');
  console.log('⚠ NOTA: Esto puede causar problemas con rutas dinámicas en producción');
  console.log('⚠ Asegúrate de que el build se ejecute correctamente antes del start');
  try {
    execSync('npx next start', { stdio: 'inherit' });
  } catch (error) {
    console.error('Error ejecutando next start:', error.message);
    process.exit(1);
  }
}
