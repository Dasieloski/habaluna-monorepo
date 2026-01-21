'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

/** Entrada: desplazamiento, rotación y fade */
const boxInitial = { x: -12, rotate: -2, opacity: 0.6 };
const boxEntrance = { x: 0, rotate: 0, opacity: 1 };
const boxEntranceTransition = { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] as const };

/** Idle: pequeño desplazamiento lateral, leve rotación, fade muy ligero */
const boxIdleAnimate = { x: [0, 8, 0] as const, rotate: [0, 1.5, 0] as const, opacity: [1, 0.92, 1] as const };
const boxIdleTransition = { duration: 4, ease: 'easeInOut' as const, repeat: Infinity };

/**
 * Página 404 — "El producto se fue del almacén"
 * Se muestra cuando Next.js no encuentra una ruta.
 * Caja/estante vacío con animación sutil (respeta prefers-reduced-motion).
 */
export default function NotFound() {
  const prefersReducedMotion = useReducedMotion();
  const [idleStarted, setIdleStarted] = useState(false);

  // Fase 1: entrada. Fase 2: idle en bucle (solo si !prefersReducedMotion)
  const useIdle = !prefersReducedMotion && idleStarted;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-background"
      role="main"
      aria-labelledby="not-found-title"
    >
      <Card className="w-full max-w-md text-center" enableAnimations={false}>
        <CardHeader className="pb-2">
          <div className="flex justify-center mb-4" aria-hidden>
            <motion.div
              initial={boxInitial}
              animate={useIdle ? boxIdleAnimate : boxEntrance}
              transition={useIdle ? boxIdleTransition : boxEntranceTransition}
              onAnimationComplete={
                !prefersReducedMotion && !idleStarted
                  ? () => setIdleStarted(true)
                  : undefined
              }
              className="inline-flex items-center justify-center w-20 h-20 rounded-lg border-2 border-border bg-card"
            >
              <Package
                className="h-10 w-10 text-muted-foreground"
                strokeWidth={1.5}
                aria-hidden
              />
            </motion.div>
          </div>
          <CardTitle id="not-found-title" className="text-2xl font-heading">
            Este producto salió del almacén…
          </CardTitle>
          <CardDescription className="text-base">
            pero tenemos muchos esperando por ti.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            La página que buscas no existe o fue movida.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row justify-center">
          <Button asChild variant="cta" className="w-full sm:w-auto">
            <Link href="/products">
              Ver productos disponibles
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" aria-hidden />
              Volver al inicio
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
