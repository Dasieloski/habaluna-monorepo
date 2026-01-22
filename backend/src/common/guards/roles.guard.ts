import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(Roles, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) return false;
    
    // Verificar que el usuario esté activo
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { isActive: true, role: true }
    });
    
    if (!dbUser || !dbUser.isActive) {
      throw new ForbiddenException('User account is inactive');
    }
    
    return requiredRoles.some((role) => dbUser.role === role);
  }
}
