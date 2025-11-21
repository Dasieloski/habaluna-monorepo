# 🚀 Despliegue Rápido en Railway

Guía paso a paso para desplegar Habanaluna en Railway.

## ⚡ Inicio Rápido

### 1. Autenticarse en Railway

```bash
railway login
```

Esto abrirá tu navegador para autenticarte.

### 2. Crear/Seleccionar Proyecto

Si ya tienes un proyecto creado en Railway vinculado con GitHub:

```bash
railway link
```

Si necesitas crear un nuevo proyecto:

1. Ve a https://railway.app
2. Crea un nuevo proyecto
3. Conecta tu repositorio de GitHub
4. Luego ejecuta `railway link` en cada carpeta

### 3. Configurar Base de Datos PostgreSQL

**Opción A: Desde el Dashboard de Railway**
1. Ve a tu proyecto en Railway
2. Haz clic en "New" → "Database" → "Add PostgreSQL"
3. Railway creará automáticamente la variable `DATABASE_URL`

**Opción B: Desde CLI**
```bash
railway add postgresql
```

### 4. Desplegar Backend

```bash
cd backend
railway link  # Si no está vinculado
```

**Configurar Variables de Entorno en Railway:**

Ve al dashboard de Railway → Tu servicio backend → Variables, y agrega:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Referencia automática si usas el plugin
JWT_SECRET=tu-secreto-jwt-super-seguro-genera-uno-nuevo
JWT_REFRESH_SECRET=tu-secreto-refresh-super-seguro-genera-uno-nuevo
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
NODE_ENV=production
FRONTEND_URL=https://habanluna.com
PORT=4000
```

**Generar secretos JWT seguros:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Desplegar:**
```bash
railway up
```

O desde el dashboard, simplemente conecta el repositorio y Railway desplegará automáticamente en cada push.

### 5. Desplegar Frontend

```bash
cd ../frontend
railway link  # Si no está vinculado
```

**Configurar Variables de Entorno:**

```env
NEXT_PUBLIC_API_URL=https://tu-backend-url.railway.app/api
```

**Nota:** Después de obtener la URL del backend, actualiza esta variable.

**Desplegar:**
```bash
railway up
```

### 6. Configurar Dominio Personalizado

#### En Railway:

1. **Frontend:**
   - Ve al servicio del frontend
   - Settings → Networking
   - Custom Domain → Agrega `habanluna.com` y `www.habanluna.com`
   - Railway te dará los valores de CNAME

2. **Backend:**
   - Ve al servicio del backend
   - Settings → Networking
   - Custom Domain → Agrega `api.habanluna.com`
   - Railway te dará el valor de CNAME

#### En GoDaddy:

1. Inicia sesión en GoDaddy
2. Ve a "DNS Management" para `habanluna.com`
3. Agrega/modifica estos registros:

   **Para habanluna.com (Frontend):**
   ```
   Tipo: CNAME
   Nombre: @
   Valor: [CNAME proporcionado por Railway para frontend]
   TTL: 3600
   ```

   **Para www.habanluna.com (Frontend):**
   ```
   Tipo: CNAME
   Nombre: www
   Valor: [CNAME proporcionado por Railway para frontend]
   TTL: 3600
   ```

   **Para api.habanluna.com (Backend):**
   ```
   Tipo: CNAME
   Nombre: api
   Valor: [CNAME proporcionado por Railway para backend]
   TTL: 3600
   ```

### 7. Actualizar Variables de Entorno Finales

Después de configurar los dominios (puede tardar unos minutos en propagarse):

**Backend:**
```env
FRONTEND_URL=https://habanluna.com
```

**Frontend:**
```env
NEXT_PUBLIC_API_URL=https://api.habanluna.com/api
```

### 8. Verificar Despliegue

1. **Backend:**
   - Visita: `https://api.habanluna.com/api/docs` (Swagger)
   - Deberías ver la documentación de la API

2. **Frontend:**
   - Visita: `https://habanluna.com`
   - Deberías ver la aplicación funcionando

3. **Base de Datos:**
   - Las migraciones se ejecutan automáticamente al iniciar el backend
   - Verifica los logs: `railway logs` o desde el dashboard

## 🔧 Comandos Útiles

```bash
# Ver logs
railway logs

# Ver logs en tiempo real
railway logs --follow

# Ejecutar comandos en el servicio
railway run [comando]

# Ejecutar migraciones manualmente (si es necesario)
railway run npx prisma migrate deploy

# Ver variables de entorno
railway variables

# Abrir dashboard
railway open
```

## 🐛 Troubleshooting

### Error de CORS
- Verifica que `FRONTEND_URL` en el backend coincida exactamente con la URL del frontend
- Asegúrate de incluir `https://` y sin barra final

### Frontend no puede conectar con backend
- Verifica que `NEXT_PUBLIC_API_URL` esté correctamente configurada
- Asegúrate de que la URL termine en `/api`
- Verifica que el backend esté funcionando visitando `/api/docs`

### Error de base de datos
- Verifica que `DATABASE_URL` esté correctamente configurada
- Asegúrate de que la base de datos esté activa en Railway
- Revisa los logs del backend para ver errores de conexión

### Dominio no funciona
- Los cambios de DNS pueden tardar hasta 48 horas (normalmente 1-2 horas)
- Verifica que los CNAME estén correctamente configurados en GoDaddy
- Usa herramientas como `dig` o `nslookup` para verificar la propagación DNS

## 📚 Recursos

- [Documentación de Railway](https://docs.railway.app)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Guía completa de despliegue](./RAILWAY_DEPLOY.md)

