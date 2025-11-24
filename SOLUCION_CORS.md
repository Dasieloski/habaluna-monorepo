# Solución de Problemas CORS

## 🔴 Error Actual
```
Access to XMLHttpRequest at 'https://habanaluna-backend-production.up.railway.app/api/auth/login' 
from origin 'https://www.habaluna.com' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ Pasos para Solucionar

### 1. Verificar Variable FRONTEND_URL en Railway

**En Railway Dashboard:**
1. Ve al servicio **Backend**
2. Ve a la pestaña **Variables**
3. Verifica que tengas:
   ```
   FRONTEND_URL=https://www.habaluna.com
   ```
   O si prefieres sin www:
   ```
   FRONTEND_URL=https://habaluna.com
   ```

**⚠️ IMPORTANTE:**
- NO debe terminar con `/`
- Debe ser `https://` (no `http://`)
- Debe ser la URL exacta de tu frontend

### 2. Desplegar los Cambios

Los cambios en `backend/src/main.ts` mejoran la configuración de CORS. Necesitas desplegarlos:

```bash
# Desde la raíz del proyecto
git add backend/src/main.ts
git commit -m "Fix: Mejorar configuración CORS para preflight requests"
git push origin master
```

### 3. Reiniciar el Servicio Backend

**Opción A: Desde Railway Dashboard**
1. Ve al servicio Backend
2. Haz clic en los tres puntos (⋯)
3. Selecciona "Restart"

**Opción B: Esperar Despliegue Automático**
- Si tienes GitHub conectado, Railway desplegará automáticamente después del push
- Espera 1-2 minutos a que termine el despliegue

### 4. Verificar los Logs

**En Railway Dashboard:**
1. Ve al servicio Backend
2. Ve a la pestaña **Deployments**
3. Haz clic en el último deployment
4. Ve a **Logs**

**Busca estos mensajes:**
- ✅ `✅ CORS: Origen permitido (mismo dominio): https://www.habaluna.com`
- ⚠️ Si ves `⚠️ CORS: Origen bloqueado`, revisa la configuración de `FRONTEND_URL`

### 5. Probar la Conexión

1. Abre `https://www.habaluna.com` en el navegador
2. Abre la consola del desarrollador (F12)
3. Intenta hacer login
4. Verifica que no haya errores de CORS

## 🔍 Verificación Rápida

### Verificar que el Backend Está Funcionando:
```bash
# Prueba el endpoint de Swagger
curl https://habanaluna-backend-production.up.railway.app/api/docs

# O prueba un endpoint simple
curl https://habanaluna-backend-production.up.railway.app/api/categories
```

### Verificar CORS desde el Navegador:
1. Abre `https://www.habaluna.com`
2. Abre la consola (F12)
3. Ejecuta:
```javascript
fetch('https://habanaluna-backend-production.up.railway.app/api/categories', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('✅ CORS funciona!', data))
.catch(err => console.error('❌ Error CORS:', err));
```

Si ves `✅ CORS funciona!`, el problema está resuelto.

## 🐛 Troubleshooting Adicional

### Si sigue sin funcionar:

1. **Verifica que el código se haya desplegado:**
   - Ve a Railway → Backend → Deployments
   - Verifica que el último deployment sea exitoso
   - Verifica que la fecha del deployment sea reciente

2. **Verifica los logs del backend:**
   - Busca mensajes que empiecen con `✅ CORS:` o `⚠️ CORS:`
   - Estos te dirán exactamente qué origen está siendo bloqueado

3. **Verifica la variable FRONTEND_URL:**
   - Asegúrate de que no tenga espacios al inicio o final
   - Asegúrate de que sea exactamente `https://www.habaluna.com` (sin `/` al final)
   - Prueba también con `https://habaluna.com` (sin www)

4. **Limpia la caché del navegador:**
   - Presiona `Ctrl+Shift+R` (Windows/Linux) o `Cmd+Shift+R` (Mac)
   - O abre en modo incógnito

5. **Verifica que ambos servicios estén funcionando:**
   - Backend: `https://habanaluna-backend-production.up.railway.app/api/docs`
   - Frontend: `https://www.habaluna.com`

## 📝 Notas

- El código ahora permite automáticamente tanto `www.habaluna.com` como `habaluna.com`
- Los cambios incluyen mejor manejo de peticiones OPTIONS (preflight)
- Se agregaron más headers permitidos para mayor compatibilidad
- Los logs te ayudarán a identificar problemas de CORS

## 🆘 Si Nada Funciona

Comparte:
1. El valor exacto de `FRONTEND_URL` en Railway (puedes ocultar partes sensibles)
2. Los logs del backend (especialmente los que empiezan con `CORS:`)
3. El error exacto que ves en la consola del navegador

