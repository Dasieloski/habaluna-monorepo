'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Home, ShoppingBag, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

/**
 * Página 404 — Rediseño Premium
 * Experiencia visual memorable con animaciones suaves y profesionales
 */
export default function NotFound() {
  const prefersReducedMotion = useReducedMotion();

  // Animación de entrada principal
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.15,
      },
    },
  };

  // Elementos hijos con entrada escalonada
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  // Floating animation continua para el elemento central
  const floatingAnimation = prefersReducedMotion
    ? {}
    : {
        y: [0, -12, 0],
        transition: {
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      };

  // Background gradient animado
  const backgroundVariants = prefersReducedMotion
    ? {}
    : {
        backgroundPosition: ['0% 0%', '100% 100%'],
        transition: {
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse' as const,
          ease: 'linear',
        },
      };

  // Hover effects para CTAs
  const buttonHover = {
    scale: 1.05,
    transition: { duration: 0.2, ease: 'easeOut' },
  };

  const buttonTap = {
    scale: 0.97,
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background animado con gradiente sutil */}
      <motion.div
        className="absolute inset-0 opacity-30 dark:opacity-20"
        style={{
          background: 'linear-gradient(135deg, rgba(77, 105, 165, 0.1) 0%, rgba(91, 168, 166, 0.1) 50%, rgba(236, 211, 134, 0.1) 100%)',
          backgroundSize: '200% 200%',
        }}
        animate={backgroundVariants}
      />

      {/* Contenido principal */}
      <motion.div
        className="relative z-10 w-full max-w-2xl text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Elemento central con floating animation */}
        <motion.div
          className="flex justify-center mb-8"
          animate={floatingAnimation}
          aria-hidden="true"
        >
          <div className="relative">
            {/* Círculo decorativo con sparkles */}
            <motion.div
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center backdrop-blur-sm"
              whileHover={prefersReducedMotion ? {} : { scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <Sparkles className="w-16 h-16 md:w-20 md:h-20 text-primary/60" strokeWidth={1.5} />
            </motion.div>
            
            {/* Partículas decorativas sutiles */}
            {!prefersReducedMotion && (
              <>
                <motion.div
                  className="absolute -top-4 -left-4 w-3 h-3 rounded-full bg-accent/40"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.4, 0.8, 0.4],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <motion.div
                  className="absolute -bottom-4 -right-4 w-2 h-2 rounded-full bg-primary/40"
                  animate={{
                    scale: [1, 1.8, 1],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.5,
                  }}
                />
              </>
            )}
          </div>
        </motion.div>

        {/* Título principal */}
        <motion.h1
          className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-4"
          variants={itemVariants}
        >
          Esta página se fue de paseo
        </motion.h1>

        {/* Descripción */}
        <motion.p
          className="text-lg md:text-xl text-muted-foreground mb-2 max-w-md mx-auto"
          variants={itemVariants}
        >
          Pero no te preocupes, tenemos muchos productos esperando por ti.
        </motion.p>

        <motion.p
          className="text-sm md:text-base text-muted-foreground/80 mb-12 max-w-lg mx-auto"
          variants={itemVariants}
        >
          La página que buscas no existe o fue movida a otro lugar.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          variants={itemVariants}
        >
          <motion.div whileHover={buttonHover} whileTap={buttonTap}>
            <Button asChild variant="cta" size="lg" className="w-full sm:w-auto min-w-[200px]">
              <Link href="/products" className="flex items-center justify-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Ver productos disponibles
              </Link>
            </Button>
          </motion.div>

          <motion.div whileHover={buttonHover} whileTap={buttonTap}>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto min-w-[200px]">
              <Link href="/" className="flex items-center justify-center gap-2">
                <Home className="w-5 h-5" />
                Volver al inicio
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Número 404 decorativo (opcional, sutil) */}
        {!prefersReducedMotion && (
          <motion.div
            className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.03, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <span className="text-[200px] md:text-[300px] font-heading font-bold text-foreground select-none">
              404
            </span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
