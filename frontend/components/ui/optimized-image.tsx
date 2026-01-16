'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { getApiBaseUrlLazy } from "@/lib/api"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  onError?: () => void
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

/**
 * Componente de imagen optimizado que:
 * - Usa Next.js Image para optimización automática (WebP/AVIF)
 * - Maneja errores de carga con fallback
 * - Soporta lazy loading (excepto para imágenes críticas)
 * - Asegura HTTPS para compatibilidad iOS/Safari
 * - Incluye placeholders mientras carga
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  objectFit = 'cover',
  onError,
  placeholder = 'empty',
  blurDataURL,
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src)
  const [hasError, setHasError] = useState(false)

  // Normalizar URL: asegurar HTTPS y formato correcto
  useEffect(() => {
    if (!src) {
      setHasError(true)
      return
    }

    let normalizedSrc = src.trim()
    
    // CRÍTICO: Eliminar referencias a Cloudinary - usar solo imágenes de la BD
    if (normalizedSrc.includes('cloudinary.com') || normalizedSrc.includes('res.cloudinary')) {
      console.warn('[OptimizedImage] URL de Cloudinary detectada, ignorando:', normalizedSrc)
      setHasError(true)
      return
    }
    
    // Usar getApiBaseUrlLazy() en lugar de localhost hardcodeado
    const apiBase = getApiBaseUrlLazy()
    
    // Si es una URL relativa que empieza con /:
    // - /api/* y /uploads/* viven en el backend (prefijar con API base)
    // - lo demás se asume que es asset local del frontend (public/)
    if (normalizedSrc.startsWith('/')) {
      // Priorizar URLs de la BD: /api/media/{id}
      if (normalizedSrc.startsWith('/api/media/') || normalizedSrc.startsWith('/api/') || normalizedSrc.startsWith('/uploads/')) {
        setImgSrc(`${apiBase}${normalizedSrc}`)
        return
      }
      // Rutas locales del frontend (public/) - solo si no parece ser ID de BD
      if (normalizedSrc.startsWith('/placeholder') || normalizedSrc.startsWith('/images') || normalizedSrc.endsWith('.svg')) {
        setImgSrc(normalizedSrc)
        return
      }
      // Si no es ruta local conocida, asumir que es ruta del backend
      setImgSrc(`${apiBase}${normalizedSrc}`)
      return
    }

    // Si no tiene protocolo ni /, puede ser UUID o ID de BD
    if (!normalizedSrc.startsWith('http://') && !normalizedSrc.startsWith('https://')) {
      // Si es un UUID o ID largo, convertir a /api/media/{id}
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (uuidPattern.test(normalizedSrc) || (normalizedSrc.length > 20 && /^[a-zA-Z0-9\-_]+$/.test(normalizedSrc))) {
        normalizedSrc = `${apiBase}/api/media/${normalizedSrc}`
      } else if (
        normalizedSrc.startsWith('api/') ||
        normalizedSrc.startsWith('uploads/')
      ) {
        normalizedSrc = `${apiBase}/${normalizedSrc}`
      } else {
        // Por defecto, asumir que es ID de BD
        normalizedSrc = `${apiBase}/api/media/${normalizedSrc}`
      }
    }

    // Forzar HTTPS para compatibilidad iOS/Safari
    if (normalizedSrc.startsWith('http://')) {
      normalizedSrc = normalizedSrc.replace('http://', 'https://')
    }

    setImgSrc(normalizedSrc)
  }, [src])

  const handleError = () => {
    setHasError(true)
    if (onError) {
      onError()
    }
  }

  // Si hay error, mostrar placeholder
  if (hasError || !imgSrc) {
    return (
      <div className={`flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200 ${className}`}>
        <div className="text-center p-4">
          <svg
            className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs text-gray-500">Imagen no disponible</p>
        </div>
      </div>
    )
  }

  // Usar Next.js Image para optimización automática
  const objectFitClass = objectFit === 'cover' ? 'object-cover' : objectFit === 'contain' ? 'object-contain' : objectFit === 'fill' ? 'object-fill' : objectFit === 'scale-down' ? 'object-scale-down' : ''
  const imageProps = {
    src: imgSrc,
    alt,
    className: `${className} ${objectFitClass}`,
    priority,
    sizes,
    onError: handleError,
    placeholder,
    blurDataURL,
    ...(fill
      ? { fill: true }
      : {
          width: width || 400,
          height: height || 400,
        }),
  }

  // Deshabilitar optimización para:
  // - Imágenes externas que no podemos controlar
  // - Imágenes del backend (pueden no existir o retornar null)
  // - Data URLs
  const shouldUnoptimize = 
    imgSrc.startsWith('data:') || 
    imgSrc.includes('unsplash.com') || 
    imgSrc.includes('placeholder') ||
    imgSrc.includes('/api/') ||
    imgSrc.includes('/uploads/') ||
    imgSrc.includes('habaluna-backend-production.up.railway.app') ||
    imgSrc.includes('localhost:4000')

  return <Image {...imageProps} unoptimized={shouldUnoptimize} />
}

/**
 * Versión simple para usar con <img> cuando Next.js Image no es adecuado
 * (por ejemplo, para imágenes externas que no se pueden optimizar)
 */
