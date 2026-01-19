'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { getImageUrl } from '@/lib/image-utils'

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
  const imgSrc = useMemo(
    () => getImageUrl(src?.trim(), { width, height }),
    [src, width, height]
  )
  const [hasError, setHasError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    setHasError(false)
    setRetryCount(0)
  }, [src])

  const handleError = useCallback(() => {
    if (retryCount < 2) {
      setRetryCount((r) => r + 1)
    } else {
      setHasError(true)
      onError?.()
    }
  }, [onError, retryCount])

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

  return <Image key={retryCount} {...imageProps} unoptimized={shouldUnoptimize} />
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
  const imgSrc = useMemo(() => getImageUrl(src?.trim()), [src])
  const [hasError, setHasError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    setHasError(false)
    setRetryCount(0)
  }, [src])

  const handleError = useCallback(() => {
    if (retryCount < 2) {
      setRetryCount((r) => r + 1)
    } else {
      setHasError(true)
      onError?.()
    }
  }, [onError, retryCount])

  if (!imgSrc || hasError) {
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
      key={retryCount}
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
