import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import * as crypto from 'crypto';

interface CreateIntentResult {
  paymentId: string;
  checkoutUrl: string;
  provider: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly providerName = 'supernova';

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
  ) {}

  private getApiBaseUrl(): string {
    return this.config.get<string>('SUPERNOVA_API_URL') ?? 'https://sp-qa.supernova-payments.com/api/v1';
  }

  private getApiKey(): string {
    const key = this.config.get<string>('SUPERNOVA_API_KEY');
    if (!key) {
      throw new InternalServerErrorException('SUPERNOVA_API_KEY not configured');
    }
    return key;
  }

  private getApiSecret(): string {
    const secret = this.config.get<string>('SUPERNOVA_API_SECRET');
    if (!secret) {
      throw new InternalServerErrorException('SUPERNOVA_API_SECRET not configured');
    }
    return secret;
  }

  async createIntentForOrder(orderId: string, userId: string): Promise<CreateIntentResult> {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { user: true },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    // Si ya existe un pago exitoso registrado para esta orden con Supernova,
    // no permitimos crear un nuevo intento para evitar dobles cobros.
    const existingPaidPayment = await this.prisma.payment.findFirst({
      where: {
        orderId: order.id,
        provider: this.providerName,
        status: 'PAID',
      },
    });

    if (existingPaidPayment) {
      throw new BadRequestException('Order is already processed');
    }

    const apiBase = this.getApiBaseUrl();
    const apiKey = this.getApiKey();
    const apiSecret = this.getApiSecret();

    const url = `${apiBase}/payment-links`;

    const body = {
      amount: Number(order.grandTotal ?? order.total),
      currency: order.currency,
      description: `Pedido ${order.orderNumber}`,
      reference: order.orderNumber,
      single_use: true,
      expires_in_hours: 24,
      customer: order.user
        ? {
            name: `${order.user.firstName ?? ''} ${order.user.lastName ?? ''}`.trim() || order.user.email,
            email: order.user.email,
            phone: order.user.phone ?? '',
          }
        : undefined,
      metadata: [`orderId:${order.id}`],
    };

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-API-Key': apiKey,
          'X-API-Secret': apiSecret,
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      this.logger.error('Error calling Supernova /payment-links', error instanceof Error ? error.stack : String(error));
      throw new InternalServerErrorException('Error creando link de pago');
    }

    if (!response.ok) {
      let message = `Supernova error: ${response.status} ${response.statusText}`;
      try {
        const errJson = await response.json();
        message = errJson?.message || message;
      } catch {
        // ignore
      }
      this.logger.warn(`Supernova /payment-links failed: ${message}`);
      throw new BadRequestException('No se pudo crear el link de pago');
    }

    const data = (await response.json()) as { data?: any };
    const link = data.data;

    if (!link?.id || !link?.checkout_url) {
      this.logger.error(`Supernova /payment-links response missing fields: ${JSON.stringify(data)}`);
      throw new InternalServerErrorException('Respuesta inválida del proveedor de pagos');
    }

    // Registrar Payment en BD
    const payment = await this.prisma.payment.create({
      data: {
        orderId: order.id,
        provider: this.providerName,
        providerPaymentId: String(link.id),
        status: 'PENDING',
        amount: order.grandTotal ?? order.total,
        currency: order.currency,
        rawPayload: link,
      },
    });

    return {
      paymentId: payment.id,
      checkoutUrl: link.checkout_url,
      provider: this.providerName,
    };
  }

  /**
   * Maneja un webhook de Supernova.
   * Verifica firma HMAC-SHA256 usando SUPERNOVA_WEBHOOK_SECRET y procesa eventos de transacción.
   */
  async handleWebhook(rawBody: string, headers: Record<string, string | string[] | undefined>): Promise<void> {
    const signature = (headers['x-webhook-signature'] || headers['X-Webhook-Signature']) as string | undefined;
    const eventType = (headers['x-webhook-event'] || headers['X-Webhook-Event']) as string | undefined;
    const eventId = (headers['x-webhook-id'] || headers['X-Webhook-ID']) as string | undefined;

    const secret = this.config.get<string>('SUPERNOVA_WEBHOOK_SECRET');
    if (!secret) {
      this.logger.error('SUPERNOVA_WEBHOOK_SECRET not configured');
      throw new InternalServerErrorException('Webhook secret not configured');
    }

    if (!signature || !eventType || !eventId) {
      this.logger.warn('Missing webhook headers from Supernova');
      throw new BadRequestException('Missing webhook headers');
    }

    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    // timing-safe comparison
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      this.logger.warn('Invalid Supernova webhook signature');
      throw new BadRequestException('Invalid signature');
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch (error) {
      this.logger.warn('Invalid JSON in Supernova webhook');
      throw new BadRequestException('Invalid JSON');
    }

    if (!payload?.data?.id || !payload?.data?.status) {
      this.logger.warn(`Webhook payload missing data.id or data.status: ${rawBody}`);
      return;
    }

    const transactionId = String(payload.data.id);
    const status = String(payload.data.status);

    // Solo procesar eventos de pago aprobado/éxito
    if (!['approved', 'success'].includes(status)) {
      this.logger.log(`Ignoring Supernova webhook with status=${status} for transaction ${transactionId}`);
      return;
    }

    await this.markPaymentAsPaid(transactionId, payload);
  }

  /**
   * Marca un pago como pagado y confirma la orden de forma idempotente.
   */
  private async markPaymentAsPaid(providerTransactionId: string, payload: any): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: {
          provider: this.providerName,
          providerPaymentId: providerTransactionId,
        },
        include: { order: true },
      });

      if (!payment) {
        this.logger.warn(`Payment not found for providerPaymentId=${providerTransactionId}`);
        return;
      }

      if (payment.status === 'PAID') {
        this.logger.log(`Payment ${payment.id} already marked as PAID, skipping`);
        return;
      }

      const order = await tx.order.findUnique({
        where: { id: payment.orderId },
        include: {
          items: {
            include: {
              product: true,
              productVariant: true,
            },
          },
        },
      });

      if (!order) {
        this.logger.warn(`Order ${payment.orderId} not found for payment ${payment.id}`);
        return;
      }

      if (order.paymentStatus === 'PAID') {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'PAID',
            rawPayload: payload,
          },
        });
        return;
      }

      // Validar monto y divisa si vienen en el payload
      const payloadAmount = Number(payload.data.amount_approved ?? payload.data.amount ?? 0);
      const payloadCurrency = String(payload.data.currency ?? '').toUpperCase();

      const expectedAmount = Number(order.grandTotal ?? order.total);
      const expectedCurrency = order.currency;

      if (payloadAmount && Math.abs(payloadAmount - expectedAmount) > 0.01) {
        this.logger.warn(
          `Payment amount mismatch for payment ${payment.id}: expected=${expectedAmount}, got=${payloadAmount}`,
        );
        throw new BadRequestException('Payment amount mismatch');
      }

      if (payloadCurrency && payloadCurrency !== expectedCurrency) {
        this.logger.warn(
          `Payment currency mismatch for payment ${payment.id}: expected=${expectedCurrency}, got=${payloadCurrency}`,
        );
        throw new BadRequestException('Payment currency mismatch');
      }

      // Validar stock antes de confirmar
      for (const item of order.items) {
        const stock = item.productVariant ? item.productVariant.stock : item.product.stock;
        if (stock < item.quantity) {
          const itemName = item.productVariant
            ? `${item.product.name} - ${item.productVariant.name}`
            : item.product.name;
          throw new BadRequestException(`Insufficient stock for ${itemName}`);
        }
      }

      // Descontar stock
      for (const item of order.items) {
        if (item.productVariantId) {
          await tx.productVariant.update({
            where: { id: item.productVariantId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      // Limpiar carrito del usuario
      await tx.cartItem.deleteMany({
        where: { userId: order.userId },
      });

      // Actualizar Payment y Order
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          rawPayload: payload,
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          status: 'PROCESSING',
          paymentIntentId: providerTransactionId,
        },
      });
    });
  }
}

