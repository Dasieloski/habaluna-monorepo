import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  Headers,
  RawBodyRequest,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { PaymentsService } from './payments.service';

class CreatePaymentIntentDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  orderId: string;
}

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('admin/transactions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get admin payment transactions directly from Supernova' })
  async getAdminTransactions(
    @Query('page') page?: string,
    @Query('per_page') perPage?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.paymentsService.getAdminTransactions({
      page: Number(page) || 1,
      perPage: Number(perPage) || 50,
      status,
      search,
    });
  }

  @Get('admin/orders/:orderId/reconciliation')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment reconciliation for a specific order' })
  async getAdminOrderPaymentReconciliation(@Param('orderId') orderId: string) {
    return this.paymentsService.getAdminOrderPaymentReconciliation(orderId);
  }

  @Post('admin/orders/:orderId/resync')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resync local order payment status from Supernova' })
  async resyncAdminOrderPayment(@Param('orderId') orderId: string) {
    return this.paymentsService.resyncAdminOrderPayment(orderId);
  }

  @Post('intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment intent (Supernova payment link) for an order' })
  async createIntent(
    @CurrentUser() user: any,
    @Body() dto: CreatePaymentIntentDto,
  ): Promise<{ paymentId: string; checkoutUrl: string; provider: string }> {
    const result = await this.paymentsService.createIntentForOrder(dto.orderId, user.id);
    return result;
  }

  /**
   * Webhook público para Supernova.
   * Debe configurarse en el dashboard de Supernova apuntando a /api/payments/webhook
   *
   * IMPORTANTE: esta ruta debe recibir el body "raw" para validar HMAC.
   * En NestJS/Express, se configura en main.ts con un body parser especial para esta ruta,
   * pero como estamos en entorno controlado, asumimos que req.rawBody existe.
   */
  @Post('webhook')
  @ApiOperation({ summary: 'Handle Supernova webhook (transaction.approved, etc.)' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers() headers: Record<string, string | string[] | undefined>,
  ) {
    const rawBody = (req as any).rawBody
      ? (req as any).rawBody.toString()
      : (req as any).body && typeof (req as any).body === 'string'
        ? ((req as any).body as string)
        : JSON.stringify((req as any).body ?? {});

    await this.paymentsService.handleWebhook(rawBody, headers);
    return { received: true };
  }
}

