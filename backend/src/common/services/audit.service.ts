import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  /**
   * Registra una acción administrativa en el log de auditoría
   * @param userId - ID del usuario que realizó la acción
   * @param action - Tipo de acción (ej: 'CREATE_PRODUCT', 'UPDATE_ORDER')
   * @param resource - Tipo de recurso (ej: 'product', 'order', 'user')
   * @param resourceId - ID del recurso afectado (opcional)
   * @param changes - Cambios realizados (before/after) (opcional)
   * @param request - Request object para extraer IP y User-Agent (opcional)
   */
  async log(
    userId: string,
    action: string,
    resource: string,
    resourceId?: string,
    changes?: { before?: any; after?: any },
    request?: Request,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          resource,
          resourceId: resourceId || null,
          changes: changes ? JSON.parse(JSON.stringify(changes)) : null,
          ipAddress: request?.ip || request?.socket?.remoteAddress || null,
          userAgent: request?.headers['user-agent'] || null,
        },
      });
    } catch (error) {
      // No fallar la operación principal si el log falla
      // En producción, esto debería ir a un servicio de logging externo
      console.error('Error logging audit:', error);
    }
  }

  /**
   * Obtiene los logs de auditoría con filtros opcionales
   */
  async getLogs(params?: {
    userId?: string;
    resource?: string;
    resourceId?: string;
    action?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};
    if (params?.userId) where.userId = params.userId;
    if (params?.resource) where.resource = params.resource;
    if (params?.resourceId) where.resourceId = params.resourceId;
    if (params?.action) where.action = params.action;

    return this.prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: params?.limit || 100,
      skip: params?.offset || 0,
    });
  }
}
