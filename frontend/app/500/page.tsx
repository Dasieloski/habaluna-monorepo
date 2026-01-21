'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

/** Parpadeo inicial: simula que se fue la luz (un solo ciclo) */
const blinkAnimate = { opacity: [0, 0.15, 1, 0.5, 1], scale: [0.98, 1, 1, 1, 1] };
const blinkTransition = { duration: 0.85, ease: 'easeOut' };

/** Entrada simple sin parpadeo (reduced-motion) */
const simpleIn = { opacity: 1, scale: 1 };
const simpleInTransition = { duration: 0.4, ease: 'easeOut' };

/** Pulso sutil en el icono (después del parpadeo) */
const pulseAnimate = { opacity: [1, 0.78, 1], scale: [1, 0.99, 1] };
const pulseTransition = { duration: 2.5, ease: 'easeInOut', repeat: Infinity };

/**
 * Página Error 500 — "Ups… se fue la corriente 🔌"
 * Ruta /500: error del servidor / apagón.
 * Parpadeo al cargar y pulso leve en el icono (respeta prefers-reduced-motion).
 */
export default function Error500Page() {
  const prefersReducedMotion = useReducedMotion();
  const [blinkDone, setBlinkDone] = useState(false);

  const usePulse = !prefersReducedMotion && blinkDone;
  const useBlink = !prefersReducedMotion && !blinkDone;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-background"
      role="main"
      aria-labelledby="error-500-title"
    >
      <Card className="w-full max-w-md text-center" enableAnimations={false}>
        <CardHeader className="pb-2">
          <div className="flex justify-center mb-4" aria-hidden>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={useBlink ? blinkAnimate : usePulse ? pulseAnimate : simpleIn}
              transition={
                useBlink
                  ? blinkTransition
                  : usePulse
                    ? pulseTransition
                    : simpleInTransition
              }
              onAnimationComplete={
                useBlink ? () => setBlinkDone(true) : undefined
              }
              className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-border bg-muted"
            >
              <Lightbulb
                className="h-8 w-8 text-accent"
                strokeWidth={1.5}
                aria-hidden
              />
            </motion.div>
          </div>
          <CardTitle id="error-500-title" className="text-2xl font-heading">
            Ups… se nos fue la corriente un momentico 😅
          </CardTitle>
          <CardDescription className="text-base">
            Estamos volviendo ahora mismo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Ha ocurrido un error en el servidor. Intenta de nuevo en unos segundos.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row justify-center">
          <Button
            variant="cta"
            className="w-full sm:w-auto"
            onClick={() => window.location.reload()}
          >
            Reintentar
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
