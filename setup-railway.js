#!/usr/bin/env node

/**
 * Script para configurar Railway usando la API
 * Este script ayuda a configurar los servicios en Railway
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN || '25940f07-4b6a-4b75-9843-6bc3777bb374';
const PROJECT_ID = process.env.RAILWAY_PROJECT_ID;

// Colores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function getProjects() {
  log('📦 Obteniendo proyectos de Railway...', 'blue');
  const options = {
    hostname: 'backboard.railway.app',
    path: '/graphql/v2',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RAILWAY_TOKEN}`,
    },
  };

  const query = {
    query: `
      query {
        projects {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `,
  };

  try {
    const response = await makeRequest(options, query);
    return response.data?.projects?.edges || [];
  } catch (error) {
    log(`❌ Error al obtener proyectos: ${error.message}`, 'red');
    log('💡 Asegúrate de que el token sea válido y tengas permisos', 'yellow');
    return [];
  }
}

async function main() {
  log('🚀 Configuración de Railway para Habanaluna\n', 'blue');

  if (!RAILWAY_TOKEN) {
    log('❌ No se encontró RAILWAY_TOKEN', 'red');
    log('💡 Establece la variable de entorno: export RAILWAY_TOKEN=tu-token', 'yellow');
    process.exit(1);
  }

  log(`🔑 Usando token: ${RAILWAY_TOKEN.substring(0, 20)}...`, 'blue');

  const projects = await getProjects();
  
  if (projects.length === 0) {
    log('\n❌ No se encontraron proyectos o el token no es válido', 'red');
    log('\n📝 Instrucciones manuales:', 'yellow');
    log('1. Ve a https://railway.app y crea un proyecto', 'yellow');
    log('2. Conecta tu repositorio de GitHub', 'yellow');
    log('3. Sigue las instrucciones en RAILWAY_DEPLOY.md', 'yellow');
    process.exit(1);
  }

  log(`\n✅ Encontrados ${projects.length} proyecto(s):`, 'green');
  projects.forEach((edge, index) => {
    log(`   ${index + 1}. ${edge.node.name} (${edge.node.id})`, 'blue');
  });

  log('\n📝 Próximos pasos:', 'yellow');
  log('1. Ejecuta: railway login (si no estás autenticado)', 'yellow');
  log('2. Navega a cada carpeta y vincula los servicios:', 'yellow');
  log('   cd backend && railway link', 'yellow');
  log('   cd frontend && railway link', 'yellow');
  log('3. Crea un servicio PostgreSQL desde el dashboard', 'yellow');
  log('4. Configura las variables de entorno (ver RAILWAY_DEPLOY.md)', 'yellow');
  log('5. Despliega: railway up', 'yellow');
}

main().catch(console.error);

