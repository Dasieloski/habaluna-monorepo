import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { ScheduleThemeDto } from './dto/schedule-theme.dto';
import { ThemeType, ThemeStatus } from '@prisma/client';

@Injectable()
export class ThemesService {
  constructor(private prisma: PrismaService) {}

  async create(createThemeDto: CreateThemeDto) {
    // Verificar que no exista un tema del mismo tipo
    const existing = await this.prisma.theme.findUnique({
      where: { type: createThemeDto.type }
    });

    if (existing) {
      throw new ConflictException(`Theme of type ${createThemeDto.type} already exists`);
    }

    return this.prisma.theme.create({
      data: createThemeDto,
    });
  }

  async findAll() {
    return this.prisma.theme.findMany({
      include: {
        _count: {
          select: { themeSchedules: true }
        }
      },
      orderBy: { priority: 'desc' }
    });
  }

  async findOne(id: string) {
    const theme = await this.prisma.theme.findUnique({
      where: { id },
      include: {
        themeSchedules: {
          orderBy: { startDate: 'asc' }
        }
      }
    });

    if (!theme) {
      throw new NotFoundException(`Theme with ID ${id} not found`);
    }

    return theme;
  }

  async findByType(type: ThemeType) {
    const theme = await this.prisma.theme.findUnique({
      where: { type },
      include: {
        themeSchedules: {
          orderBy: { startDate: 'asc' }
        }
      }
    });

    if (!theme) {
      throw new NotFoundException(`Theme of type ${type} not found`);
    }

    return theme;
  }

  async update(id: string, updateThemeDto: UpdateThemeDto) {
    // Verificar que el tema existe
    await this.findOne(id);

    // Si se está cambiando el tipo, verificar que no exista otro con ese tipo
    if (updateThemeDto.type) {
      const existing = await this.prisma.theme.findFirst({
        where: {
          type: updateThemeDto.type,
          id: { not: id }
        }
      });

      if (existing) {
        throw new ConflictException(`Theme of type ${updateThemeDto.type} already exists`);
      }
    }

    return this.prisma.theme.update({
      where: { id },
      data: updateThemeDto,
    });
  }

  async remove(id: string) {
    // Verificar que el tema existe
    await this.findOne(id);

    return this.prisma.theme.delete({
      where: { id },
    });
  }

  async toggleActive(id: string, enabled: boolean) {
    const theme = await this.findOne(id);

    // Si se está activando, desactivar otros temas primero
    if (enabled) {
      await this.prisma.theme.updateMany({
        where: { status: ThemeStatus.ACTIVE },
        data: { status: ThemeStatus.INACTIVE }
      });
    }

    return this.prisma.theme.update({
      where: { id },
      data: { status: enabled ? ThemeStatus.ACTIVE : ThemeStatus.INACTIVE },
    });
  }

  async getActiveTheme() {
    const theme = await this.prisma.theme.findFirst({
      where: { status: ThemeStatus.ACTIVE },
      include: {
        themeSchedules: true
      }
    });

    // Si no hay tema activo manualmente, buscar por fecha
    if (!theme) {
      const now = new Date();
      const scheduledTheme = await this.prisma.theme.findFirst({
        where: {
          status: ThemeStatus.SCHEDULED,
          OR: [
            {
              startDate: { lte: now },
              endDate: { gte: now }
            },
            {
              isRecurring: true,
              OR: [
                // Para temas recurrentes, verificar mes y día
                {
                  startDate: {
                    lte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
                  }
                }
              ]
            }
          ]
        },
        include: {
          themeSchedules: true
        },
        orderBy: { priority: 'desc' }
      });

      return scheduledTheme;
    }

    return theme;
  }

  async scheduleTheme(scheduleDto: ScheduleThemeDto) {
    const theme = await this.findOne(scheduleDto.themeId);

    return this.prisma.themeSchedule.create({
      data: {
        themeId: scheduleDto.themeId,
        startDate: new Date(scheduleDto.startDate),
        endDate: scheduleDto.endDate ? new Date(scheduleDto.endDate) : null,
        isRecurring: scheduleDto.isRecurring || false,
      },
    });
  }

  async getScheduledThemes() {
    return this.prisma.themeSchedule.findMany({
      include: {
        theme: true
      },
      orderBy: { startDate: 'asc' }
    });
  }

  async removeSchedule(scheduleId: string) {
    return this.prisma.themeSchedule.delete({
      where: { id: scheduleId },
    });
  }

  async previewTheme(type: ThemeType) {
    // Para previsualización, devolver la configuración del tema
    const theme = await this.findByType(type);
    return {
      theme,
      config: theme.config,
      isActive: theme.status === ThemeStatus.ACTIVE
    };
  }

  // Método para inicializar temas por defecto
  async initializeDefaultThemes() {
    const defaultThemes = [
      {
        type: ThemeType.CHRISTMAS,
        name: 'Navidad',
        description: 'Tema festivo de Navidad con nieve y decoraciones',
        config: {
          showSnow: true,
          showGarland: true,
          showBanner: true,
          bannerMessage: '¡Feliz Navidad!',
          bannerSubMessage: 'Envío gratis en pedidos +$50'
        }
      },
      {
        type: ThemeType.VALENTINES,
        name: 'San Valentín',
        description: 'Tema romántico para el día de los enamorados',
        config: {
          showBanner: true,
          bannerMessage: '¡Feliz Día de los Enamorados!',
          bannerSubMessage: 'Descuentos especiales en productos para parejas'
        }
      },
      {
        type: ThemeType.MOTHERS_DAY,
        name: 'Día de la Madre',
        description: 'Tema especial para celebrar a las madres',
        config: {
          showBanner: true,
          bannerMessage: '¡Feliz Día de la Madre!',
          bannerSubMessage: 'Ofertas especiales para regalar'
        }
      }
    ];

    try {
      // Verificar si ya existen temas
      const existingThemes = await this.prisma.theme.findMany();
      if (existingThemes.length > 0) {
        return { message: 'Themes already initialized', count: existingThemes.length };
      }

      // Crear temas usando create en lugar de upsert para evitar problemas
      const createdThemes = [];
      for (const themeData of defaultThemes) {
        try {
          const created = await this.prisma.theme.create({
            data: themeData,
          });
          createdThemes.push(created);
        } catch (error) {
          // Si ya existe, continuar
          console.log(`Theme ${themeData.type} already exists:`, error.message);
        }
      }

      return { message: 'Default themes initialized successfully', count: createdThemes.length };
    } catch (error) {
      console.error('Error initializing themes:', error);
      throw new Error(`Failed to initialize themes: ${error.message}`);
    }
  }
}