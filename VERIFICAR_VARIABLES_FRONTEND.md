# 🔍 Verificar Variables de Entorno del Frontend

## Problema Actual
El frontend está intentando cargar imágenes desde `http://localhost:4000` en lugar de la URL de producción.

## ✅ Solución: Verificar Variable en Railway

### Paso 1: Verificar Variable en Railway

1. **Ve a Railway Dashboard**
   - Abre: https://railway.app
   - Selecciona tu proyecto
   - Haz clic en el servicio **Frontend**

2. **Ve a Variables**
   - Haz clic en la pestaña **Variables**
   - Busca `NEXT_PUBLIC_API_URL`

3. **Verifica o Agrega la Variable**

   Debe tener este formato:
   ```
   NEXT_PUBLIC_API_URL=https://habanaluna-backend-production.up.railway.app/api
   ```

   ⚠️ **IMPORTANTE:**
   - Debe terminar con `/api`
   - Debe usar `https://` (no `http://`)
   - Debe ser la URL completa del backend

### Paso 2: Obtener la URL del Backend

Si no sabes cuál es la URL del backend:

1. **Ve al servicio Backend en Railway**
2. **Ve a Settings → Networking**
3. **Copia la URL** que Railway asigna (ej: `https://habanaluna-backend-production.up.railway.app`)
4. **Agrega `/api` al final**

### Paso 3: Reiniciar el Servicio Frontend

Después de agregar/actualizar la variable:

1. **Reinicia el servicio Frontend** en Railway
2. O espera a que Railway detecte el cambio y despliegue automáticamente

### Paso 4: Verificar

Después de reiniciar:

1. **Abre la consola del navegador** (F12)
2. **Ejecuta:**
   ```javascript
   console.log(process.env.NEXT_PUBLIC_API_URL)
   ```
   
   Deberías ver la URL del backend, no `undefined`.

3. **Intenta subir una imagen nuevamente**
4. **Verifica que la URL de la imagen sea:**
   ```
   https://habanaluna-backend-production.up.railway.app/uploads/...
   ```
   
   En lugar de:
   ```
   http://localhost:4000/uploads/...
   ```

## 🆘 Si Sigue Sin Funcionar

### Verificar que el Código se Desplegó

1. **Verifica que el último deployment del frontend sea reciente**
2. **Revisa los logs** para ver si hay errores

### Limpiar Cache del Navegador

1. **Presiona `Ctrl+Shift+R`** (Windows/Linux) o **`Cmd+Shift+R`** (Mac)
2. O **abre en modo incógnito**

### Verificar la Variable Manualmente

En la consola del navegador, ejecuta:
```javascript
// Debería mostrar la URL del backend
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
```

Si muestra `undefined`, la variable no está configurada correctamente.

## 📋 Checklist

- [ ] Variable `NEXT_PUBLIC_API_URL` existe en Railway → Frontend → Variables
- [ ] La variable termina con `/api`
- [ ] La variable usa `https://` (no `http://`)
- [ ] El servicio Frontend se ha reiniciado después de agregar la variable
- [ ] El código se ha desplegado recientemente
- [ ] El navegador no tiene cache (modo incógnito o Ctrl+Shift+R)

