# Diagnóstico: imágenes que no cargan correctamente

## 1. Resumen del flujo actual

- **Origen**: Productos/categorías/banners vienen del backend. `product.images` es `string[]` (IDs de Media como `/api/media/{id}`, rutas `/uploads/...` o, tras normalizar, URLs completas).
- **Normalización**:  
  - `api.normalizeImageUrl` (en `mapBackendProductToFrontend`) → URLs completas o `/placeholder.svg`.  
  - `getImageUrl` en `lib/image-utils` → usada en `SmartImage`, `ProductCard`, `CategoryGrid`; devuelve la URL final (completa, o `/api/media/{id}?...` con base, o rutas locales).
- **Render**: `SmartImage` usa `next/image` con `unoptimized` para URLs del backend (`/api/`, `/uploads/`, dominios del backend) y para `placeholder`.

---

## 2. Causas probables (por prioridad)

### A) `NEXT_PUBLIC_API_URL` incorrecta o vacía

- `getApiBaseUrlLazy()` y `getImageUrl()` dependen de ella.
- Si en build o en runtime (SSR/cliente) está vacía o mal configurada, las URLs de `/api/media/` y `/uploads/` se arman con un `base` erróneo → 404 o dominios que no existen.
- En producción se usa el fallback `https://habaluna-backend-production.up.railway.app`; si el backend está en otro dominio, las imágenes fallan.

**Dónde comprobarlo:**  
- Build: en el job de build (Vercel/Railway) la variable debe existir.  
- Runtime: `window.__HABANALUNA_API_CONFIG` en consola (baseUrl, fullApiUrl, envVar).

---

### B) Backend `/api/media/:id` devuelve 404

- El Media pudo haberse borrado o el ID en `Product.images` es inválido.
- `SmartImage` reintenta hasta 2 veces y luego muestra “Imagen no disponible”. La impresión es “no cargan” o “a veces sí”.

**Dónde comprobarlo:**  
- Abrir en una pestaña:  
  `https://<BACKEND>/api/media/<ID_DE_PRODUCT.IMAGES[0]>`  
- Revisar en backend que los IDs en `Product.images` existan en la tabla `Media` (o que las rutas `/uploads/` existan en disco).

---

### C) Demasiadas peticiones de imagen a la vez

- En home/carruseles hay muchas `<img>`/`next/image` en vista a la vez.
- El navegador limita ~6 conexiones por dominio; el resto se encola. Si el backend es lento o hay mucha latencia, las que van al final pueden tardar mucho o “sólo verse al recargar” (por cache o orden distinto).

**Dónde comprobarlo:**  
- DevTools → Network → Img, ver cuántas peticiones concurrentes a `/api/media/` o al dominio del backend, tiempos de espera (queueing) y de respuesta.

---

### D) `getImageUrl` en el cliente y `getApiBaseUrlLazy` en SSR

- `getApiBaseUrlLazy` se resuelve en el primer uso. En SSR, `process.env.NEXT_PUBLIC_API_URL` debe estar disponible en el proceso de build y en el de ejecución (Node en Vercel/Railway).
- Si en SSR ese `process.env` no existe o es distinto al del cliente, las URLs generadas en servidor y en cliente pueden no coincidir o ser incorrectas en uno de los dos.

**Dónde comprobarlo:**  
- Ver que `NEXT_PUBLIC_*` esté en “Build” y “Runtime” (o equivalentes) en el panel del hosting.  
- Asegurar que `getApiBaseUrlLazy` no se llame desde código que se ejecute en un contexto sin env (p. ej. en `middleware` o en módulos que se importan solo en edge).

---

### E) Rutas o formatos de imagen inconsistentes

- `api.normalizeImageUrl` y `getImageUrl` no son la misma función; si una cambia y la otra no, pueden generarse URLs distintas para el mismo dato.
- Algunos productos pueden seguir trayendo rutas de Cloudinary que se convierten a `/placeholder.svg`; no es un 404, pero da la sensación de “imagen que no es la correcta” o “no hay imagen”.
- Rutas como `/placeholder.svg?height=600&width=600&query=...` en `top-sales` son innecesarias; en algunos entornos el `?` en estáticos puede causar rarezas (menos probable, pero simplificar ayuda).

---

### F) Contenedor sin tamaño cuando `fill=true`

- Con `fill`, `next/image` necesita un contenedor con dimensiones (o aspect-ratio). Si el contenedor colapsa (height 0 o sin `aspect-ratio`), la imagen no se ve.
- En los componentes revisados los contenedores suelen tener `aspect-square` o `min-h`, pero en layouts anidados o condicionales podría haber excepciones.

---

### G) CORS (menos probable para `<img>`)

