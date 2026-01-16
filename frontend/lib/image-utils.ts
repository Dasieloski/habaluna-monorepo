export function getFirstImage(images?: string | string[]): string | null {
  if (!images) return null
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images)
      return Array.isArray(parsed) ? parsed[0] : images
    } catch {
      return images
    }
  }
  return images[0] || null
}

export function getImageUrl(image?: string): string | null {
  if (!image) return null
  
  // Eliminar referencias a Cloudinary - usar solo imágenes de la BD
  if (image.includes('cloudinary.com') || image.includes('res.cloudinary')) {
    console.warn('[getImageUrl] URL de Cloudinary detectada, ignorando:', image)
    return null
  }
  
  // Si es una URL completa que NO es Cloudinary, retornarla
  if (image.startsWith("http")) return image
  
  // Usar getApiBaseUrlLazy() para obtener la URL base correcta
  const base = getApiBaseUrlLazy()

  // Priorizar URLs de la BD: /api/media/{id}
  if (image.startsWith("/api/media/")) {
    return `${base}${image}`
  }

  // Rutas del backend (aunque empiecen por /) -> prefijar con el dominio del API
  if (
    image.startsWith("/api/") ||
    image.startsWith("/uploads/") ||
    image.startsWith("/products/") ||
    image.startsWith("/banners/")
  ) {
    return `${base}${image}`
  }

  // Rutas locales de public (Next.js sirve public/ desde la raíz del frontend)
  if (image.startsWith("/")) return image

  // Fallback: si viene sin / y sin http, asumir que es ruta de backend
  return `${base}/${image}`
}
