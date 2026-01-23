import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ThemesService } from './themes.service';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { ScheduleThemeDto } from './dto/schedule-theme.dto';
import { ToggleThemeDto } from './dto/toggle-theme.dto';

@ApiTags('themes')
@Controller('admin/themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo tema' })
  @ApiResponse({ status: 201, description: 'Tema creado exitosamente' })
  create(@Body() createThemeDto: CreateThemeDto) {
    return this.themesService.create(createThemeDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener todos los temas' })
  @ApiResponse({ status: 200, description: 'Lista de temas' })
  findAll() {
    return this.themesService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener el tema activo actualmente' })
  @ApiResponse({ status: 200, description: 'Tema activo o null' })
  getActiveTheme() {
    return this.themesService.getActiveTheme();
  }

  @Get('scheduled')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener temas programados' })
  @ApiResponse({ status: 200, description: 'Lista de temas programados' })
  getScheduledThemes() {
    return this.themesService.getScheduledThemes();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener un tema específico' })
  @ApiResponse({ status: 200, description: 'Tema encontrado' })
  @ApiResponse({ status: 404, description: 'Tema no encontrado' })
  findOne(@Param('id') id: string) {
    return this.themesService.findOne(id);
  }

  @Get('type/:type')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener tema por tipo' })
  @ApiResponse({ status: 200, description: 'Tema encontrado' })
  @ApiResponse({ status: 404, description: 'Tema no encontrado' })
  findByType(@Param('type') type: string) {
    return this.themesService.findByType(type as any);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar un tema' })
  @ApiResponse({ status: 200, description: 'Tema actualizado' })
  update(@Param('id') id: string, @Body() updateThemeDto: UpdateThemeDto) {
    return this.themesService.update(id, updateThemeDto);
  }

  @Post(':id/toggle')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activar/desactivar un tema' })
  @ApiResponse({ status: 200, description: 'Estado del tema cambiado' })
  toggleActive(@Param('id') id: string, @Body() toggleDto: ToggleThemeDto) {
    return this.themesService.toggleActive(id, toggleDto.enabled);
  }

  @Post('schedule')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Programar un tema para fechas específicas' })
  @ApiResponse({ status: 201, description: 'Tema programado exitosamente' })
  scheduleTheme(@Body() scheduleDto: ScheduleThemeDto) {
    return this.themesService.scheduleTheme(scheduleDto);
  }

  @Delete('schedule/:scheduleId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar una programación de tema' })
  @ApiResponse({ status: 200, description: 'Programación eliminada' })
  removeSchedule(@Param('scheduleId') scheduleId: string) {
    return this.themesService.removeSchedule(scheduleId);
  }

  @Get('preview/:type')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener configuración para previsualización' })
  @ApiResponse({ status: 200, description: 'Configuración del tema para preview' })
  previewTheme(@Param('type') type: string) {
    return this.themesService.previewTheme(type as any);
  }

  @Post('initialize')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Inicializar temas por defecto' })
  @ApiResponse({ status: 200, description: 'Temas por defecto inicializados' })
  initializeDefaultThemes() {
    return this.themesService.initializeDefaultThemes();
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar un tema' })
  @ApiResponse({ status: 200, description: 'Tema eliminado' })
  remove(@Param('id') id: string) {
    return this.themesService.remove(id);
  }
}