- Para `<img src="https://...">` el navegador hace un GET simple; no lee el cuerpo con JS, así que CORS no suele bloquear la visualización.
- CORS sí afecta si en algún momento se usara `fetch()` para esas imágenes y luego se mostraran en un `Blob`/`Object URL`. Con el flujo actual (`src` directo) es secundario, pero conviene tener CORS bien configurado para el dominio del backend (p. ej. `*.railway.app`, `*.vercel.app`, `localhost`).

---

## 3. Cambios concretos recomendados

### 3.1 Verificar y documentar `NEXT_PUBLIC_API_URL`

- **Dónde:** Variables de entorno del proyecto (Vercel/Railway/otro).  
- **Qué hacer:**
  - En producción:  
    `NEXT_PUBLIC_API_URL=https://habaluna-backend-production.up.railway.app`  
    (sin `/api` al final; `getApiBaseUrlLazy` ya lo quita).
  - Asegurar que esté disponible en el paso de **build** y en **runtime** del frontend.
  - En `.env.example` y en la doc de despliegue, dejar explícito que esta variable es obligatoria para que las imágenes del backend funcionen.

---

### 3.2 `priority` en las primeras imágenes (LCP)

- **Dónde:**  
  - `HeroBanner`: la `SmartImage` del slide activo ya usa `priority`.  
  - `ProductCard` en carruseles/grids: las que están “above the fold” (p. ej. primeras 4–6) deberían llevar `priority`.
- **Cómo:**  
  - Pasar `priority` desde el padre (p. ej. `ProductCarousel`, `TopSales`, grid de productos) cuando `index < 4` o `index < 6`, según el diseño.  
  - En `ProductCard` añadir una prop opcional `priority?: boolean` y usarla en `SmartImage`.

Ejemplo en `ProductCarousel`:

```tsx
<ProductCard
  product={product}
  badge={badge?.text}
  badgeColor={badge?.color}
  priority={index < 4}
/>
```

Y en `ProductCard`:

```tsx
<SmartImage
  src={currentImage}
  alt={product.name}
  fill
  priority={priority}
  // ...resto
/>
```

---

### 3.3 Unificar normalización de URLs: `getImageUrl` como única fuente

- **Problema:** `api.normalizeImageUrl` y `getImageUrl` duplican lógica; si el backend devuelve IDs puros, `/api/media/`, `/uploads/` o Cloudinary, el comportamiento debe ser el mismo en todos los sitios.
- **Dónde:**  
  - `lib/api.ts`: `normalizeImageUrl` y `mapBackendProductToFrontend`.  
  - `lib/image-utils.ts`: `getImageUrl`.
- **Qué hacer:**
  - Hacer que `normalizeImageUrl` use `getImageUrl` (o que `getImageUrl` exporte la lógica y ambos la reutilicen).  
  - O bien que `mapBackendProductToFrontend` no convierta `images` a URLs completas y deje los strings crudos; que `ProductCard`, `SmartImage`, etc. siempre pasen por `getImageUrl`.  
  - Objetivo: una sola función que decida “Cloudinary → null/placeholder”, “ID → /api/media/{id}”, “/uploads/” → URL con base, “https://…” → tal cual, “/placeholder…” → tal cual. Así se evitan incoherencias y 404 por base equivocada.

---

### 3.4 `getImageUrl` y `src` vacío/undefined

- **Dónde:** `lib/image-utils.ts`, `getImageUrl`.
- **Qué hacer:**
  - `if (!image || typeof image !== 'string') return null` al inicio.  
  - Evitar `image.trim()` si `image` puede ser no string (p. ej. si en algún sitio se pasa un elemento de `images` mal tipado).  
  - Quien llame (p. ej. `ProductCard`) debe seguir usando `filter(Boolean)` después de `map(getImageUrl)` y un fallback a `"/placeholder.svg"` cuando el array queda vacío (ya lo haces; mantener).

---

### 3.5 Placeholder único y estable

- **Dónde:** `top-sales.tsx` y cualquier otro que use algo distinto de `/placeholder.svg`.
- **Qué hacer:**
  - Reemplazar  
    `"/placeholder.svg?height=600&width=600&query=featured product"`  
    por  
    `"/placeholder.svg"`.  
  - Tener un único asset `/placeholder.svg` en `public` y usarlo en todos los fallbacks (SmartImage, ProductCard, TopSales, etc.).

---

### 3.6 `sizes` más precisos en `SmartImage` (ProductCard, grids)

