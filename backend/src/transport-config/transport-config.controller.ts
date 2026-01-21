import { Controller, Get, Patch, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { TransportConfigService } from './transport-config.service';
import { UpdateTransportConfigDto } from './dto/update-transport-config.dto';

@ApiTags('transport')
@Controller('transport')
export class TransportConfigController {
  constructor(private readonly transport: TransportConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener configuración de transporte (público)' })
  async getPublic() {
    return this.transport.getPublic();
  }

  @Get('estimate')
  @ApiOperation({ summary: 'Estimar costo de transporte por cantidad de unidades' })
  @ApiQuery({ name: 'itemCount', required: true, type: Number, description: 'Suma de cantidades en el carrito' })
  @ApiQuery({ name: 'subtotal', required: false, type: Number, description: 'Subtotal en USD. Si >= freeShippingThresholdUSD, envío gratis.' })
  async estimate(@Query('itemCount') itemCount: string, @Query('subtotal') subtotal?: string) {
    const n = Math.max(0, parseInt(String(itemCount || '0'), 10) || 0);
    const sub = subtotal != null && subtotal !== '' ? parseFloat(String(subtotal)) : undefined;
    return this.transport.estimate(n, sub);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener configuración de transporte (Admin)' })
  async getAdmin() {
    return this.transport.getAdmin();
  }

  @Patch('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar configuración de transporte (Admin)' })
  async updateAdmin(@Body() dto: UpdateTransportConfigDto) {
    return this.transport.updateAdmin(dto);
  }
}
