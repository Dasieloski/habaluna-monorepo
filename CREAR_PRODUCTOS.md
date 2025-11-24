# 🛍️ Crear Productos desde Imágenes

Este script crea automáticamente productos desde las imágenes en la carpeta `IMAGENES COMIDA`.

## 📋 Requisitos

1. El backend debe estar ejecutándose
2. Debe existir el usuario admin: `admin@habanaluna.com` / `admin123`
3. Las categorías deben estar creadas (se crean automáticamente con el seed)

## 🚀 Cómo Ejecutar

### Opción 1: Desde Local (Recomendado para Desarrollo)

1. **Asegúrate de que el backend esté corriendo:**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **En otra terminal, ejecuta el script:**
   ```bash
   cd backend
   npm run create:products
   ```

   O directamente:
   ```bash
   cd backend
   ts-node scripts/create-products-from-images.ts
   ```

### Opción 2: Desde Railway (Producción)

Si quieres ejecutarlo en producción:

1. **Obtén la URL del backend de Railway**
   - Ve a Railway → Backend → Settings → Networking
   - Copia la URL (ej: `https://habanaluna-backend-production.up.railway.app`)

2. **Ejecuta el script con la URL de producción:**
   ```bash
   cd backend
   API_URL=https://habanaluna-backend-production.up.railway.app/api npm run create:products
   ```

## 📦 Productos que se Crearán

El script creará productos basándose en las imágenes:

### Aceites (Categoría: Aceites y Vinagres)
- Aceite de Oliva Virgen Extra (aceite vibe.png)
- Aceite de Oliva Premium (ada aceite.png)
- Pack de Aceites Variados (oilgroup.png)

### Pastas (Categoría: Pastas y Arroces)
- Spaghetti Premium (spaghetti.png)
- Spaghetti Artesanal (spaguettiada.png)
- Penne Premium (penne.png)
- Penne Artesanal (penneada.png)
- Coditos Premium (elbow (1).png)
- Coditos Artesanal (elbowada.png)
- Coditos Vibe (elbowsvibe.png)
- Pasta con Tomate (pasta tomate.png)
- Harina Premium (harina.png)
- Pack de Harinas (harinagroup.png)

### Conservas (Categoría: Conservas)
- Tomate Natural Premium (tomato.png)
- Producto Premium Hupman (hupman.png)
- Producto Especial (cemento.jpg)
- Producto Premium (po.webp)

### Bebidas (Categoría: Dulces y Postres)
- Vodka Premium (vozca.png)
- Whisky Premium (whisky.png)

## ⚙️ Configuración

Puedes modificar el script `backend/scripts/create-products-from-images.ts` para:
- Cambiar nombres de productos
- Cambiar descripciones
- Cambiar categorías
- Agregar más productos

## ✅ Verificación

Después de ejecutar el script:

1. **Verifica en el admin:**
   - Ve a `https://www.habaluna.com/admin/products`
   - Deberías ver todos los productos creados

2. **Verifica en el frontend:**
   - Ve a `https://www.habaluna.com/products`
   - Deberías ver los productos con sus imágenes

## 🆘 Solución de Problemas

### Error: "Directorio de imágenes no encontrado"
- Verifica que la carpeta `IMAGENES COMIDA` esté en la raíz del proyecto
- El script busca: `../IMAGENES COMIDA` desde `backend/scripts/`

### Error: "Categoría no encontrada"
- Ejecuta el seed primero: `npm run prisma:seed`
- O verifica que las categorías existan en la base de datos

### Error: "Error al hacer login"
- Verifica que el usuario admin exista
- Verifica que el backend esté corriendo
- Verifica la URL del API en el script

### Error: "Error al subir imagen"
- Verifica que el endpoint `/upload/single` esté funcionando
- Verifica que tengas permisos de admin
- Verifica el tamaño de las imágenes (máx 5MB)

## 📝 Notas

- Los productos se crean sin precios (stock: 0)
- Los productos están activos por defecto
- Si un producto ya existe (mismo slug), se omite
- Las imágenes se suben al servidor antes de crear el producto

