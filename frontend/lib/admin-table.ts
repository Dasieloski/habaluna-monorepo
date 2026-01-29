/**
 * Constantes y utilidades compartidas para tablas del panel admin.
 * Paginación: solo afecta la visualización; la exportación usa siempre el conjunto filtrado completo.
 */

/** Número de registros por página en tablas admin (solo visualización) */
export const ADMIN_TABLE_PAGE_SIZE = 25

/** Opciones de tamaño de página para el selector */
export const ADMIN_PAGE_SIZE_OPTIONS = [25, 50, 100] as const

export function getPaginatedSlice<T>(
  data: T[],
  page: number,
  pageSize: number
): T[] {
  const start = page * pageSize
  return data.slice(start, start + pageSize)
}

export function getTotalPages(totalItems: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalItems / pageSize))
}
