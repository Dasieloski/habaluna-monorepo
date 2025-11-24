# 📖 Modo Catálogo - Guía de Configuración

## ¿Qué es el Modo Catálogo?

El modo catálogo permite mostrar los productos sin precios y sin funcionalidad de compra. Es perfecto para ferias, eventos o cuando quieres que los visitantes vean los productos pero no puedan comprar.

## ✅ Características del Modo Catálogo

Cuando está activado:
- ❌ **Precios ocultos**: No se muestran precios en ningún lugar
- ❌ **Sin carrito**: El botón de carrito desaparece del header
- ❌ **Sin compras**: No se puede añadir productos al carrito
- ❌ **Sin checkout**: La página de checkout redirige a productos
- ✅ **Visualización**: Los productos se pueden ver normalmente
- ✅ **Navegación**: Se puede navegar por categorías y productos

## 🔧 Cómo Activar el Modo Catálogo

### Paso 1: Configurar Variable de Entorno en Railway

1. **Ve a Railway Dashboard**
   - Abre: https://railway.app
   - Selecciona tu proyecto
   - Haz clic en el servicio **Frontend**

2. **Agrega la Variable**
   - Ve a la pestaña **Variables**
   - Haz clic en **"Add Variable"**
   - Nombre: `NEXT_PUBLIC_CATALOG_MODE`
   - Valor: `true`
   - Haz clic en **"Add"**

3. **Reinicia el Servicio**
   - Reinicia el servicio Frontend en Railway
   - O espera a que Railway despliegue automáticamente

### Paso 2: Verificar que Funciona

Después de reiniciar:
1. Visita tu sitio web
2. Verifica que:
   - No aparezcan precios en los productos
   - No aparezca el icono de carrito en el header
   - No puedas añadir productos al carrito

## 🔄 Cómo Desactivar el Modo Catálogo

Para volver al modo normal de ecommerce:

1. **Ve a Railway → Frontend → Variables**
2. **Elimina o cambia la variable:**
   - Elimina `NEXT_PUBLIC_CATALOG_MODE`
   - O cambia su valor a `false`
3. **Reinicia el servicio Frontend**

## 📋 Checklist

- [ ] Variable `NEXT_PUBLIC_CATALOG_MODE=true` configurada en Railway
- [ ] Servicio Frontend reiniciado
- [ ] Precios ocultos en la página principal
- [ ] Precios ocultos en la página de productos
- [ ] Precios ocultos en la página de detalle de producto
- [ ] Botón de carrito oculto en el header
- [ ] Botón "Añadir al Carrito" oculto
- [ ] Página de carrito redirige a productos
- [ ] Página de checkout redirige a productos

## 🎯 Uso Recomendado

El modo catálogo es ideal para:
- ✅ Ferias y eventos
- ✅ Mostrar productos antes del lanzamiento
- ✅ Catálogos de productos
- ✅ Presentaciones a clientes
- ✅ Cuando los precios aún no están definidos

## 📝 Notas

- El modo catálogo solo afecta al frontend
- Los administradores pueden seguir accediendo al panel de admin
- Los productos se pueden seguir gestionando desde el admin
- Para volver al modo normal, solo necesitas cambiar/eliminar la variable

