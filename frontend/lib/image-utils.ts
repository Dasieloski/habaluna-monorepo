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
  if (image.startsWith("http")) return image
  const raw = (process.env.NEXT_PUBLIC_API_URL || "").trim()
  const base = (raw && !/^https?:\/\//i.test(raw) ? `https://${raw}` : raw).replace(/\/api\/?$/, "")

  // Rutas del backend (aunque empiecen por /) -> prefijar con el dominio del API
  if (
    image.startsWith("/api/") ||
    image.startsWith("/uploads/") ||
    image.startsWith("/products/") ||
    image.startsWith("/banners/")
  ) {
    return base ? `${base}${image}` : image
  }

  // Rutas locales de public (Next.js sirve public/ desde la raíz del frontend)
  if (image.startsWith("/")) return image

  // Fallback: si viene sin / y sin http, asumir que es ruta de backend
  return base ? `${base}/${image}` : image
}
