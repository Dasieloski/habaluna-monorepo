#!/usr/bin/env node

/**
 * Script para copiar archivos estáticos al directorio standalone
 * Next.js standalone NO copia automáticamente .next/static y public
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const standaloneDir = path.join(rootDir, '.next', 'standalone');
const staticSource = path.join(rootDir, '.next', 'static');
const staticDest = path.join(standaloneDir, '.next', 'static');
const publicSource = path.join(rootDir, 'public');
const publicDest = path.join(standaloneDir, 'public');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`⚠️  Source does not exist: ${src}`);
    return;
  }

  const stat = fs.statSync(src);
  
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      const srcPath = path.join(src, entry);
      const destPath = path.join(dest, entry);
      copyRecursive(srcPath, destPath);
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('📦 Copying static assets to standalone directory...');

// Copiar .next/static
if (fs.existsSync(staticSource)) {
  console.log(`  Copying ${staticSource} -> ${staticDest}`);
  copyRecursive(staticSource, staticDest);
  console.log('  ✅ .next/static copied');
} else {
  console.warn('  ⚠️  .next/static does not exist');
}

// Copiar public
if (fs.existsSync(publicSource)) {
  console.log(`  Copying ${publicSource} -> ${publicDest}`);
  copyRecursive(publicSource, publicDest);
  console.log('  ✅ public copied');
} else {
  console.warn('  ⚠️  public does not exist');
}

console.log('✅ Static assets copied successfully');
