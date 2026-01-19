import { CART_ICON_SELECTOR } from './contextual-toast-config'

export interface Rect {
  left: number
  top: number
  width: number
  height: number
  /** Centro X */
  cx: number
  /** Centro Y */
  cy: number
}

/**
 * Obtiene el rect de un elemento (trigger del toast, ej. botón "Añadir").
 */
export function getTriggerRect(el: HTMLElement | null | undefined): Rect | null {
  if (!el || typeof el.getBoundingClientRect !== 'function') return null
  const r = el.getBoundingClientRect()
  return {
    left: r.left,
    top: r.top,
    width: r.width,
    height: r.height,
    cx: r.left + r.width / 2,
    cy: r.top + r.height / 2,
  }
}

/**
 * Obtiene el rect del ícono del carrito en el header.
 * Debe existir un elemento con data-contextual-toast-cart.
 */
export function getCartIconRect(): Rect | null {
  if (typeof document === 'undefined') return null
  const el = document.querySelector(CART_ICON_SELECTOR) as HTMLElement | null
  if (!el) return null
  const r = el.getBoundingClientRect()
  return {
    left: r.left,
    top: r.top,
    width: r.width,
    height: r.height,
    cx: r.left + r.width / 2,
    cy: r.top + r.height / 2,
  }
}
