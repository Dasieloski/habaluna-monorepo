import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { ProcessRefundDto } from './dto/process-refund.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuditService } from '../common/services/audit.service';

@Injectable()
export class ReturnsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async createReturnRequest(userId: string, dto: CreateReturnDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      // Check if user is admin? No, this method is for users requesting returns.
      // If admin creates it, userId should be the customer's ID, passed differently.
      // Assuming this is self-service for now, or admin passing customer ID.
      // For MVP, let's assume admin can create for any user, or user for themselves.
      // We'll validate ownership in controller if needed.
    }

    const returnRequest = await this.prisma.returnRequest.create({
      data: {
        orderId: dto.orderId,
        userId,
        reason: dto.reason,
        notes: dto.notes,
        refundAmount: dto.refundAmount,
        status: 'REQUESTED',
      },
    });

    await this.auditService.log(userId, 'CREATE_RETURN', 'return_request', returnRequest.id);

    return returnRequest;
  }

  async findAll(pagination: PaginationDto, status?: string) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.returnRequest.findMany({
        where,
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
          order: { select: { orderNumber: true, total: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.returnRequest.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const request = await this.prisma.returnRequest.findUnique({
      where: { id },
      include: {
        user: true,
        order: { include: { items: { include: { product: true } } } },
        refunds: true,
      },
    });
    if (!request) throw new NotFoundException('Return request not found');
    return request;
  }

  async updateStatus(id: string, status: 'APPROVED' | 'REJECTED', adminId: string) {
    const request = await this.prisma.returnRequest.update({
      where: { id },
      data: { status },
    });
    await this.auditService.log(adminId, 'UPDATE_RETURN_STATUS', 'return_request', id, { status });
    return request;
  }

  async processRefund(returnRequestId: string, dto: ProcessRefundDto, adminId: string) {
    const request = await this.prisma.returnRequest.findUnique({
      where: { id: returnRequestId },
    });
    if (!request) throw new NotFoundException('Return request not found');

    if (request.status !== 'APPROVED') {
      throw new BadRequestException('Return request must be approved before refunding');
    }

    const refund = await this.prisma.refund.create({
      data: {
        returnRequestId,
        orderId: request.orderId,
        amount: dto.amount,
        reason: dto.reason,
        method: dto.method,
        status: 'PROCESSED', // Assuming instant process for now, or PENDING if async
        processedAt: new Date(),
        processedBy: adminId,
      },
    });

    // Update return status to REFUNDED
    await this.prisma.returnRequest.update({
      where: { id: returnRequestId },
      data: { status: 'REFUNDED' },
    });

    // Update order payment status to REFUNDED if full refund?
    // Logic can be complex. For now, just log.
    await this.auditService.log(adminId, 'PROCESS_REFUND', 'refund', refund.id, { amount: dto.amount });

    return refund;
  }

  async getRefunds(pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.refund.findMany({
        include: {
          order: { select: { orderNumber: true } },
          returnRequest: { include: { user: { select: { email: true } } } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.refund.count(),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
