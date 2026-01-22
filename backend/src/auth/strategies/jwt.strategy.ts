import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

// Extractor personalizado que busca token en header Authorization O en cookie
const extractJwtFromHeaderOrCookie = (req: Request): string | null => {
  // Primero intentar desde header Authorization (Bearer token)
  const fromHeader = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  if (fromHeader) return fromHeader;

  // Si no está en header, buscar en cookie HttpOnly
  const cookieName = (process.env.ACCESS_COOKIE_NAME || 'accessToken').trim();
  const tokenFromCookie = (req as any)?.cookies?.[cookieName];
  if (typeof tokenFromCookie === 'string' && tokenFromCookie.trim()) {
    return tokenFromCookie.trim();
  }

  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: extractJwtFromHeaderOrCookie,
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true, // ← AGREGAR: Validar estado activo
      },
    });

    if (!user || !user.isActive) {
      // ← VALIDAR: Rechazar usuarios inactivos
      throw new UnauthorizedException('User account is inactive');
    }

    return user;
  }
}
