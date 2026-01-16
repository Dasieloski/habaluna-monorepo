import { getApiBaseUrlLazy } from "./api"

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
    return null
  }
  
  // Si es una URL completa que NO es Cloudinary, retornarla
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image
  }
  
  // Usar getApiBaseUrlLazy() para obtener la URL base correcta
  const base = getApiBaseUrlLazy()

  // Priorizar URLs de la BD: /api/media/{id}
  if (image.startsWith("/api/media/")) {
    return `${base}${image}`
  }

  // Si empieza con /uploads, construir la URL completa del backend
  if (image.startsWith("/uploads/")) {
    return `${base}${image}`
  }

  // Si es un UUID (probablemente ID de imagen en BD), convertir a /api/media/{id}
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidPattern.test(image)) {
    return `${base}/api/media/${image}`
  }

  // Si es un string largo que parece hash/ID (sin /), asumir que es ID de BD
  if (image.length > 20 && /^[a-zA-Z0-9\-_]+$/.test(image) && !image.startsWith('/')) {
    return `${base}/api/media/${image}`
  }

  // Rutas del backend (aunque empiecen por /) -> prefijar con el dominio del API
  if (
    image.startsWith("/api/") ||
    image.startsWith("/products/") ||
    image.startsWith("/banners/")
  ) {
    return `${base}${image}`
  }

  // Rutas locales de public (Next.js sirve public/ desde la raíz del frontend)
  // Solo si NO parece ser una ruta de backend
  if (image.startsWith("/") && !image.startsWith("/api") && !image.startsWith("/uploads")) {
    return image
  }

  // Fallback: si viene sin / y sin http, asumir que es ID de BD
  return `${base}/api/media/${image}`
}
