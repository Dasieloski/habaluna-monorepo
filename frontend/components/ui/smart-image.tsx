'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { getApiBaseUrlLazy } from "@/lib/api"
import { cn } from "@/lib/utils"

/**
 * Genera un blurDataURL base64 ligero para placeholder
 * Usa un SVG de 10x10px con gradiente suave
 * Base64 pre-generado para evitar usar Buffer en el cliente
 */
function generateBlurDataURL(): string {
  // SVG base64 pre-generado: 10x10px gradiente gris
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZTZlN2ViO3N0b3Atb3BhY2l0eToxIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmM2Y0ZjY7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlNWU3ZWI7c3RvcC1vcGFjaXR5OjEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIi8+PC9zdmc+'
}

/**
 * Componente Skeleton para imágenes
 * Respetando el tamaño final de la imagen
 */
function ImageSkeleton({ 
  className, 
  width, 
  height, 
  fill 
}: { 
  className?: string
  width?: number
  height?: number
  fill?: boolean
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-linear-to-br from-gray-100 via-gray-50 to-gray-100",
        "animate-pulse",
        className
      )}
      style={
        fill
          ? { width: '100%', height: '100%' }
          : width && height
          ? { width, height }
          : undefined
      }
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
    </div>
  )
}

interface SmartImageProps {
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
  onLoadingComplete?: () => void
  blurDataURL?: string
  aspectRatio?: string
}

/**
 * Componente SmartImage - Sistema global de imágenes con blur/skeleton
 * 
 * Características:
 * - Next.js Image con optimización automática
 * - Blur placeholder (generado automáticamente si no se proporciona)
 * - Skeleton loader mientras carga
 * - Normalización automática de URLs (BD, uploads, locales)
 * - Manejo de errores con fallback
 * - Sin layout shift (respeta dimensiones)
 * - Lazy loading por defecto (excepto priority)
 */
