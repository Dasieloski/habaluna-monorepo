'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
        variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
        cta: 'bg-accent text-accent-foreground hover:bg-accent/90 active:bg-accent/80 shadow-md hover:shadow-lg',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

interface ButtonProps extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /**
   * Si es false, desactiva las animaciones de microinteracción
   * Por defecto: true
   */
  enableAnimations?: boolean;
  /**
   * Muestra spinner y deshabilita el botón. No se aplica cuando asChild.
   */
  loading?: boolean;
  /** Texto junto al spinner cuando loading (ej. "Añadiendo…"). Si no se pasa, solo se muestra el spinner. */
  loadingText?: string;
}

/**
 * Button component con microinteracciones profesionales
 * 
 * Microinteracciones incluidas:
 * - Hover: ligero scale (1.02) y transición suave
 * - Click: scale down (0.98) para feedback táctil
 * - Active: opacidad reducida momentáneamente
 * 
 * Para desactivar animaciones: <Button enableAnimations={false} />
 */
function Button({
  className,
  variant,
  size,
  asChild = false,
  enableAnimations = true,
  loading = false,
  loadingText,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const isDisabled = disabled || loading;
  const content = loading
    ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {loadingText != null ? <span>{loadingText}</span> : null}
        </>
      )
    : children;

  // asChild: Slot no soporta loading; pasamos children tal cual
  if (asChild) {
    return (
      <Slot
        data-slot="button"
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  // Sin animaciones o movimiento reducido: button estático
  if (!enableAnimations || prefersReducedMotion) {
    return (
      <button
        data-slot="button"
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={isDisabled}
        {...props}
      >
        {content}
      </button>
    );
  }

  // Con animaciones: motion.button (hover/tap); no aplicar cuando loading
  const buttonMotionProps: HTMLMotionProps<'button'> = loading
    ? {}
    : { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, transition: { duration: 0.15, ease: 'easeOut' } };

  return (
    <motion.button
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={isDisabled}
      {...buttonMotionProps}
      {...(props as any)}
    >
      {content}
    </motion.button>
  );
}

export { Button, buttonVariants };
