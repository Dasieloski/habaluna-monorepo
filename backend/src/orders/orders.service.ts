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

    // Aplicar cupón/offer en backend (si viene código)
    let discountTotal = 0;
    let appliedOfferId: string | undefined = createOrderDto.offerId;

    if (createOrderDto.offerCode) {
      const result = await this.offersService.validateOffer(createOrderDto.offerCode, subtotal);
      if (!result.valid) {
        throw new BadRequestException(result.message || 'Invalid offer code');
      }
      discountTotal = result.discount;
      if (result.offer) {
        appliedOfferId = result.offer.id;
      }
    }

    // Total neto realmente a cobrar
    const grandTotal = subtotal - discountTotal + tax + Number(shipping);
    const total = grandTotal; // compatibilidad con el campo legacy `total`

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
        discountTotal,
        grandTotal,
        shippingAddress: shippingAddressPlain,
        billingAddress: billingAddressPlain,
        paymentIntentId: createOrderDto.paymentIntentId,
        offerId: appliedOfferId,
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

    // Ya no se permite confirmar pagos desde este endpoint.
    // La confirmación de pago debe realizarse exclusivamente mediante el webhook del proveedor.
    if (updateDto.paymentIntentId) {
      throw new BadRequestException('Payment confirmation must come from payment provider webhook');
    }

    // Actualizaciones genéricas de la orden (hoy sólo soportamos paymentIntentId, por compatibilidad futura)
    return this.prisma.order.update({
      where: { id },
      data: {},
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
