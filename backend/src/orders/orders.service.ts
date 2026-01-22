import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CartService } from '../cart/cart.service';
import { convertToUSD } from '../common/utils/currency.utils';
import { EmailService } from '../common/email/email.service';
import { OffersService } from '../offers/offers.service';
import { TransportConfigService } from '../transport-config/transport-config.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    private emailService: EmailService,
    private offersService: OffersService,
    private transportConfig: TransportConfigService,
    private config: ConfigService,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto) {
    const cart = await this.cartService.getCart(userId);

    if (cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Validate stock
    for (const item of cart.items) {
      const stock = item.productVariant ? item.productVariant.stock : item.product.stock;

      if (stock < item.quantity) {
        const itemName = item.productVariant
          ? `${item.product.name} - ${item.productVariant.name}`
          : item.product.name;
        throw new BadRequestException(`Insufficient stock for ${itemName}`);
      }
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Validar stock antes de crear la orden
    for (const item of cart.items) {
      const stock = item.productVariant ? item.productVariant.stock : item.product.stock;

      if (stock < item.quantity) {
        const itemName = item.productVariant
          ? `${item.product.name} - ${item.productVariant.name}`
          : item.product.name;
        throw new BadRequestException(
          `Stock insuficiente para ${itemName}. Stock disponible: ${stock}, solicitado: ${item.quantity}`,
        );
      }

      // Validar que el producto esté activo
      if (!item.product.isActive) {
        throw new BadRequestException(`El producto ${item.product.name} ya no está disponible`);
      }
    }

    // RECALCULAR subtotal desde BD (no confiar en cart.subtotal)
    // Esto previene manipulación de precios por parte del cliente
    let validatedSubtotal = 0;
    for (const item of cart.items) {
      // Obtener precio ACTUAL desde BD
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
        select: { priceUSD: true, priceMNs: true }
      });
      
      if (!product) {
        throw new BadRequestException(`Product ${item.productId} not found`);
      }
      
      const variant = item.productVariantId 
        ? await this.prisma.productVariant.findUnique({
            where: { id: item.productVariantId },
            select: { priceUSD: true, priceMNs: true }
          })
        : null;
      
      // Usar precio de variante si existe, sino del producto
      let priceInUSD = 0;
      if (variant) {
        if (variant.priceUSD) {
          priceInUSD = Number(variant.priceUSD);
        } else if (variant.priceMNs) {
          priceInUSD = convertToUSD(Number(variant.priceMNs), 'MNs');
        }
      } else {
        if (product.priceUSD) {
          priceInUSD = Number(product.priceUSD);
        } else if (product.priceMNs) {
          priceInUSD = convertToUSD(Number(product.priceMNs), 'MNs');
        }
      }
      
      validatedSubtotal += priceInUSD * item.quantity;
    }
    
    // VALIDAR que el subtotal calculado coincida con el del carrito
    const tolerance = 0.01; // Permitir pequeñas diferencias de redondeo
    if (Math.abs(validatedSubtotal - cart.subtotal) > tolerance) {
      throw new BadRequestException('Cart prices have changed. Please refresh your cart.');
    }
    
    // Usar validatedSubtotal, no cart.subtotal
    const subtotal = validatedSubtotal;
    const tax = 0;
    const itemCount = cart.items.reduce((s, i) => s + i.quantity, 0);
    const transportConfig = await this.transportConfig.getPublic();
    const { shipping } = this.transportConfig.computeShipping(itemCount, transportConfig);
    const total = subtotal + tax + Number(shipping);

    // Create order (sin descontar stock ni limpiar carrito - se hará cuando se confirme el pago)
    // Convertir AddressDto a objeto plano para Prisma (espera JSON)
    const shippingAddressPlain = JSON.parse(JSON.stringify(createOrderDto.shippingAddress));
    const billingAddressPlain = createOrderDto.billingAddress 
      ? JSON.parse(JSON.stringify(createOrderDto.billingAddress))
      : shippingAddressPlain;
    
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId,
        subtotal,
        tax,
        shipping,
        total,
        shippingAddress: shippingAddressPlain,
        billingAddress: billingAddressPlain,
        paymentIntentId: createOrderDto.paymentIntentId,
        offerId: createOrderDto.offerId,
        notes: createOrderDto.notes,
        status: 'PENDING', // Estado pendiente hasta que se confirme el pago
        paymentStatus: 'PENDING',
        items: {
          create: cart.items.map((item) => {
            let priceInUSD = 0;
            if (item.productVariant) {
              // Priorizar precio USD, si no existe convertir desde MNs
              if (item.productVariant.priceUSD) {
                priceInUSD = Number(item.productVariant.priceUSD);
              } else if (item.productVariant.priceMNs) {
                priceInUSD = convertToUSD(Number(item.productVariant.priceMNs), 'MNs');
              }
            } else {
              // Priorizar precio USD, si no existe convertir desde MNs
              if (item.product.priceUSD) {
                priceInUSD = Number(item.product.priceUSD);
              } else if (item.product.priceMNs) {
                priceInUSD = convertToUSD(Number(item.product.priceMNs), 'MNs');
              }
            }
            return {
              productId: item.productId,
              productVariantId: item.productVariantId || null,
              variantName: item.productVariant?.name || null,
              quantity: item.quantity,
              price: priceInUSD,
            };
          }),
        },
      },
      include: {
        items: {
          include: {
            product: true,
            productVariant: true,
          },
        },
      },
    });

    // NO descontamos stock ni limpiamos el carrito aquí
    // Esto se hará cuando se confirme el pago exitosamente

    return order;
  }

  async findAll(userId?: string) {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    return this.prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
            productVariant: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId?: string) {
    const where: any = { id };
    if (userId) {
      where.userId = userId;
    }

    const order = await this.prisma.order.findFirst({
      where,
      include: {
        items: {
          include: {
            product: true,
            productVariant: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(id: string, updateDto: UpdateOrderStatusDto) {
    const order = await this.findOne(id);
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status: updateDto.status,
        paymentStatus: updateDto.paymentStatus,
      },
      include: {
        items: {
          include: {
            product: true,
            productVariant: true,
          },
        },
        user: {
          select: {
            email: true,
            firstName: true,
          },
        },
      },
    });

    // Enviar email de actualización de estado (solo si cambió el estado)
    if (updateDto.status && updateDto.status !== order.status) {
      try {
        await this.emailService.sendOrderStatusUpdateEmail({
          to: updatedOrder.user.email,
          orderNumber: updatedOrder.orderNumber,
          status: updateDto.status,
          firstName: updatedOrder.user.firstName || undefined,
        });
      } catch (error) {
        this.logger.warn(
          'Error enviando email de actualización de pedido',
          error instanceof Error ? error.stack : String(error),
        );
        // No fallar la actualización si el email falla
      }
    }

    return updatedOrder;
  }

  async update(id: string, updateDto: UpdateOrderDto, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
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
      throw new NotFoundException('Order not found');
    }

    // Si se proporciona userId, verificar que la orden pertenece al usuario
    if (userId && order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    // Si se está actualizando el paymentIntentId, significa que el pago fue exitoso
    // En ese caso, confirmamos la orden, descontamos stock y limpiamos el carrito
    if (updateDto.paymentIntentId && order.status === 'PENDING') {
      // VALIDAR paymentIntentId con el proveedor de pagos (idempotencia y autenticidad)
      // Validar que el paymentIntent no fue usado antes (idempotencia)
      const existingOrder = await this.prisma.order.findFirst({
        where: { 
          paymentIntentId: updateDto.paymentIntentId,
          paymentStatus: 'PAID',
          id: { not: id } // Excluir la orden actual
        }
      });
      
      if (existingOrder) {
        throw new BadRequestException('Payment intent already used');
      }
      
      // Si hay un proveedor de pagos configurado, validar con él
      const paymentProvider = this.config.get<string>('PAYMENT_PROVIDER');
      
      if (paymentProvider === 'stripe') {
        const stripeSecretKey = this.config.get<string>('STRIPE_SECRET_KEY');
        if (stripeSecretKey) {
          try {
            const stripe = require('stripe')(stripeSecretKey);
            const paymentIntent = await stripe.paymentIntents.retrieve(updateDto.paymentIntentId);
            
            // Validar que el pago fue exitoso
            if (paymentIntent.status !== 'succeeded') {
              throw new BadRequestException('Payment not confirmed');
            }
            
            // Validar que el monto coincide (Stripe usa centavos)
            const expectedAmount = Math.round(Number(order.total) * 100);
            if (paymentIntent.amount !== expectedAmount) {
              throw new BadRequestException('Payment amount mismatch');
            }
          } catch (error) {
            if (error instanceof BadRequestException) {
              throw error;
            }
            // Si hay error al validar con Stripe, loguear pero no bloquear
            // (puede ser que el proveedor no sea Stripe o la key no esté configurada)
            this.logger.warn(
              `Error validating payment intent with Stripe: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        }
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
          await this.prisma.productVariant.update({
            where: { id: item.productVariantId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        } else {
          await this.prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      // Limpiar carrito
      await this.cartService.clearCart(order.userId);

      // Actualizar orden con paymentIntentId y cambiar estado a PROCESSING
      const updatedOrder = await this.prisma.order.update({
        where: { id },
        data: {
          paymentIntentId: updateDto.paymentIntentId,
          status: 'PROCESSING',
          paymentStatus: 'PAID',
        },
        include: {
          items: {
            include: {
              product: true,
              productVariant: true,
            },
          },
          user: {
            select: {
              email: true,
              firstName: true,
            },
          },
        },
      });

      // Enviar email de confirmación de pedido
      try {
        await this.emailService.sendOrderConfirmationEmail({
          to: updatedOrder.user.email,
          orderNumber: updatedOrder.orderNumber,
          total: Number(updatedOrder.total),
          firstName: updatedOrder.user.firstName || undefined,
        });
      } catch (error) {
        this.logger.warn(
          'Error enviando email de confirmación de pedido',
          error instanceof Error ? error.stack : String(error),
        );
        // No fallar la actualización si el email falla
      }

      return updatedOrder;
    }

    // Si solo se actualiza el paymentIntentId sin cambiar el estado
    return this.prisma.order.update({
      where: { id },
      data: {
        paymentIntentId: updateDto.paymentIntentId,
      },
      include: {
        items: {
          include: {
            product: true,
            productVariant: true,
          },
        },
      },
    });
  }
}
