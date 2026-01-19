'use client';

import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook para manejar errores de forma consistente en la aplicación.
 * Muestra notificaciones amigables al usuario (Contextual Toast).
 */
export function useErrorHandler() {
  const { showError } = useToast();

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    let message = customMessage || 'Algo se torció. Intenta de nuevo 😅';
    let title = 'Ups… algo falló';

    if (error instanceof Error) {
      if ('status' in error) {
        const apiError = error as { status?: number; message?: string };

        switch (apiError.status) {
          case 401:
            message = 'Tu sesión caducó. Vuelve a iniciar sesión.';
            title = '¡Oye! Tu sesión se fue 😅';
            if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
              window.location.href = '/admin/login';
            }
            break;
          case 403:
            message = 'No tienes permiso para esto.';
            title = 'Eso no está en tus manos 👀';
            break;
          case 404:
            message = 'Eso que buscas no está por aquí.';
            title = 'No lo encontramos 😅';
            break;
          case 429:
            message = 'Demasiadas peticiones. Espera un ratito.';
            title = '¡Tranquilo! Un momento 👋';
            break;
          case 500:
            message = 'Nuestro servidor se despistó. Intenta más tarde.';
            title = 'Ups… fallo nuestro 😅';
            break;
          default:
            message = apiError.message || message;
        }
      } else {
        message = error.message || message;
      }
    } else if (typeof error === 'string') {
      message = error;
    }

    showError(title, message);

    if (process.env.NODE_ENV === 'development') {
      console.error('Error manejado:', error);
    }

    return message;
  }, [showError]);

  return { handleError };
}
