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
    try {
      return await this.prisma.theme.findMany({
        include: {
          _count: {
            select: { themeSchedules: true }
          }
        },
        orderBy: { priority: 'desc' }
      });
    } catch (error) {
      // Si la tabla no existe aún, devolver array vacío
      console.log('Themes table does not exist yet, returning empty array');
      return [];
    }
  }

  async findOne(id: string) {
    try {
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error finding theme:', error);
      throw new Error(`Failed to find theme: ${error.message}`);
    }
  }

  async findByType(type: ThemeType) {
    try {
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error finding theme by type:', error);
      throw new Error(`Failed to find theme: ${error.message}`);
    }
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
    try {
      const theme = await this.findOne(id);

      // Si se está activando, desactivar otros temas primero
      if (enabled) {
        await this.prisma.theme.updateMany({
          where: { status: ThemeStatus.ACTIVE },
          data: { status: ThemeStatus.INACTIVE }
        });
      }

      return await this.prisma.theme.update({
        where: { id },
        data: { status: enabled ? ThemeStatus.ACTIVE : ThemeStatus.INACTIVE },
      });
    } catch (error) {
      console.error('Error toggling theme:', error);
      throw new Error(`Failed to toggle theme: ${error.message}`);
    }
  }

  async getActiveTheme() {
    try {
      // Primero buscar tema activo manualmente
      const activeTheme = await this.prisma.theme.findFirst({
        where: { status: ThemeStatus.ACTIVE },
        include: {
          themeSchedules: true
        }
      });

      if (activeTheme) {
        return activeTheme;
      }

      // Si no hay tema activo manualmente, buscar temas programados para la fecha actual
      const now = new Date();

      // Buscar temas programados que estén activos en la fecha actual
      const scheduledThemes = await this.prisma.themeSchedule.findMany({
        where: {
          OR: [
            {
              startDate: { lte: now },
              endDate: { gte: now }
            },
            {
              isRecurring: true,
              startDate: {
                lte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
              }
            }
          ]
        },
        include: {
          theme: {
            include: {
              themeSchedules: true
            }
          }
        },
        orderBy: {
          theme: {
            priority: 'desc'
          }
        }
      });

      // Devolver el primer tema programado encontrado (ordenado por prioridad)
      if (scheduledThemes.length > 0) {
        return scheduledThemes[0].theme;
      }

      // Si no hay ningún tema activo, devolver null
      return null;

    } catch (error) {
      console.error('Error getting active theme:', error);
      // Devolver null en caso de error para evitar romper la aplicación
      return null;
    }
  }

  async scheduleTheme(scheduleDto: ScheduleThemeDto) {
    try {
      const theme = await this.findOne(scheduleDto.themeId);

      return await this.prisma.themeSchedule.create({
        data: {
          themeId: scheduleDto.themeId,
          startDate: new Date(scheduleDto.startDate),
          endDate: scheduleDto.endDate ? new Date(scheduleDto.endDate) : null,
          isRecurring: scheduleDto.isRecurring || false,
        },
      });
    } catch (error) {
      console.error('Error scheduling theme:', error);
      throw new Error(`Failed to schedule theme: ${error.message}`);
    }
  }

  async getScheduledThemes() {
    try {
      return await this.prisma.themeSchedule.findMany({
        include: {
          theme: true
        },
        orderBy: { startDate: 'asc' }
      });
    } catch (error) {
      // Si la tabla no existe, devolver array vacío
      console.log('ThemeSchedule table does not exist yet, returning empty array');
      return [];
    }
  }

  async removeSchedule(scheduleId: string) {
    return this.prisma.themeSchedule.delete({
      where: { id: scheduleId },
    });
  }

  async previewTheme(type: ThemeType) {
    try {
      // Para previsualización, devolver la configuración del tema
      const theme = await this.findByType(type);
      return {
        theme,
        config: theme.config,
        isActive: theme.status === ThemeStatus.ACTIVE
      };
    } catch (error) {
      console.error('Error previewing theme:', error);
      // Devolver configuración por defecto si el tema no existe
      return {
        theme: null,
        config: null,
        isActive: false,
        error: error.message
      };
    }
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
      // Verificar si ya existen temas (con manejo de errores si la tabla no existe)
      let existingThemes = [];
      try {
        existingThemes = await this.prisma.theme.findMany();
      } catch (error) {
        // Si la tabla no existe, continuar con la creación
        console.log('Themes table does not exist yet, will create themes');
      }

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
          // Si ya existe o hay otro error, continuar
          console.log(`Theme ${themeData.type} creation failed:`, error.message);
        }
      }

      return { message: 'Default themes initialized successfully', count: createdThemes.length };
    } catch (error) {
      console.error('Error initializing themes:', error);
      // En lugar de lanzar error, devolver un mensaje informativo
      return { message: `Failed to initialize themes: ${error.message}`, count: 0 };
    }
  }
}