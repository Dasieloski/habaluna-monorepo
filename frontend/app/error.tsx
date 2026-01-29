'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { RefreshCw, Home, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

/**
 * Página de Error Global (500 / Runtime Error)
 * Rediseño Premium - Transmite tranquilidad y control
 * Usa el patrón oficial de Next.js App Router
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Log del error para debugging (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.error('Error capturado:', error);
    }
    
    // Aquí podrías enviar el error a un servicio de monitoreo
    // logErrorToService(error);
  }, [error]);

  // Animación de entrada controlada y sobria
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  // Background animado lento y sutil
  const backgroundVariants = prefersReducedMotion
    ? {}
    : {
        backgroundPosition: ['0% 50%', '100% 50%'],
        transition: {
          duration: 25,
          repeat: Infinity,
          repeatType: 'reverse' as const,
          ease: 'linear',
        },
      };

  // Icono con pulso muy sutil
  const iconPulse = prefersReducedMotion
    ? {}
    : {
        scale: [1, 1.02, 1],
        opacity: [1, 0.95, 1],
        transition: {
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };

  // Hover effects para botones
  const buttonHover = {
    scale: 1.03,
    transition: { duration: 0.2, ease: 'easeOut' },
  };

  const buttonTap = {
    scale: 0.98,
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background con gradiente animado muy sutil */}
      <motion.div
        className="absolute inset-0 opacity-20 dark:opacity-10"
        style={{
          background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(77, 105, 165, 0.05) 50%, rgba(91, 168, 166, 0.05) 100%)',
          backgroundSize: '200% 200%',
        }}
        animate={backgroundVariants}
      />

      {/* Contenido principal */}
      <motion.div
        className="relative z-10 w-full max-w-xl text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Icono central con animación sutil */}
        <motion.div
          className="flex justify-center mb-6"
          animate={iconPulse}
          aria-hidden="true"
        >
          <div className="relative">
            <motion.div
              className="w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-destructive/20 bg-destructive/5 flex items-center justify-center backdrop-blur-sm"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <AlertCircle className="w-12 h-12 md:w-14 md:h-14 text-destructive/70" strokeWidth={1.5} />
            </motion.div>
          </div>
        </motion.div>

        {/* Título */}
        <motion.h1
          className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4"
          variants={itemVariants}
        >
          Algo salió mal
        </motion.h1>

        {/* Mensaje humano y tranquilizador */}
        <motion.p
          className="text-lg md:text-xl text-muted-foreground mb-2 max-w-md mx-auto"
          variants={itemVariants}
        >
          No te preocupes, es solo un momento.
        </motion.p>

        <motion.p
          className="text-sm md:text-base text-muted-foreground/80 mb-10 max-w-lg mx-auto"
          variants={itemVariants}
        >
          Hemos detectado un error temporal. Intenta de nuevo en unos segundos.
        </motion.p>

        {/* Botones de acción */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          variants={itemVariants}
        >
          <motion.div whileHover={buttonHover} whileTap={buttonTap}>
            <Button
              onClick={reset}
              variant="cta"
              size="lg"
              className="w-full sm:w-auto min-w-[200px]"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Intentar de nuevo
            </Button>
          </motion.div>

          <motion.div whileHover={buttonHover} whileTap={buttonTap}>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto min-w-[200px]"
            >
              <Link href="/" className="flex items-center justify-center gap-2">
                <Home className="w-5 h-5" />
                Volver al inicio
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Información técnica solo en desarrollo */}
        {process.env.NODE_ENV === 'development' && error && (
          <motion.div
            className="mt-8 p-4 bg-muted/50 rounded-lg text-left max-w-full overflow-auto"
            variants={itemVariants}
          >
            <p className="text-xs font-mono text-destructive mb-2">
              {error.name}: {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
