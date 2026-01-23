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
  getActiveTheme() {
    return this.themesService.getActiveTheme();
  }
}