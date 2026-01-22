import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { SaveContentDto } from './dto/save-content.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('content')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  @ApiOperation({ summary: 'Get all content blocks' })
  @ApiQuery({ name: 'section', required: false })
  async findAll(@Query('section') section?: string) {
    return this.contentService.findAll(section);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get content block by slug' })
  async findOne(@Param('slug') slug: string) {
    return this.contentService.findOne(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update content block (Admin)' })
  async upsert(@CurrentUser() user: any, @Body() dto: SaveContentDto) {
    return this.contentService.upsert(dto, user.id);
  }

  @Delete(':slug')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete content block (Admin)' })
  async delete(@CurrentUser() user: any, @Param('slug') slug: string) {
    return this.contentService.delete(slug, user.id);
  }
}