export function SmartImage({
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
  onLoadingComplete,
  blurDataURL,
  aspectRatio,
}: SmartImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [blurPlaceholder, setBlurPlaceholder] = useState<string>(blurDataURL || '')

  // Normalizar URL: asegurar HTTPS y formato correcto
  useEffect(() => {
    if (!src) {
      setHasError(true)
      setIsLoading(false)
      return
    }

    let normalizedSrc = src.trim()
    
    // CRÍTICO: Eliminar referencias a Cloudinary - usar solo imágenes de la BD
    if (normalizedSrc.includes('cloudinary.com') || normalizedSrc.includes('res.cloudinary')) {
      console.warn('[SmartImage] URL de Cloudinary detectada, ignorando:', normalizedSrc)
      setHasError(true)
      setIsLoading(false)
      return
    }
    
    // Si es una URL completa, retornarla tal cual (forzar HTTPS)
    if (normalizedSrc.startsWith('http://') || normalizedSrc.startsWith('https://')) {
      if (normalizedSrc.startsWith('http://')) {
        normalizedSrc = normalizedSrc.replace('http://', 'https://')
      }
      setImgSrc(normalizedSrc)
      return
    }
    
    // Usar getApiBaseUrlLazy() en lugar de localhost hardcodeado
    const apiBase = getApiBaseUrlLazy()
    
    // Si ya es una ruta completa del backend con /api/media/, retornarla con base
    if (normalizedSrc.startsWith('/api/media/')) {
      setImgSrc(`${apiBase}${normalizedSrc}`)
      return
    }

    // Si empieza con /uploads, construir la URL completa del backend
    if (normalizedSrc.startsWith('/uploads/')) {
      setImgSrc(`${apiBase}${normalizedSrc}`)
      return
    }

    // Rutas locales del frontend (public/) - retornar tal cual
    if (
      normalizedSrc.startsWith('/placeholder') || 
      normalizedSrc.startsWith('/images') || 
      normalizedSrc.startsWith('/logo') ||
      normalizedSrc.endsWith('.svg') ||
      normalizedSrc.endsWith('.png') ||
      normalizedSrc.endsWith('.jpg') ||
      normalizedSrc.endsWith('.jpeg') ||
      normalizedSrc.endsWith('.webp')
    ) {
      setImgSrc(normalizedSrc)
      return
    }

    // CUALQUIER otro string se trata como ID de Media y se convierte a /api/media/{id}
    // Si empieza con /, quitar el / primero
    const imageId = normalizedSrc.startsWith('/') ? normalizedSrc.substring(1) : normalizedSrc
    
    // Si después de quitar el / está vacío, marcar error
    if (!imageId) {
      setHasError(true)
      setIsLoading(false)
      return
    }
    
    // Convertir a /api/media/{id}
    setImgSrc(`${apiBase}/api/media/${imageId}`)
  }, [src])

  // Generar blur placeholder si no se proporciona
  useEffect(() => {
    if (!blurDataURL && !blurPlaceholder) {
      setBlurPlaceholder(generateBlurDataURL())
    }
  }, [blurDataURL, blurPlaceholder])

  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoading(false)
    if (onError) {
      onError()
    }
  }, [onError])

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false)
    if (onLoadingComplete) {
      onLoadingComplete()
    }
  }, [onLoadingComplete])

  // Si hay error, mostrar placeholder de error
  if (hasError || !imgSrc) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200",
          className
        )}
        style={
          fill
            ? { width: '100%', height: '100%' }
            : aspectRatio
            ? { aspectRatio }
            : width && height
            ? { width, height }
            : undefined
        }
      >
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
  const objectFitClass = 
    objectFit === 'cover' ? 'object-cover' : 
    objectFit === 'contain' ? 'object-contain' : 
    objectFit === 'fill' ? 'object-fill' : 
    objectFit === 'scale-down' ? 'object-scale-down' : ''

  // Deshabilitar optimización para:
  // - Imágenes externas que no podemos controlar
  // - Imágenes del backend (pueden no existir o retornar null)
  // - Data URLs
  const shouldUnoptimize = 
    imgSrc.startsWith('data:') || 
    imgSrc.includes('placeholder') ||
    imgSrc.includes('/api/') ||
    imgSrc.includes('/uploads/') ||
    imgSrc.includes('habaluna-backend-production.up.railway.app') ||
    imgSrc.includes('localhost:4000')

  const imageProps = {
    src: imgSrc,
    alt,
    className: cn(className, objectFitClass, "transition-opacity duration-300", isLoading ? "opacity-0" : "opacity-100"),
    priority,
    sizes,
    onError: handleError,
    onLoadingComplete: handleLoadingComplete,
    placeholder: blurPlaceholder ? ('blur' as const) : ('empty' as const),
    blurDataURL: blurPlaceholder || undefined,
    unoptimized: shouldUnoptimize,
    // Asegurar dimensiones para evitar CLS
    ...(fill
      ? { fill: true }
      : {
          width: width || 400,
          height: height || 400,
        }),
    ...(aspectRatio && !fill ? { style: { aspectRatio } } : {}),
    // Fetch priority para imágenes críticas
    fetchPriority: priority ? ('high' as const) : ('auto' as const),
  }

  return (
    <div 
      className={cn("relative", className)}
      style={
        fill
          ? { width: '100%', height: '100%' }
          : aspectRatio && !width && !height
          ? { aspectRatio }
          : width && height
          ? { width, height }
          : undefined
      }
    >
      {/* Skeleton mientras carga */}
      {isLoading && (
        <ImageSkeleton
          className="absolute inset-0 z-10"
          width={width}
          height={height}
          fill={fill}
        />
      )}
      
      {/* Imagen real */}
      <Image {...imageProps} />
    </div>
  )
}

/**
 * Versión simple para usar con <img> cuando Next.js Image no es adecuado
 * Incluye skeleton loader
 */
