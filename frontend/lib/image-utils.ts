/**
 * Normaliza una URL de imagen para mostrarla correctamente
 * - Si es una URL absoluta (http/https), la devuelve tal cual
 * - Si es una ruta relativa que empieza con /uploads, la convierte a URL del backend
 * - Si es una ruta relativa del seed (como /products/...), devuelve un placeholder
 * - Si está vacía o es null/undefined, devuelve null
 */
export function getImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;

  // Si ya es una URL absoluta, devolverla tal cual
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Si es una ruta de uploads, construir la URL del backend
  if (imagePath.startsWith('/uploads/')) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
    return `${backendUrl}${imagePath}`;
  }

  // Si es una ruta relativa que empieza con /, puede ser:
  // - Un archivo estático del frontend (como /logo.png) - devolver tal cual
  // - Una ruta del seed que no existe (como /products/...) - devolver null
  // Por ahora, solo devolvemos null para rutas conocidas del seed
  if (imagePath.startsWith('/products/') || imagePath.startsWith('/banners/')) {
    return null;
  }
  
  // Para otras rutas que empiezan con /, asumimos que son archivos estáticos del frontend
  if (imagePath.startsWith('/')) {
    return imagePath;
  }

  // Si no tiene prefijo, asumimos que es una ruta de uploads
  const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
  return `${backendUrl}/uploads/${imagePath}`;
}

/**
 * Obtiene la primera imagen de un array de imágenes
 */
export function getFirstImage(images: string[] | null | undefined): string | null {
  if (!images || images.length === 0) return null;
  return getImageUrl(images[0]);
}