- **Dónde:** `ProductCard`, y donde se use `SmartImage` en grids/carruseles.
- **Problema:** `sizes` por defecto `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw` puede pedir imágenes más grandes de lo necesario en tarjetas pequeñas.
- **Qué hacer:**  
  - En `ProductCard` (y similares) usar algo como:  
    `sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"`  
  - Ajustar los breakpoints a los que uses en el layout real. Menos ancho solicitado → menos bytes y menos saturación de la cola de peticiones.

---

### 3.7 Evitar sobrescribir `product.images` con `['/placeholder.svg']` cuando ya hay valores

- **Dónde:** `product-carousel.tsx`:

  ```ts
  images: product.images?.length ? product.images : ['/placeholder.svg'],
  ```

- **Comportamiento actual:** Si `product.images` es `[]` o undefined, se usa `['/placeholder.svg']`. Si tiene elementos, se mantienen. Correcto.  
- **Mejora:** Filtrar elementos vacíos o que `getImageUrl` convierta en `null`, y solo si el resultado es `[]` usar `['/placeholder.svg']`:

  ```ts
  images: (product.images || []).filter(Boolean).length
    ? product.images
    : ['/placeholder.svg'],
  ```

  (O, si prefieres, filtrar con `getImageUrl` y luego decidir el fallback; si unificas en `getImageUrl`, este filtro puede ser más simple.)

---

### 3.8 `SmartImage`: `unoptimized` y dominios del backend

- **Dónde:** `components/ui/smart-image.tsx`, `shouldUnoptimize`.
- **Estado:** Se marca `unoptimized` para `data:`, `placeholder`, `/api/`, `/uploads/`, y los hostnames `habaluna-backend-production.up.railway.app` y `localhost:4000`. Eso evita que `next/image` intente optimizar URLs que no controla. Correcto.
- **Qué hacer:**  
  - Si en el futuro el backend usa otro dominio, añadirlo a la condición de `shouldUnoptimize` o, mejor, derivarlo de `getApiBaseUrlLazy()` (p. ej. `imgSrc.startsWith(getApiBaseUrlLazy())`) para no hardcodear hostnames.  
  - Mantener `next.config.js` `images.remotePatterns` con los hostnames del backend y de otros orígenes que sirvan imágenes; aunque con `unoptimized` Next no optimice, puede seguir validando el `src` en algunos flujos.

---

### 3.9 Backend: cache y cabeceras para `/api/media/:id`

- **Dónde:** `backend/src/media/media.controller.ts`.
- **Estado:** Ya se envían `Cache-Control: public, max-age=31536000, immutable` cuando se sirve el binario. Bien.
- **Qué hacer:**
  - Asegurar que, en 404, no se pongan cabeceras de cache largas (por si en el futuro se reutiliza el ID).  
  - Opcional: en 404, loguear `id` y `referer` (o similar) para detectar productos con `images` rotos y limpiarlos en la BD.

---

### 3.10 Reducir peticiones simultáneas (lazy + `priority`)

- **Dónde:** Uso de `SmartImage` / `next/image` en listas y grids.
- **Qué hacer:**
  - `next/image` ya usa `loading="lazy"` por defecto salvo con `priority`.
  - Mantener `priority` solo en hero y en las 4–6 primeras imágenes above the fold (véase 3.2).  
  - No poner `priority` en toda la lista; así el navegador no dispara todas a la vez y se reduce la cola y la sensación de “no cargan” o de cargas que solo se ven tras recargar.

---

### 3.11 Fallback cuando `getImageUrl` devuelve `null` (Cloudinary, etc.)

- **Dónde:** `SmartImage`, y cualquier `map(getImageUrl).filter(Boolean)`.
- **Estado:** En `SmartImage`, si `!imgSrc || hasError` se muestra `PlaceholderError`. Si `getImageUrl` devuelve `null`, `imgSrc` es null y se cumple. Bien.
- **Qué hacer:**  
  - Asegurar que, en `ProductCard`, `normalizedImages` nunca dé lugar a `currentImage` undefined:  
    `const firstImage = normalizedImages[0] || "/placeholder.svg"`  
    (ya lo haces).  
  - En `getImageUrl`, para Cloudinary seguir devolviendo `null` y que el flujo existente (filter + fallback a `/placeholder.svg`) se encargue. No devolver una URL de Cloudinary.

---

### 3.12 Comprobar que el backend devuelve `Product.images` en formato esperado

- **Dónde:** Backend: modelo Prisma `Product`, DTOs, y controladores que exponen `images`.
- **Formato esperado por el frontend (tras unificación):**  
  - IDs de Media: `"/api/media/{id}"` o el `id` solo (y `getImageUrl` construye `/api/media/{id}`).  
  - Archivos estáticos: `"/uploads/..."`.  
  - No incluir URLs de Cloudinary si ya no se usan; si se hace, `getImageUrl` puede seguir devolviendo `null` y el frontend usar placeholder.
