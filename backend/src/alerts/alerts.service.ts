import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAlertDto) {
    return this.prisma.systemAlert.create({
      data: {
        type: dto.type,
        message: dto.message,
        details: dto.details,
        status: 'NEW',
      },
    });
  }

  async findAll(pagination: PaginationDto, status?: string) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.systemAlert.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.systemAlert.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async markAsViewed(id: string) {
    return this.prisma.systemAlert.update({
      where: { id },
      data: { status: 'VIEWED' },
    });
  }

  async markAsResolved(id: string) {
    return this.prisma.systemAlert.update({
      where: { id },
      data: { status: 'RESOLVED' },
    });
  }

  async getUnreadCount() {
    return this.prisma.systemAlert.count({
      where: { status: 'NEW' },
    });
  }
}
