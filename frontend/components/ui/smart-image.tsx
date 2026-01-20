'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { getImageUrl } from '@/lib/image-utils'
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
        "relative overflow-hidden bg-muted",
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
      <div className="absolute inset-0 bg-card animate-shimmer" />
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
const MAX_RETRIES = 2

function PlaceholderError({ className, fill, aspectRatio, width, height }: {
  className?: string
  fill?: boolean
  aspectRatio?: string
  width?: number
  height?: number
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-muted",
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
          className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 text-muted-foreground"
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
        <p className="text-xs text-muted-foreground">Imagen no disponible</p>
      </div>
    </div>
  )
}

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
  // Normalización SÍNCRONA: URL lista en el primer render, sin esperar useEffect
  const imgSrc = useMemo(
    () => getImageUrl(src?.trim(), { width, height: typeof height === 'number' ? height : undefined }),
    [src, width, height]
  )

  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const blurPlaceholder = useMemo(() => blurDataURL || generateBlurDataURL(), [blurDataURL])

  // Reset estados al cambiar src
  useEffect(() => {
    setHasError(false)
    setIsLoading(true)
    setRetryCount(0)
  }, [src])

  const handleError = useCallback(() => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount((r) => r + 1)
      setIsLoading(true)
    } else {
      setHasError(true)
      setIsLoading(false)
      onError?.()
    }
  }, [onError, retryCount])

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false)
    onLoadingComplete?.()
  }, [onLoadingComplete])

  // Sin src válido o error definitivo tras reintentos → placeholder
  if (!imgSrc || hasError) {
    return <PlaceholderError className={className} fill={fill} aspectRatio={aspectRatio} width={width} height={height} />
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
      
      {/* key con retryCount fuerza un nuevo request en cada reintento */}
      <Image key={retryCount} {...imageProps} />
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
  const w = typeof width === 'number' ? width : undefined
  const h = typeof height === 'number' ? height : undefined
  const imgSrc = useMemo(() => getImageUrl(src?.trim(), { width: w, height: h }), [src, w, h])

  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    setHasError(false)
    setIsLoading(true)
    setRetryCount(0)
  }, [src])

  const handleError = useCallback(() => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount((r) => r + 1)
      setIsLoading(true)
    } else {
      setHasError(true)
      setIsLoading(false)
      onError?.()
    }
  }, [onError, retryCount])

  const handleLoad = useCallback(() => setIsLoading(false), [])

  if (!imgSrc || hasError) {
    return (
      <PlaceholderError
        className={className}
        aspectRatio={aspectRatio}
        width={w}
        height={h}
      />
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
      
      {/* key con retryCount fuerza un nuevo request en cada reintento */}
      <img
        key={retryCount}
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
