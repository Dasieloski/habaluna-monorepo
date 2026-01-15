import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureConfigured() {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      throw new Error(
        'Cloudinary no configurado. Define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.',
      );
    }
  }

  async uploadImage(file: Express.Multer.File): Promise<{
    url: string;
    publicId: string;
    bytes: number;
    width?: number;
    height?: number;
    format?: string;
  }> {
    if (!file?.buffer) {
      throw new Error('Archivo inválido (no buffer).');
    }

    // Por defecto: guardar en BD (sin depender de Cloudinary).
    // Para volver a Cloudinary: setear STORAGE_PROVIDER=cloudinary.
    const provider = (process.env.STORAGE_PROVIDER || 'database').toLowerCase();

    if (provider === 'cloudinary') {
      this.ensureConfigured();
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });

      const folder = process.env.CLOUDINARY_FOLDER || 'habanaluna';
      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            // Mantener formato original; Cloudinary devolverá secure_url.
          },
          (error, res) => {
            if (error) return reject(error);
            return resolve(res);
          },
        );

        stream.end(file.buffer);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        format: result.format,
      };
    }

    const created = await this.prisma.media.create({
      data: {
        filename: file.originalname || null,
        mimeType: file.mimetype || 'application/octet-stream',
        sizeBytes: file.size ?? file.buffer.length,
        data: file.buffer,
      },
    });

    return {
      url: `/api/media/${created.id}`,
      publicId: created.id,
      bytes: created.sizeBytes,
    };
  }
}