export function SmartImg({
  src,
  alt,
  className = '',
  loading = 'lazy' as 'lazy' | 'eager',
  onError,
  width,
  height,
  aspectRatio,
  ...props
}: {
  src: string
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
  onError?: () => void
  width?: number | string
  height?: number | string
  aspectRatio?: string
  [key: string]: any
}) {
  const [imgSrc, setImgSrc] = useState<string>(src)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!src) {
      setHasError(true)
      setIsLoading(false)
      return
    }

    let normalizedSrc = src.trim()
    
    // CRÍTICO: Eliminar referencias a Cloudinary - usar solo imágenes de la BD
    if (normalizedSrc.includes('cloudinary.com') || normalizedSrc.includes('res.cloudinary')) {
      console.warn('[SmartImg] URL de Cloudinary detectada, ignorando:', normalizedSrc)
      setHasError(true)
      setIsLoading(false)
      return
    }
    
    // Si es una URL completa, retornarla tal cual (forzar HTTPS)
    if (normalizedSrc.startsWith('http://') || normalizedSrc.startsWith('https://')) {
      if (normalizedSrc.startsWith('http://')) {
        normalizedSrc = normalizedSrc.replace('http://', 'https://')
      }
      setImgSrc(normalizedSrc)
      return
    }
    
    // Usar getApiBaseUrlLazy() en lugar de localhost hardcodeado
    const apiBase = getApiBaseUrlLazy()
    
    // Si ya es una ruta completa del backend con /api/media/, retornarla con base
    if (normalizedSrc.startsWith('/api/media/')) {
      setImgSrc(`${apiBase}${normalizedSrc}`)
      return
    }

    // Si empieza con /uploads, construir la URL completa del backend
    if (normalizedSrc.startsWith('/uploads/')) {
      setImgSrc(`${apiBase}${normalizedSrc}`)
      return
    }

    // Rutas locales del frontend (public/) - retornar tal cual
    if (
      normalizedSrc.startsWith('/placeholder') || 
      normalizedSrc.startsWith('/images') || 
      normalizedSrc.startsWith('/logo') ||
      normalizedSrc.endsWith('.svg') ||
      normalizedSrc.endsWith('.png') ||
      normalizedSrc.endsWith('.jpg') ||
      normalizedSrc.endsWith('.jpeg') ||
      normalizedSrc.endsWith('.webp')
    ) {
      setImgSrc(normalizedSrc)
      return
    }

    // CUALQUIER otro string se trata como ID de Media y se convierte a /api/media/{id}
    // Si empieza con /, quitar el / primero
    const imageId = normalizedSrc.startsWith('/') ? normalizedSrc.substring(1) : normalizedSrc
    
    // Si después de quitar el / está vacío, marcar error
    if (!imageId) {
      setHasError(true)
      setIsLoading(false)
      return
    }
    
    // Convertir a /api/media/{id}
    setImgSrc(`${apiBase}/api/media/${imageId}`)
  }, [src])

  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoading(false)
    if (onError) {
      onError()
    }
  }, [onError])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  if (hasError || !imgSrc) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200",
          className
        )}
        style={
          aspectRatio
            ? { aspectRatio }
            : width && height
            ? { width, height }
            : undefined
        }
      >
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

  const containerStyle = aspectRatio
    ? { aspectRatio }
    : width && height
    ? { 
        width: typeof width === 'number' ? width : width, 
        height: typeof height === 'number' ? height : height 
      }
    : undefined

  return (
    <div 
      className={cn("relative overflow-hidden", !aspectRatio && !width && !height ? className : '')}
      style={containerStyle}
    >
      {/* Skeleton mientras carga */}
      {isLoading && (
        <ImageSkeleton
          className="absolute inset-0 z-10"
          width={typeof width === 'number' ? width : undefined}
          height={typeof height === 'number' ? height : undefined}
        />
      )}
      
      {/* Imagen real */}
      <img
        src={imgSrc}
        alt={alt}
        className={cn(
          "transition-opacity duration-300 w-full h-full object-cover",
          isLoading ? "opacity-0" : "opacity-100",
          !aspectRatio && !width && !height ? className : ''
        )}
        loading={loading}
        decoding="async"
        onError={handleError}
        onLoad={handleLoad}
        width={typeof width === 'number' ? width : undefined}
        height={typeof height === 'number' ? height : undefined}
        style={aspectRatio ? { aspectRatio } : undefined}
        {...props}
      />
    </div>
  )
}
