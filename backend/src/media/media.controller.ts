import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { MediaService } from './media.service';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get media binary by id (public)' })
  async getById(@Param('id') id: string, @Res() res: Response) {
    const media = await this.mediaService.getById(id);
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    res.setHeader('Content-Type', media.mimeType);
    res.setHeader('Content-Length', String(media.sizeBytes));
    // Cache agresivo: si cambias la imagen, será un nuevo id.
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.send(media.data);
  }
}

