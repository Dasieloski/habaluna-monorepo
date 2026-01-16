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

  // Si es un string que parece ID de BD (sin /, sin http, sin espacios, sin caracteres especiales)
  // UUIDs pueden tener guiones, pero también aceptamos IDs sin guiones
  const trimmed = image.trim()
  if (trimmed && !trimmed.startsWith('/') && !trimmed.startsWith('http')) {
    // Si tiene más de 10 caracteres y solo contiene letras, números, guiones y guiones bajos
    // Es muy probable que sea un ID de la tabla Media
    if (trimmed.length >= 10 && /^[a-zA-Z0-9\-_]+$/.test(trimmed)) {
      return `${base}/api/media/${trimmed}`
    }
    
    // Si tiene entre 8 y 36 caracteres (rango típico de UUIDs y hashes)
    // y no contiene espacios ni caracteres especiales problemáticos
    if (trimmed.length >= 8 && trimmed.length <= 36 && /^[a-zA-Z0-9\-_]+$/.test(trimmed)) {
      return `${base}/api/media/${trimmed}`
    }
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
    // Verificar si es una ruta local conocida
    if (
      image.startsWith("/placeholder") || 
      image.startsWith("/images") || 
      image.endsWith(".svg") ||
      image.endsWith(".png") ||
      image.endsWith(".jpg") ||
      image.endsWith(".jpeg")
    ) {
      return image
    }
    // Si no es una ruta local conocida, puede ser un ID que empieza con /
    // Intentar como ID de BD
    const withoutSlash = image.substring(1)
    if (withoutSlash.length >= 8 && /^[a-zA-Z0-9\-_]+$/.test(withoutSlash)) {
      return `${base}/api/media/${withoutSlash}`
    }
  }

  // Fallback: si viene sin / y sin http, asumir que es ID de BD
  // Solo si tiene al menos 8 caracteres (mínimo para ser un ID válido)
  if (trimmed.length >= 8 && /^[a-zA-Z0-9\-_]+$/.test(trimmed)) {
    return `${base}/api/media/${trimmed}`
  }

  // Si no cumple ningún patrón, retornar null para que se use placeholder
  return null
}
