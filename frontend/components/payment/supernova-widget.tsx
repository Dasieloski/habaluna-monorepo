'use client';

import { useEffect, useRef, useState } from 'react';

interface SupernovaWidgetProps {
  amount: string;
  currency?: string;
  orderId: string;
  description?: string;
  customerEmail?: string;
  onSuccess: (data: { transactionId: string; amount: string; currency: string }) => void;
  onError: (error: { error: string }) => void;
}

export function SupernovaWidget({
  amount,
  currency = 'USD',
  orderId,
  description,
  customerEmail,
  onSuccess,
  onError,
}: SupernovaWidgetProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Escuchar mensajes del iframe
    const handleMessage = (event: MessageEvent) => {
      // Verificar origen por seguridad
      if (event.origin !== 'https://pay.supernova-payments.com') {
        return;
      }

      const data = event.data;

      // Manejar eventos del widget
      if (data.type === 'supernova:success') {
        onSuccess({
          transactionId: data.transactionId || data.transaction_id || '',
          amount: data.amount || amount,
          currency: data.currency || currency,
        });
      } else if (data.type === 'supernova:error') {
        setError(data.error || 'Error en el pago');
        onError({ error: data.error || 'Error en el pago' });
      } else if (data.type === 'supernova:load') {
        setIsLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);

    // Timeout para detectar si el iframe no carga
    const timeout = setTimeout(() => {
      setIsLoading((prev) => {
        if (prev) {
          setError('El widget de pago tardó demasiado en cargar. Por favor, intenta de nuevo.');
          return false;
        }
        return prev;
      });
    }, 10000); // 10 segundos

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeout);
    };
  }, [amount, currency, orderId, description, customerEmail, onSuccess, onError]);

  // Construir URL del widget
  const params = new URLSearchParams();
  params.append('amount', amount);
  params.append('currency', currency);
  params.append('order_id', orderId);
  if (description) params.append('description', description);
  if (customerEmail) params.append('customer_email', customerEmail);
  
  // Deshabilitar tarjeta clásica
  params.append('enable_classic_card', 'false');

  const widgetUrl = `https://pay.supernova-payments.com/widget/payment?${params.toString()}`;

  return (
    <div className="w-full">
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-4 text-gray-600">Cargando pasarela de pago...</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              if (iframeRef.current) {
                iframeRef.current.src = widgetUrl;
              }
            }}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Reintentar
          </button>
        </div>
      )}
      <div className="w-full flex justify-center">
        <iframe
          ref={iframeRef}
          src={widgetUrl}
          width="100%"
          height="600"
          frameBorder="0"
          className="rounded-lg shadow-lg max-w-[480px]"
          style={{ minHeight: '600px' }}
          onLoad={() => {
            setIsLoading(false);
          }}
          onError={() => {
            setError('Error al cargar el widget de pago. Por favor, verifica tu conexión.');
            setIsLoading(false);
          }}
        />
      </div>
    </div>
  );
}