export function OptimizedImg({
  src,
  alt,
  className = '',
  loading = 'lazy' as 'lazy' | 'eager',
  onError,
  ...props
}: {
  src: string
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
  onError?: () => void
  [key: string]: any
}) {
  const [imgSrc, setImgSrc] = useState<string>(src)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!src) {
      setHasError(true)
      return
    }

    let normalizedSrc = src.trim()
    
    // CRÍTICO: Eliminar referencias a Cloudinary - usar solo imágenes de la BD
    if (normalizedSrc.includes('cloudinary.com') || normalizedSrc.includes('res.cloudinary')) {
      console.warn('[OptimizedImg] URL de Cloudinary detectada, ignorando:', normalizedSrc)
      setHasError(true)
      return
    }
    
    // Usar getApiBaseUrlLazy() en lugar de localhost hardcodeado
    const apiBase = getApiBaseUrlLazy()
    
    // Si es relativa, ver si pertenece al backend (/api o /uploads)
    if (normalizedSrc.startsWith('/')) {
      // Priorizar URLs de la BD: /api/media/{id}
      if (normalizedSrc.startsWith('/api/media/') || normalizedSrc.startsWith('/api/') || normalizedSrc.startsWith('/uploads/')) {
        setImgSrc(`${apiBase}${normalizedSrc}`)
        return
      }
      // Rutas locales del frontend (public/)
      setImgSrc(normalizedSrc)
      return
    }

    // Si no tiene protocolo, construir URL completa
    if (!normalizedSrc.startsWith('http://') && !normalizedSrc.startsWith('https://')) {
      if (
        normalizedSrc.startsWith('/api/') ||
        normalizedSrc.startsWith('api/') ||
        normalizedSrc.startsWith('/uploads/') ||
        normalizedSrc.startsWith('uploads/')
      ) {
        normalizedSrc = `${apiBase}${normalizedSrc.startsWith('/') ? '' : '/'}${normalizedSrc}`
      } else {
        normalizedSrc = `${apiBase}/uploads/${normalizedSrc}`
      }
    }

    // Forzar HTTPS
    if (normalizedSrc.startsWith('http://')) {
      normalizedSrc = normalizedSrc.replace('http://', 'https://')
    }

    setImgSrc(normalizedSrc)
  }, [src])

  const handleError = () => {
    setHasError(true)
    if (onError) {
      onError()
    }
  }

  if (hasError || !imgSrc) {
    return (
      <div className={`flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200 ${className}`}>
        <div className="text-center p-4">
          <svg
            className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs text-gray-500">Imagen no disponible</p>
        </div>
      </div>
    )
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      onError={handleError}
      {...props}
    />
  )
}
