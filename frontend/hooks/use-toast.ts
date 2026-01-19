/**
 * Re-export del sistema Contextual Toast.
 * useToast mantiene compatibilidad con la API anterior (toast, showSuccess, showError, etc.)
 * y añade showAddToCart para el flujo de añadir al carrito.
 */
export { useContextualToast as useToast, useContextualToast } from '@/components/contextual-toast'
