import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { ProcessRefundDto } from './dto/process-refund.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('returns')
@Controller('returns')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  @ApiOperation({ summary: 'Create return request' })
  async create(@CurrentUser() user: any, @Body() dto: CreateReturnDto) {
    return this.returnsService.createReturnRequest(user.id, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR', 'SUPPORT')
  @ApiOperation({ summary: 'Get all return requests (Admin)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.returnsService.findAll(
      { page: Number(page) || 1, limit: Number(limit) || 10 },
      status,
    );
  }

  @Get('refunds')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'FINANCE') // Assuming FINANCE role exists or mapped to ADMIN
  @ApiOperation({ summary: 'Get all refunds (Admin)' })
  async getRefunds(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.returnsService.getRefunds({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get return request details' })
  async findOne(@Param('id') id: string) {
    return this.returnsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @ApiOperation({ summary: 'Update return status' })
  async updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('status') status: 'APPROVED' | 'REJECTED',
  ) {
    return this.returnsService.updateStatus(id, status, user.id);
  }

  @Post(':id/refund')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Process refund for return request' })
  async processRefund(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: ProcessRefundDto,
  ) {
    return this.returnsService.processRefund(id, dto, user.id);
  }
}
