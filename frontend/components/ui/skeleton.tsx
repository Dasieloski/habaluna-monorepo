'use client';

import { cn } from '@/lib/utils';
import * as React from 'react';

interface SkeletonProps extends React.ComponentProps<'div'> {
  /**
   * Si es true, activa animación de pulso en el skeleton.
   * Por defecto: true (feedback visual durante carga).
   * Para desactivar: <Skeleton enableShimmer={false} />
   */
  enableShimmer?: boolean;
}

/**
 * Skeleton component con animación shimmer profesional
 * 
 * Microinteracciones incluidas:
 * - Shimmer animation: efecto de brillo deslizante
 * - Pulse animation: pulso sutil de opacidad
 * 
 * Uso:
 * <Skeleton className="h-4 w-full" />
 * <Skeleton className="h-32 w-32 rounded-full" />
 * 
 * Para desactivar shimmer: <Skeleton enableShimmer={false} />
 */
function Skeleton({ className, enableShimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'rounded-md bg-muted/60',
        enableShimmer && 'animate-pulse',
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
