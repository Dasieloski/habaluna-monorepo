import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Media } from '@prisma/client';

interface OptimizeOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'original';
}

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  getById(id: string) {
    return this.prisma.media.findUnique({
      where: { id },
    });
  }

  async optimizeImage(media: Media, options: OptimizeOptions): Promise<Media | null> {
    // Solo optimizar imágenes (no PDFs, videos, etc)
    if (!media.mimeType?.startsWith('image/')) {
      return null;
    }

    // Si no hay sharp instalado, retornar null (servir original)
    let sharp: any;
    try {
      sharp = require('sharp');
    } catch {
      // Sharp no está instalado, servir imagen original
      return null;
    }

    try {
      const image = sharp(media.data);
      const metadata = await image.metadata();

      // Determinar formato de salida
      let outputFormat: 'webp' | 'avif' | 'jpeg' | 'png' = 'webp';
      let outputMimeType = 'image/webp';

      if (options.format === 'avif') {
        outputFormat = 'avif';
        outputMimeType = 'image/avif';
      } else if (options.format === 'original') {
        outputFormat = metadata.format as 'jpeg' | 'png';
        outputMimeType = media.mimeType;
      }

      // Calidad (1-100)
      const quality = Math.min(100, Math.max(1, options.quality || 80));

      // Resize si se especifica
      if (options.width || options.height) {
        image.resize(options.width, options.height, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Convertir formato y comprimir
      let buffer: Buffer;
      if (outputFormat === 'webp') {
        buffer = await image.webp({ quality }).toBuffer();
      } else if (outputFormat === 'avif') {
        buffer = await image.avif({ quality }).toBuffer();
      } else if (outputFormat === 'jpeg') {
        buffer = await image.jpeg({ quality, mozjpeg: true }).toBuffer();
      } else {
        buffer = await image.png({ quality, compressionLevel: 9 }).toBuffer();
      }

      return {
        ...media,
        data: buffer,
        sizeBytes: buffer.length,
        mimeType: outputMimeType,
      };
    } catch (error) {
      console.error('[MediaService] Error optimizando imagen:', error);
      return null;
    }
  }
}