- **Qué hacer:**  
  - Revisar que lo que se guarda en `Product.images` al subir (p. ej. lo que devuelve `upload.service`: `/api/media/${created.id}`) sea consistente con lo que `getImageUrl` y `normalizeImageUrl` entienden.  
  - Si en algún flujo se guardara solo el `id` (UUID) o una ruta relativa, `getImageUrl` debe poder resolverla (ya cubre ID → `/api/media/{id}` y `/uploads/` con base).

---

## 4. Orden sugerido de implementación

1. **Configuración y diagnóstico**  
   - Verificar `NEXT_PUBLIC_API_URL` en build y runtime.  
   - Probar en el navegador `https://<BACKEND>/api/media/<ID>` con un ID real de `Product.images`.

2. **Unificación de URLs**  
   - Unificar `normalizeImageUrl` y `getImageUrl` (o que una llame a la otra).  
   - Reemplazar placeholders raros por `/placeholder.svg`.

3. **LCP y concurrencia**  
   - Añadir `priority` solo a hero y a las 4–6 primeras imágenes visibles.  
   - Ajustar `sizes` en tarjetas y grids.

4. **Robustez**  
   - Validar `image` en `getImageUrl`.  
   - En product-carousel, no sobrescribir `images` cuando ya hay entradas válidas (y, si aplica, filtrar con la lógica unificada).

5. **Backend**  
   - Revisar 404 en `/api/media` y formato de `Product.images`; opcional: logs en 404.

---

## 5. Comprobaciones rápidas en el navegador

- **Variables y base:**  
  `console.log(window.__HABANALUNA_API_CONFIG)`  
  - `baseUrl` debe ser la raíz del backend (sin `/api`).  
  - `envVar` no debería ser `'not set'` en producción.

- **Imagen concreta:**  
  - Inspeccionar un `<img>` que falle, copiar `src` y abrirlo en una pestaña.  
  - Si es 404: ID inválido o ruta equivocada.  
  - Si tarda mucho: saturación o backend lento.

- **Carga en bloque:**  
  - Network → Img, recargar la home: ver cuántas peticiones a `/api/media/` o al host del backend, cuántas en “Queueing” y los tiempos de respuesta.

---

## 6. Resumen de archivos a tocar

| Archivo | Cambios |
|--------|---------|
| `lib/image-utils.ts` | Validar `image` en `getImageUrl`; opcional: que `normalizeImageUrl` (en api) lo use o comparta lógica. |
| `lib/api.ts` | Hacer que `normalizeImageUrl` delegue en `getImageUrl` o unificar la lógica. |
| `components/ui/smart-image.tsx` | Derivar `shouldUnoptimize` del base URL si es posible; mantener `priority` solo donde corresponda. |
| `components/product/product-card.tsx` | Prop `priority`, pasarla a `SmartImage`; revisar `sizes` si se cambia. |
| `components/sections/product-carousel.tsx` | Pasar `priority={index < 4}` a `ProductCard`; no sobrescribir `images` cuando ya haya valores válidos. |
| `components/sections/top-sales.tsx` | Sustituir `"/placeholder.svg?height=600&width=600&query=featured product"` por `"/placeholder.svg"`; si usas `SmartImage`, normalizar con `getImageUrl` y mismo fallback. |
| `app/(main)/page.tsx` | Sin cambios de imagen; sí asegurar que `getBanners` use una normalización alineada con `getImageUrl` si las imágenes vienen del backend. |
| `next.config.js` | Mantener `images.remotePatterns` con los hostnames del backend. |
| Variables de entorno (Vercel/Railway, etc.) | Definir y documentar `NEXT_PUBLIC_API_URL` en build y runtime. |

---

## 7. Nota sobre los últimos cambios de UI

Los cambios recientes (modo oscuro, paleta, tokens) no modifican la lógica de `getImageUrl`, `SmartImage`, `next/image`, ni las variables de entorno. Si las imágenes han dejado de verse *después* de esos cambios, es más plausible que:

- Algún cambio de desploy o de variables (p. ej. `NEXT_PUBLIC_API_URL`) se aplicara a la vez, o  
- Un cambio de estilos (p. ej. `opacity`, `height`, `overflow`, `object-fit`) en un contenedor o en la imagen haga que no se vean aunque la petición sea 200.

Recomendación: en DevTools, comprobar para una imagen que “no se ve”:

- Si la petición en Network es 200 y el `src` es el esperado.  
- Si el elemento `<img>` (o el contenedor) tiene tamaño y `opacity`/`visibility` que permitan verla.  
Con eso se separa un fallo de “no carga” (red/URL) de un fallo de “sí carga pero no se ve” (CSS/estructura).
