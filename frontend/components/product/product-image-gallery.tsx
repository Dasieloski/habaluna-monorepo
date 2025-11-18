'use client';

import { useState } from 'react';
import { getImageUrl } from '@/lib/image-utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-gray-400">Sin imagen</div>
      </div>
    );
  }

  const validImages = images
    .map((img) => getImageUrl(img))
    .filter((img): img is string => img !== null);

  if (validImages.length === 0) {
    return (
      <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-gray-400">Sin imagen</div>
      </div>
    );
  }

  const currentImage = validImages[selectedIndex];

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Imagen principal */}
      <div className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center group">
        {currentImage ? (
          <img
            src={currentImage}
            alt={`${productName} - Imagen ${selectedIndex + 1}`}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-gray-400">Sin imagen</div>
        )}

        {/* Navegación si hay más de una imagen */}
        {validImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={goToNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            {/* Indicador de imagen actual */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              {selectedIndex + 1} / {validImages.length}
            </div>
          </>
        )}
      </div>

      {/* Miniaturas */}
      {validImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {validImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                selectedIndex === index
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'border-gray-200 hover:border-primary/50'
              }`}
            >
              <img
                src={image}
                alt={`${productName} - Miniatura ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

