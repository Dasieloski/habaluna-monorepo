import { Controller, Get, Post, Patch, Param, Body, UseGuards, Query, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { ContentService } from '../content/content.service';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contentService: ContentService,
  ) {}

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats() {
    // Calcular estadísticas reales desde la BD
    const [
      totalOrders,
      totalRevenue,
      totalUsers,
      totalProducts,
      ordersWithPayment,
      recentOrders,
    ] = await Promise.all([
      this.prisma.order.count({
        where: { paymentStatus: 'PAID' },
      }),
      this.prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { total: true },
      }),
      this.prisma.user.count(),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.order.findMany({
        where: { paymentStatus: 'PAID' },
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, firstName: true, lastName: true } } },
      }),
      this.prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, firstName: true, lastName: true } } },
      }),
    ]);

    // Calcular ventas por mes (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyOrders = await this.prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    // Agrupar por mes y contar pedidos
    const salesByMonth = monthlyOrders.reduce((acc: any, order: any) => {
      const month = new Date(order.createdAt).toLocaleString('es-ES', { month: 'short', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = { month, revenue: 0, orders: 0 };
      }
      acc[month].revenue += Number(order.total) || 0;
      acc[month].orders += 1;
      return acc;
    }, {});

    // Inventario
    const [lowStockCount, outOfStockCount, totalStockUnits] = await Promise.all([
      this.prisma.product.count({ where: { stock: { lte: 20, gt: 0 }, isActive: true } }),
      this.prisma.product.count({ where: { stock: 0, isActive: true } }),
      this.prisma.product.aggregate({
        where: { isActive: true },
        _sum: { stock: true },
      }),
    ]);

    // Top productos más vendidos (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPaidOrders = await this.prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: thirtyDaysAgo },
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true } },
          },
        },
      },
    });

    // Contar ventas por producto
    const productSales: Record<string, { name: string; sales: number; revenue: number }> = {};
    recentPaidOrders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        const productId = item.productId;
        const productName = item.product.name;
        const itemTotal = Number(item.price) * item.quantity;
        
        if (!productSales[productId]) {
          productSales[productId] = { name: productName, sales: 0, revenue: 0 };
        }
        productSales[productId].sales += item.quantity;
        productSales[productId].revenue += itemTotal;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)
      .map((p, idx) => ({
        ...p,
        rank: idx + 1,
        revenueFormatted: `$${p.revenue.toFixed(2)}`,
      }));

    // Ventas por categoría (últimos 12 meses, órdenes pagadas)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const ordersForCategory = await this.prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: twelveMonthsAgo },
      },
      include: {
        items: {
          include: {
            product: {
              select: { categoryId: true, category: { select: { name: true } } },
            },
          },
        },
      },
    });
    const categoryRevenue: Record<string, { name: string; revenue: number }> = {};
    ordersForCategory.forEach((order: any) => {
      order.items.forEach((item: any) => {
        const catName = item.product?.category?.name || 'Sin categoría';
        const amt = Number(item.price) * item.quantity;
        if (!categoryRevenue[catName]) categoryRevenue[catName] = { name: catName, revenue: 0 };
        categoryRevenue[catName].revenue += amt;
      });
    });
    const totalCatRevenue = Object.values(categoryRevenue).reduce((s, c) => s + c.revenue, 0) || 1;
    const salesByCategory = Object.values(categoryRevenue).map((c) => ({
      category: c.name,
      sales: Math.round(c.revenue),
      percentage: Math.round((c.revenue / totalCatRevenue) * 100),
      color: ['#7dd3fc', '#fb923c', '#fcd34d', '#a78bfa', '#6ee7b7', '#f472b6', '#94a3b8', '#f87171'][Object.keys(categoryRevenue).indexOf(c.name) % 8],
    }));

    // Comparativa anual: este año vs año anterior por mes
    const now = new Date();
    const thisYearStart = new Date(now.getFullYear(), 0, 1);
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const ordersThisYear = await this.prisma.order.findMany({
      where: { paymentStatus: 'PAID', createdAt: { gte: thisYearStart } },
      select: { total: true, createdAt: true },
    });
    const ordersLastYear = await this.prisma.order.findMany({
      where: { paymentStatus: 'PAID', createdAt: { gte: lastYearStart, lt: thisYearStart } },
      select: { total: true, createdAt: true },
    });
    const byMonthThis: Record<number, number> = {};
    const byMonthLast: Record<number, number> = {};
    monthNames.forEach((_, i) => {
      byMonthThis[i] = 0;
      byMonthLast[i] = 0;
    });
    ordersThisYear.forEach((o: any) => {
      const m = new Date(o.createdAt).getMonth();
      byMonthThis[m] = (byMonthThis[m] || 0) + Number(o.total);
    });
    ordersLastYear.forEach((o: any) => {
      const m = new Date(o.createdAt).getMonth();
      byMonthLast[m] = (byMonthLast[m] || 0) + Number(o.total);
    });
    const monthlyComparison = monthNames.map((month, i) => ({
      month,
      thisYear: Math.round(byMonthThis[i] || 0),
      lastYear: Math.round(byMonthLast[i] || 0),
    }));

    return {
      overview: {
        totalRevenue: Number(totalRevenue._sum.total) || 0,
        totalOrders,
        totalUsers,
        totalProducts,
      },
      salesByMonth: Object.values(salesByMonth),
      salesByCategory,
      monthlyComparison,
      inventory: {
        lowStockCount,
        outOfStockCount,
        totalStockUnits: totalStockUnits._sum.stock || 0,
      },
      recentOrders: recentOrders.map((o: any) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customer: o.user ? `${o.user.firstName || ''} ${o.user.lastName || ''}`.trim() || o.user.email : 'N/A',
        total: Number(o.total),
        status: o.status,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
      })),
      topProducts,
    };
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get system alerts' })
  async getAlerts() {
    // Generar alertas basadas en datos reales
    const alerts: any[] = [];
    
    // Alerta de stock bajo
    const lowStockProducts = await this.prisma.product.findMany({
      where: { stock: { lte: 10, gt: 0 }, isActive: true },
      take: 5,
    });
    
    if (lowStockProducts.length > 0) {
      alerts.push({
        id: 'low-stock',
        type: 'LOW_STOCK',
        message: `${lowStockProducts.length} producto(s) con stock bajo`,
        status: 'NEW',
        createdAt: new Date(),
      });
    }

    // Alerta de productos agotados
    const outOfStockCount = await this.prisma.product.count({
      where: { stock: 0, isActive: true },
    });
    
    if (outOfStockCount > 0) {
      alerts.push({
        id: 'out-of-stock',
        type: 'OUT_OF_STOCK',
        message: `${outOfStockCount} producto(s) agotados`,
        status: 'NEW',
        createdAt: new Date(),
      });
    }

    // Alerta de pedidos pendientes de pago
    const pendingPaymentOrders = await this.prisma.order.count({
      where: { paymentStatus: 'PENDING', createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    });
    
    if (pendingPaymentOrders > 0) {
      alerts.push({
        id: 'pending-payments',
        type: 'PENDING_PAYMENT',
        message: `${pendingPaymentOrders} pedido(s) pendientes de pago`,
        status: 'NEW',
        createdAt: new Date(),
      });
    }

    return alerts;
  }

  @Patch('alerts/:id/resolve')
  @ApiOperation({ summary: 'Mark alert as resolved' })
  async markAlertResolved(@Param('id') id: string) {
    // En una implementación real, esto actualizaría el estado en BD
    return { id, status: 'RESOLVED' };
  }

  @Get('returns')
  @ApiOperation({ summary: 'Get return requests' })
  async getReturnRequests() {
    // Por ahora retornar array vacío (implementar cuando haya tabla de returns)
    return [];
  }

  @Patch('returns/:id')
  @ApiOperation({ summary: 'Update return status' })
  async updateReturnStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return { id, status: body.status };
  }

  @Get('refunds')
  @ApiOperation({ summary: 'Get refunds' })
  async getRefunds() {
    // Por ahora retornar array vacío (implementar cuando haya tabla de refunds)
    return [];
  }

  @Post('refunds')
  @ApiOperation({ summary: 'Process refund' })
  async processRefund(@Body() body: { returnId: string; amount: number; method: string; reason: string }) {
    return { id: `refund-${Date.now()}`, ...body, status: 'PROCESSED', createdAt: new Date() };
  }

  @Get('carts/abandoned')
  @ApiOperation({ summary: 'Get abandoned carts' })
  async getAbandonedCarts() {
    // Buscar carritos (CartItems) que no se han actualizado en la última hora
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const cartItems = await this.prisma.cartItem.findMany({
      where: {
        updatedAt: { lt: oneHourAgo },
      },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
        product: { select: { id: true, name: true, priceUSD: true, images: true } },
        productVariant: { select: { id: true, name: true, priceUSD: true } },
      },
      take: 50,
    });

    // Agrupar por usuario
    const cartsByUser = new Map<string, any>();
    cartItems.forEach((item) => {
      const userId = item.userId;
      if (!cartsByUser.has(userId)) {
        cartsByUser.set(userId, {
          id: userId,
          user: item.user,
          items: [],
          subtotal: 0,
          updatedAt: item.updatedAt,
        });
      }
      const cart = cartsByUser.get(userId);
      cart.items.push({
        id: item.id,
        quantity: item.quantity,
        productName: item.product.name,
        variantName: item.productVariant?.name,
        productId: item.productId,
        productVariantId: item.productVariantId,
        price: item.productVariant?.priceUSD 
          ? Number(item.productVariant.priceUSD) 
          : item.product.priceUSD 
          ? Number(item.product.priceUSD) 
          : 0,
      });
      // Calcular subtotal aproximado
      const price = item.productVariant?.priceUSD 
        ? Number(item.productVariant.priceUSD) 
        : item.product.priceUSD 
        ? Number(item.product.priceUSD) 
        : 0;
      cart.subtotal += price * item.quantity;
      // Actualizar updatedAt al más reciente
      if (item.updatedAt > cart.updatedAt) {
        cart.updatedAt = item.updatedAt;
      }
    });

    return Array.from(cartsByUser.values());
  }

  @Get('audit')
  @ApiOperation({ summary: 'Get audit logs' })
  async getAuditLogs(@Query('limit') limit?: string, @Query('page') page?: string) {
    const take = limit ? parseInt(limit, 10) : 100;
    const skip = page ? (parseInt(page, 10) - 1) * take : 0;

    const logs = await this.prisma.auditLog.findMany({
      take,
      skip,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });

    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      details: log.changes, // El campo en Prisma se llama 'changes'
      ipAddress: log.ipAddress,
      user: log.user,
      createdAt: log.createdAt,
    }));
  }

  @Get('content')
  @ApiOperation({ summary: 'Get content blocks' })
  async getContentBlocks(@Query('section') section?: string) {
    return this.contentService.findAll(section);
  }

  @Post('content')
  @ApiOperation({ summary: 'Create or update content block' })
  async upsertContentBlock(
    @CurrentUser() user: any,
    @Body() body: { slug: string; title: string; content: string; section?: string; isActive?: boolean },
  ) {
    return this.contentService.upsert(
      {
        slug: body.slug,
        title: body.title,
        content: body.content,
        section: body.section,
        isActive: body.isActive ?? true,
      },
      user.id,
    );
  }

  @Delete('content/:slug')
  @ApiOperation({ summary: 'Delete content block' })
  async deleteContentBlock(@CurrentUser() user: any, @Param('slug') slug: string) {
    return this.contentService.delete(slug, user.id);
  }
}
