import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('alerts')
@Controller('alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'OPERATOR', 'LOGISTICS')
@ApiBearerAuth()
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  @ApiOperation({ summary: 'Create system alert (Internal)' })
  async create(@Body() dto: CreateAlertDto) {
    return this.alertsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all alerts' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.alertsService.findAll(
      { page: Number(page) || 1, limit: Number(limit) || 10 },
      status,
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread alerts count' })
  async getUnreadCount() {
    return { count: await this.alertsService.getUnreadCount() };
  }

  @Patch(':id/viewed')
  @ApiOperation({ summary: 'Mark alert as viewed' })
  async markAsViewed(@Param('id') id: string) {
    return this.alertsService.markAsViewed(id);
  }

  @Patch(':id/resolved')
  @ApiOperation({ summary: 'Mark alert as resolved' })
  async markAsResolved(@Param('id') id: string) {
    return this.alertsService.markAsResolved(id);
  }
}
