import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveContentDto } from './dto/save-content.dto';
import { AuditService } from '../common/services/audit.service';

@Injectable()
export class ContentService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async upsert(dto: SaveContentDto, userId: string) {
    const content = await this.prisma.contentBlock.upsert({
      where: { slug: dto.slug },
      update: {
        title: dto.title,
        content: dto.content,
        section: dto.section,
        isActive: dto.isActive,
        updatedBy: userId,
      },
      create: {
        slug: dto.slug,
        title: dto.title,
        content: dto.content,
        section: dto.section,
        isActive: dto.isActive ?? true,
        updatedBy: userId,
      },
    });

    await this.auditService.log(userId, 'UPSERT_CONTENT', 'content_block', content.id, { slug: dto.slug });
    return content;
  }

  async findAll(section?: string) {
    const where: any = {};
    if (section) where.section = section;

    return this.prisma.contentBlock.findMany({
      where,
      orderBy: { slug: 'asc' },
    });
  }

  async findOne(slug: string) {
    const content = await this.prisma.contentBlock.findUnique({
      where: { slug },
    });
    if (!content) throw new NotFoundException('Content block not found');
    return content;
  }

  async delete(slug: string, userId: string) {
    const content = await this.prisma.contentBlock.delete({
      where: { slug },
    });
    await this.auditService.log(userId, 'DELETE_CONTENT', 'content_block', content.id, { slug });
    return content;
  }
}
