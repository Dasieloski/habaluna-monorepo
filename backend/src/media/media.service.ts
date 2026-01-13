import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  getById(id: string) {
    return this.prisma.media.findUnique({
      where: { id },
    });
  }
}

