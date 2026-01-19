'use client'

import React, { createContext, useCallback, useContext, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useCartStore } from '@/lib/store/cart-store'
import {
  FREE_SHIPPING_ITEMS_THRESHOLD,
  SIMPLE_TOAST_DURATION_MS,
  TOAST_SHOW_DURATION_MS,
} from '@/lib/contextual-toast-config'
import { getCartIconRect, type Rect } from '@/lib/contextual-toast-utils'
import { ContextualToast } from './contextual-toast'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type AddToCartPhase = 'appearing' | 'showing' | 'integrating'

export interface AddToCartState {
  type: 'add-to-cart'
  triggerRect: Rect
  productName: string
  phase: AddToCartPhase
  /** En fase integrating: rect del ícono del carrito (se obtiene al transicionar). */
  cartRect?: Rect | null
}

export interface SimpleToastState {
  type: 'simple'
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'info' | 'warning'
}

export type ContextualToastState = AddToCartState | SimpleToastState | null

export interface ContextualToastContextValue {
  state: ContextualToastState
  /** Muestra el toast contextual de "añadido al carrito" desde el rect del trigger. Reutiliza el toast si ya está visible. */
  showAddToCart: (opts: { productName: string; triggerRect: Rect }) => void
  /** Toast simple (éxito, error, info). Compatible con la API anterior. */
  toast: (opts: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void
  showSuccess: (title: string, description?: string) => void
  showError: (title: string, description?: string) => void
  showInfo: (title: string, description?: string) => void
  showWarning: (title: string, description?: string) => void
}

const Context = createContext<ContextualToastContextValue | null>(null)

let simpleId = 0
function genSimpleId() {
  simpleId = (simpleId + 1) % Number.MAX_SAFE_INTEGER
  return `simple-${simpleId}`
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ContextualToastProvider({ children }: { children: React.ReactNode }) {
  const getItemCount = useCartStore((s) => s.getItemCount)
  const [state, setState] = useState<ContextualToastState>(null)

  const showingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const simpleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didReuseAddToCartRef = useRef(false)

  const clearShowingTimeout = useCallback(() => {
    if (showingTimeoutRef.current) {
      clearTimeout(showingTimeoutRef.current)
      showingTimeoutRef.current = null
    }
  }, [])

  const clearSimpleTimeout = useCallback(() => {
    if (simpleTimeoutRef.current) {
      clearTimeout(simpleTimeoutRef.current)
      simpleTimeoutRef.current = null
    }
  }, [])

  const showAddToCart = useCallback(
    ({ productName, triggerRect }: { productName: string; triggerRect: Rect }) => {
      didReuseAddToCartRef.current = false
      setState((prev) => {
        if (prev?.type === 'add-to-cart' && (prev.phase === 'appearing' || prev.phase === 'showing')) {
          didReuseAddToCartRef.current = true
          clearShowingTimeout()
          showingTimeoutRef.current = setTimeout(() => {
            showingTimeoutRef.current = null
            const cart = getCartIconRect()
            setState((s) => (s && s.type === 'add-to-cart' ? { ...s, phase: 'integrating' as const, cartRect: cart ?? null } : s))
          }, TOAST_SHOW_DURATION_MS)
          return { ...prev, productName }
        }
        return { type: 'add-to-cart' as const, triggerRect, productName, phase: 'appearing' as const }
      })

      if (didReuseAddToCartRef.current) return
      setTimeout(() => {
        setState((s) => {
          if (s && s.type === 'add-to-cart' && s.phase === 'appearing') {
            showingTimeoutRef.current = setTimeout(() => {
              showingTimeoutRef.current = null
              const cart = getCartIconRect()
              setState((s2) => (s2 && s2.type === 'add-to-cart' ? { ...s2, phase: 'integrating' as const, cartRect: cart ?? null } : s2))
            }, TOAST_SHOW_DURATION_MS)
            return { ...s, phase: 'showing' as const }
          }
          return s
        })
      }, 400)
    },
    [clearShowingTimeout],
  )

  const onIntegrateComplete = useCallback(() => {
    clearShowingTimeout()
    setState(null)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('contextual-toast-cart-bounce'))
    }
  }, [clearShowingTimeout])

  const toast = useCallback(
    (opts: { title: string; description?: string; variant?: 'default' | 'destructive' }) => {
      clearSimpleTimeout()
      const id = genSimpleId()
      setState({ type: 'simple', id, title: opts.title, description: opts.description, variant: opts.variant ?? 'default' })
      simpleTimeoutRef.current = setTimeout(() => {
        simpleTimeoutRef.current = null
        setState((s) => (s && s.type === 'simple' && s.id === id ? null : s))
      }, SIMPLE_TOAST_DURATION_MS)
    },
    [clearSimpleTimeout],
  )

  const showSuccess = useCallback((title: string, description?: string) => toast({ title, description, variant: 'default' }), [toast])
  const showError = useCallback((title: string, description?: string) => toast({ title, description, variant: 'destructive' }), [toast])
  const showInfo = useCallback((title: string, description?: string) => toast({ title, description, variant: 'default' }), [toast])
  const showWarning = useCallback((title: string, description?: string) => toast({ title, description, variant: 'default' }), [toast])

  const value: ContextualToastContextValue = {
    state,
    showAddToCart,
    toast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  }

  const count = getItemCount()
  const progress = Math.min(count / FREE_SHIPPING_ITEMS_THRESHOLD, 1)
  const milestoneReached = count >= FREE_SHIPPING_ITEMS_THRESHOLD

  const portal =
    state && typeof document !== 'undefined' ? (
      createPortal(
        <ContextualToast
          state={state}
          progress={state.type === 'add-to-cart' ? progress : 0}
          milestoneReached={state.type === 'add-to-cart' ? milestoneReached : false}
          onIntegrateComplete={state.type === 'add-to-cart' ? onIntegrateComplete : undefined}
        />,
        document.body,
      )
    ) : null

  return (
    <Context.Provider value={value}>
      {children}
      {portal}
    </Context.Provider>
  )
}

export function useContextualToast(): ContextualToastContextValue {
  const ctx = useContext(Context)
  if (!ctx) throw new Error('useContextualToast must be used within ContextualToastProvider')
  return ctx
}
