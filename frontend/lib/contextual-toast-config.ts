/**
 * Configuración del sistema Contextual Toast.
 * Los mensajes de transporte (con/sin descuento) se obtienen del backend /transport.
 */

/** Mensaje por defecto cuando no hay descuento y la config aún no cargó. */
export const DEFAULT_POSITIVE_TRANSPORT_MESSAGE = '🚚 Transporte calculado al costo justo'

/** Selector del ícono del carrito en el header (debe tener data-contextual-toast-cart). */
export const CART_ICON_SELECTOR = '[data-contextual-toast-cart]'

/** Física spring: stiffness 260–320, damping 18–26, mass 0.8–1.1 */
export const SPRING = { stiffness: 280, damping: 22, mass: 0.9 } as const

/** Spring más suave para aparición/desaparición. */
export const SPRING_SMOOTH = { stiffness: 200, damping: 24, mass: 0.8 } as const

/** Duración en "showing" antes de integrar con el carrito (ms). */
export const TOAST_SHOW_DURATION_MS = 2500

/** Duración de toasts simples (éxito, info, etc.) antes de cerrar. */
export const SIMPLE_TOAST_DURATION_MS = 3000
