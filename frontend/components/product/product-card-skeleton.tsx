'use client';

import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton loader para ProductCard (alineado al diseño premium actual).
 * Usado en: Grid de productos y carruseles mientras carga.
 */
export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl md:rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
      <div className="aspect-square relative overflow-hidden bg-muted rounded-t-xl md:rounded-t-2xl">
        <div className="absolute inset-2 md:inset-3 rounded-lg md:rounded-xl bg-card overflow-hidden">
          <Skeleton className="w-full h-full rounded-lg md:rounded-xl" />
        </div>
      </div>
      <div className="p-3 md:p-4 flex flex-col gap-2 md:gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="mt-auto flex items-end justify-between gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
