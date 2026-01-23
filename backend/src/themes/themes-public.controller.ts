import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ThemesService } from './themes.service';

@ApiTags('themes-public')
@Controller('themes')
export class ThemesPublicController {
  constructor(private readonly themesService: ThemesService) {}

  @Get('active')
  @ApiOperation({ summary: 'Obtener el tema activo actualmente (público)' })
  @ApiResponse({ status: 200, description: 'Tema activo o null' })
  async getActiveTheme() {
    try {
      const activeTheme = await this.themesService.getActiveTheme();
      return activeTheme;
    } catch (error) {
      console.error('Error in getActiveTheme endpoint:', error);
      // Siempre devolver null en caso de error para evitar respuestas vacías
      return null;
    }
  }
}