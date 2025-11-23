import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.validateUser(loginDto.email, loginDto.password);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role);
      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        ...tokens,
      };
    } catch (error) {
      console.error('❌ Error en login:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      const tokenRecord = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(
        payload.sub,
        payload.email,
        payload.role,
      );

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(userId: string, email: string, role: string) {
    try {
      // Verificar que las variables de entorno estén configuradas
      const jwtSecret = this.config.get('JWT_SECRET');
      const jwtRefreshSecret = this.config.get('JWT_REFRESH_SECRET');
      
      if (!jwtSecret) {
        console.error('❌ JWT_SECRET no está configurado');
        throw new Error('JWT_SECRET is not configured');
      }
      
      if (!jwtRefreshSecret) {
        console.error('❌ JWT_REFRESH_SECRET no está configurado');
        throw new Error('JWT_REFRESH_SECRET is not configured');
      }

      const payload = { sub: userId, email, role };

      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, {
        secret: jwtRefreshSecret,
        expiresIn: this.config.get('JWT_REFRESH_EXPIRATION') || '7d',
      });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Intentar crear el refresh token en la base de datos
      try {
        await this.prisma.refreshToken.create({
          data: {
            token: refreshToken,
            userId,
            expiresAt,
          },
        });
      } catch (dbError) {
        console.error('❌ Error al crear refreshToken en la base de datos:', dbError);
        // Si la tabla no existe, puede ser que las migraciones no se hayan ejecutado
        if (dbError.code === 'P2001' || dbError.message?.includes('table') || dbError.message?.includes('does not exist')) {
          throw new Error('Database table refreshToken does not exist. Please run migrations.');
        }
        throw dbError;
      }

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error('❌ Error al generar tokens:', error);
      throw error;
    }
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
    return { message: 'Logged out successfully' };
  }
}

