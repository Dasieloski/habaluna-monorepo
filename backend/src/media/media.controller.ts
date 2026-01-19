import { Controller, Get, NotFoundException, Param, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { MediaService } from './media.service';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get media binary by id (public)' })
  @ApiQuery({ name: 'w', required: false, description: 'Width in pixels' })
  @ApiQuery({ name: 'h', required: false, description: 'Height in pixels' })
  @ApiQuery({ name: 'q', required: false, description: 'Quality 1-100 (default: 80)' })
  @ApiQuery({
    name: 'format',
    required: false,
    description: 'Image format: webp, avif, or original',
  })
  async getById(
    @Param('id') id: string,
    @Res() res: Response,
    @Query('w') width?: string,
    @Query('h') height?: string,
    @Query('q') quality?: string,
    @Query('format') format?: string,
  ) {
    const media = await this.mediaService.getById(id);
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Si no hay parámetros de optimización, servir imagen original
    if (!width && !height && !format) {
      res.setHeader('Content-Type', media.mimeType);
      res.setHeader('Content-Length', String(media.sizeBytes));
      // Cache agresivo: si cambias la imagen, será un nuevo id.
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.send(media.data);
    }

    // Intentar optimizar la imagen
    try {
      const optimized = await this.mediaService.optimizeImage(media, {
        width: width ? parseInt(width, 10) : undefined,
        height: height ? parseInt(height, 10) : undefined,
        quality: quality ? parseInt(quality, 10) : 80,
        format: format as 'webp' | 'avif' | 'original' | undefined,
      });

      if (optimized) {
        res.setHeader('Content-Type', optimized.mimeType);
        res.setHeader('Content-Length', String(optimized.sizeBytes));
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.setHeader('Vary', 'Accept');
        return res.send(optimized.data);
      }
    } catch (error) {
      // Si falla la optimización, servir imagen original
      console.warn(`[MediaController] Error optimizando imagen ${id}:`, error);
    }

    // Fallback: servir imagen original
    res.setHeader('Content-Type', media.mimeType);
    res.setHeader('Content-Length', String(media.sizeBytes));
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.send(media.data);
  }
}
