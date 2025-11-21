# Instrucciones para Desplegar el Frontend

## ⚠️ Problema Actual

Railway CLI está intentando subir archivos demasiado grandes (4GB). Esto se debe a que está incluyendo `node_modules` y otros archivos de construcción.

## ✅ Solución: Desplegar desde GitHub

La mejor forma de desplegar el frontend es conectando el repositorio de GitHub directamente desde el dashboard de Railway.

### Pasos:

1. **Asegúrate de que tu código esté en GitHub**
   ```bash
   git add .
   git commit -m "Preparar para despliegue en Railway"
   git push origin master
   ```

2. **Ve al Dashboard de Railway**
   - Abre: https://railway.app
   - Inicia sesión con tu cuenta

3. **Conecta el Repositorio**
   - Selecciona el proyecto "SUPERNOVA"
   - Ve al servicio "Frontend"
   - Haz clic en "Settings" → "Source"
   - Haz clic en "Connect GitHub Repo"
   - Selecciona tu repositorio
   - Selecciona la rama (master/main)
   - Configura el "Root Directory" como: `frontend`

4. **Configura las Variables de Entorno**
   - Ve a "Variables" en el servicio Frontend
   - Asegúrate de tener:
     ```
     NEXT_PUBLIC_API_URL=https://tu-backend-url.railway.app/api
     ```
   - Actualiza con la URL real del backend después de que esté desplegado

5. **Railway Desplegará Automáticamente**
   - Railway detectará cambios en GitHub
   - Construirá usando el Dockerfile
   - Desplegará automáticamente

## 🔄 Alternativa: Usar Railway CLI con Contexto Limitado

Si prefieres usar CLI, puedes intentar desde el directorio raíz del proyecto:

```bash
cd /Users/igna/Downloads/PROYECTOS\ CRTA.\ FUNCARRAL\ 44/HABANALUNA
railway link  # Si no está vinculado
railway up --service frontend --detach
```

Pero esto puede tener el mismo problema de tamaño.

## 📋 Verificar Despliegue

Después de conectar GitHub:

```bash
cd frontend
railway logs --tail 50
```

O desde el dashboard, ve a "Deployments" para ver el progreso.

## 🎯 Ventajas de Desplegar desde GitHub

- ✅ Railway construye desde el código fuente (no sube archivos grandes)
- ✅ Despliegue automático en cada push
- ✅ Mejor gestión de versiones
- ✅ Logs más claros
- ✅ Rollback fácil

