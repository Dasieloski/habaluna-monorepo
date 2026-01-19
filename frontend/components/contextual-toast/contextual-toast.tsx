'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { SPRING, SPRING_SMOOTH } from '@/lib/contextual-toast-config'
import { FREE_SHIPPING_ITEMS_THRESHOLD } from '@/lib/contextual-toast-config'
import type { ContextualToastState } from './contextual-toast-provider'
import { useCartStore } from '@/lib/store/cart-store'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface ContextualToastProps {
  state: ContextualToastState
  progress: number
  milestoneReached: boolean
  onIntegrateComplete?: () => void
}

// ---------------------------------------------------------------------------
// Add-to-cart: posición final en "showing" (centrado abajo)
// ---------------------------------------------------------------------------

function getShowingPosition() {
  if (typeof window === 'undefined') return { x: 0, y: 0 }
  return { x: window.innerWidth / 2, y: window.innerHeight - 100 }
}

// ---------------------------------------------------------------------------
// ContextualToast
// ---------------------------------------------------------------------------

export function ContextualToast({ state, progress, milestoneReached, onIntegrateComplete }: ContextualToastProps) {
  const getItemCount = useCartStore((s) => s.getItemCount)
  const [milestoneJustReached, setMilestoneJustReached] = useState(false)

  const count = getItemCount()
  const progressText =
    milestoneReached
      ? '🎉 Envío gratis desbloqueado'
      : `${count} de ${FREE_SHIPPING_ITEMS_THRESHOLD} para envío gratis`

  // Efecto: milestone recién alcanzado → glow + micro-vibración
  useEffect(() => {
    if (milestoneReached && state?.type === 'add-to-cart') {
      setMilestoneJustReached(true)
      const t = setTimeout(() => setMilestoneJustReached(false), 600)
      return () => clearTimeout(t)
    }
  }, [milestoneReached, state?.type])

  if (!state) return null

  if (state.type === 'simple') {
    return (
      <SimpleToast
        title={state.title}
        description={state.description}
        variant={state.variant ?? 'default'}
      />
    )
  }

  // Add-to-cart
  const { triggerRect, productName, phase } = state
  const showing = getShowingPosition()
  const fromX = triggerRect.cx
  const fromY = triggerRect.cy

  const cartRect = state.type === 'add-to-cart' ? state.cartRect : null
  const toX = phase === 'integrating' && cartRect ? cartRect.cx : phase === 'appearing' ? fromX : showing.x
  const toY = phase === 'integrating' && cartRect ? cartRect.cy : phase === 'appearing' ? fromY : showing.y

  return (
    <motion.div
      role="status"
      aria-live="polite"
      className="fixed left-0 top-0 z-[9999]"
      initial={{ x: fromX, y: fromY, scale: 0.6, opacity: 0 }}
      animate={{
        x: toX,
        y: toY,
        scale: phase === 'integrating' ? 0 : 1,
        opacity: phase === 'integrating' ? 0.6 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: phase === 'integrating' ? 320 : SPRING.stiffness,
        damping: phase === 'integrating' ? 26 : SPRING.damping,
        mass: SPRING.mass,
      }}
      onAnimationComplete={() => {
        if (phase === 'integrating') onIntegrateComplete?.()
      }}
    >
      <div className="-translate-x-1/2 -translate-y-1/2">
        <motion.div
          className={`rounded-2xl border bg-white px-4 py-3 shadow-xl ${
            milestoneJustReached ? 'ring-2 ring-emerald-400 ring-offset-2' : 'border-sky-100'
          }`}
          style={{ minWidth: 280, maxWidth: 360 }}
        >
        {/* Ícono de éxito + texto */}
        <div className="flex items-center gap-3">
          <motion.span
            initial={false}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ type: 'spring', ...SPRING, delay: 0.1 }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"
          >
            <Check className="h-4 w-4" strokeWidth={2.5} />
          </motion.span>
          <p className="truncate text-sm font-medium text-foreground" title={productName}>
            {productName} añadido
          </p>
        </div>

        {/* Barra de progreso + texto */}
        <div className="mt-2.5">
          <motion.div
            className="h-1.5 w-full overflow-hidden rounded-full bg-sky-100"
            initial={false}
          >
            <motion.div
              className="h-full rounded-full bg-sky-500"
              initial={false}
              animate={{ width: `${progress * 100}%` }}
              transition={{ type: 'spring', ...SPRING }}
            />
          </motion.div>
          <p
            className={`mt-1.5 text-xs ${milestoneReached ? 'font-semibold text-emerald-600' : 'text-muted-foreground'}`}
          >
            {progressText}
          </p>
        </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Simple toast (éxito, error, info)
// ---------------------------------------------------------------------------

function SimpleToast({
  title,
  description,
  variant = 'default',
}: {
  title: string
  description?: string
  variant?: string
}) {
  const isError = variant === 'destructive'

  return (
    <motion.div
      role="status"
      aria-live={isError ? 'assertive' : 'polite'}
      className="fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ type: 'spring', ...SPRING_SMOOTH }}
    >
      <motion.div
        className={`rounded-xl border px-4 py-3 shadow-lg ${
          isError
            ? 'border-red-200 bg-red-50 text-red-900'
            : 'border-sky-200 bg-white text-foreground'
        }`}
        animate={isError ? { x: [0, -6, 6, -4, 4, 0] } : {}}
        transition={isError ? { duration: 0.4 } : {}}
      >
        <p className="font-medium">{title}</p>
        {description && <p className="mt-0.5 text-sm opacity-90">{description}</p>}
      </motion.div>
    </motion.div>
  )
}
