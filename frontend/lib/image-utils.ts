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

export function getImageUrl(
  image?: string,
  opts?: { width?: number; height?: number }
): string | null {
  if (!image) return null
  
  const trimmed = image.trim()
  if (!trimmed) return null
  
  // Eliminar referencias a Cloudinary - usar solo imágenes de la BD
  if (trimmed.includes('cloudinary.com') || trimmed.includes('res.cloudinary')) {
    return null
  }
  
  // Si es una URL completa que NO es Cloudinary, retornarla tal cual
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed
  }
  
  // Usar getApiBaseUrlLazy() para obtener la URL base correcta
  const base = getApiBaseUrlLazy()

  // Si ya es una ruta completa del backend con /api/media/, retornarla con base
  if (trimmed.startsWith("/api/media/")) {
    return `${base}${trimmed}`
  }

  // Si empieza con /uploads, construir la URL completa del backend
  if (trimmed.startsWith("/uploads/")) {
    return `${base}${trimmed}`
  }

  // Rutas locales del frontend (public/) - retornar tal cual
  if (
    trimmed.startsWith("/placeholder") || 
    trimmed.startsWith("/images") || 
    trimmed.startsWith("/logo") ||
    trimmed.endsWith(".svg") ||
    trimmed.endsWith(".png") ||
    trimmed.endsWith(".jpg") ||
    trimmed.endsWith(".jpeg") ||
    trimmed.endsWith(".webp")
  ) {
    return trimmed
  }

  // CUALQUIER otro string se trata como ID de Media y se convierte a /api/media/{id}
  // Esto incluye:
  // - UUIDs con guiones: "123e4567-e89b-12d3-a456-426614174000"
  // - IDs sin guiones: "abc123def456"
  // - Strings que empiezan con / pero no son rutas conocidas: "/abc123"
  
  // Si empieza con /, quitar el / primero
  const imageId = trimmed.startsWith('/') ? trimmed.substring(1) : trimmed
  
  // Si después de quitar el / está vacío, retornar null
  if (!imageId) return null
  
  // Convertir a /api/media/{id} con optimización WebP por defecto
  // El backend optimizará automáticamente si tiene sharp instalado
  const params = new URLSearchParams({ format: 'webp', q: '80' })
  if (opts?.width) params.set('w', String(opts.width))
  if (opts?.height) params.set('h', String(opts.height))
  return `${base}/api/media/${imageId}?${params.toString()}`
}
