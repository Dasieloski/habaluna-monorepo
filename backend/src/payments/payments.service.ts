import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

interface CreateIntentResult {
  paymentId: string;
  checkoutUrl: string;
  provider: string;
}

interface AdminTransactionsQuery {
  page?: number;
  perPage?: number;
  status?: string;
  search?: string;
}

interface SupernovaCollectionMeta {
  current_page?: string | number;
  from?: string | number;
  last_page?: string | number;
  per_page?: string | number;
  to?: string | number;
  total?: string | number;
}

interface SupernovaCollection<T> {
  data?: T[];
  meta?: SupernovaCollectionMeta;
}

interface ProviderListQuery {
  page?: number;
  perPage?: number;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface SupernovaTransactionResource {
  id: string | number;
  internal_reference?: string;
  merchant_reference?: string | null;
  amount?: number;
  amount_approved?: number;
  currency?: string;
  status?: string;
  type?: string;
  payment_method?: {
    type?: string | null;
    used?: string | null;
  };
  fees?: {
    merchant_fee?: number;
    net_amount?: number;
  };
  customer?: {
    id?: number;
    name?: string | null;
    email?: string | null;
  };
  timestamps?: {
    created_at?: string;
    processed_at?: string;
  };
  links?: {
    self?: string;
    refunds?: string;
  };
}

interface SupernovaRefundResource {
  id: string | number;
  transaction_id?: string | number;
  amount?: number;
  currency?: string;
  reason?: string | null;
  status?: string;
  timestamps?: {
    requested_at?: string;
    processed_at?: string;
    created_at?: string;
  };
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly providerName = 'supernova';

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private getApiBaseUrl(): string {
    return (
      this.config.get<string>('SUPERNOVA_API_URL') ?? 'https://sp-qa.supernova-payments.com/api/v1'
    );
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

  private buildProviderHeaders(): Record<string, string> {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-api-key': this.getApiKey(),
      'x-api-secret': this.getApiSecret(),
    };
  }

  private buildQueryString(params: Record<string, string | number | undefined>): string {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') {
        continue;
      }
      searchParams.set(key, String(value));
    }

    const query = searchParams.toString();
    return query ? `?${query}` : '';
  }

  private safeNumber(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private normalizeGatewayStatus(status?: string): 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' {
    const normalized = String(status ?? '')
      .trim()
      .toLowerCase();

    if (normalized === 'approved' || normalized === 'success') {
      return 'PAID';
    }

    if (
      normalized === 'refunded' ||
      normalized === 'partially_refunded' ||
      normalized === 'partial_refunded'
    ) {
      return 'REFUNDED';
    }

    if (normalized === 'failed' || normalized === 'rejected' || normalized === 'cancelled') {
      return 'FAILED';
    }

    return 'PENDING';
  }

  private async fetchProviderJson<T>(path: string): Promise<T> {
    const apiBase = this.getApiBaseUrl();

    let response: Response;
    try {
      response = await fetch(`${apiBase}${path}`, {
        method: 'GET',
        headers: this.buildProviderHeaders(),
      });
    } catch (error) {
      this.logger.error(
        `Error calling Supernova ${path}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('Error consultando la pasarela de pagos');
    }

    const raw = await response.text();
    let payload: any = {};

    if (raw) {
      try {
        payload = JSON.parse(raw);
      } catch {
        payload = { raw };
      }
    }

    if (!response.ok) {
      const message =
        payload?.message || `Supernova error: ${response.status} ${response.statusText}`;
      this.logger.warn(`Supernova ${path} failed: ${message}`);
      throw new BadRequestException('No se pudo consultar la pasarela de pagos');
    }

    return payload as T;
  }

  private async fetchAllProviderItems<T>(
    path: '/transactions' | '/refunds',
    params: Omit<ProviderListQuery, 'page'> = {},
  ): Promise<T[]> {
    const perPage = Math.min(100, Math.max(1, Math.floor(Number(params.perPage) || 100)));
    const allItems: T[] = [];
    let page = 1;
    let lastPage = 1;

    do {
      const response = await this.fetchProviderJson<SupernovaCollection<T>>(
        `${path}${this.buildQueryString({
          page,
          per_page: perPage,
          status: params.status,
          search: params.search,
          date_from: params.dateFrom,
          date_to: params.dateTo,
        })}`,
      );

      const currentItems = Array.isArray(response.data) ? response.data : [];
      allItems.push(...currentItems);

      const parsedLastPage = this.safeNumber(response.meta?.last_page);
      lastPage = parsedLastPage > 0 ? parsedLastPage : page;
      page += 1;
    } while (page <= lastPage && page <= 50);

    return allItems;
  }

  async getAdminFinancialSummary() {
    const now = new Date();
    const thisYearStart = new Date(now.getFullYear(), 0, 1);
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [transactions, refunds] = await Promise.all([
      this.fetchAllProviderItems<SupernovaTransactionResource>('/transactions', {
        perPage: 100,
        dateFrom: lastYearStart.toISOString(),
      }),
      this.fetchAllProviderItems<SupernovaRefundResource>('/refunds', {
        perPage: 100,
        dateFrom: lastYearStart.toISOString(),
      }),
    ]);

    const approvedTransactions = transactions.filter((transaction) => {
      const status = String(transaction.status ?? '')
        .trim()
        .toLowerCase();
      return status === 'approved' || status === 'success';
    });

    const refundedAmount = refunds
      .filter((refund) => {
        const status = String(refund.status ?? '')
          .trim()
          .toLowerCase();
        return status === 'approved' || status === 'processing';
      })
      .reduce((sum, refund) => sum + this.safeNumber(refund.amount), 0);

    const totalRevenue = approvedTransactions.reduce(
      (sum, transaction) =>
        sum + this.safeNumber(transaction.amount_approved ?? transaction.amount),
      0,
    );

    const failedTransactions = transactions.filter((transaction) => {
      const status = String(transaction.status ?? '')
        .trim()
        .toLowerCase();
      return status === 'failed' || status === 'rejected';
    }).length;

    const salesByMonthMap = new Map<string, { month: string; revenue: number; orders: number }>();
    const monthFormatter = new Intl.DateTimeFormat('es-ES', {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });

    for (const transaction of approvedTransactions) {
      const rawDate = transaction.timestamps?.processed_at ?? transaction.timestamps?.created_at;
      if (!rawDate) {
        continue;
      }

      const transactionDate = new Date(rawDate);
      if (Number.isNaN(transactionDate.getTime()) || transactionDate < sixMonthsAgo) {
        continue;
      }

      const monthKey = transactionDate.toISOString().slice(0, 7);
      const amount = this.safeNumber(transaction.amount_approved ?? transaction.amount);
      const current = salesByMonthMap.get(monthKey) ?? {
        month: monthFormatter.format(transactionDate),
        revenue: 0,
        orders: 0,
      };

      current.revenue += amount;
      current.orders += 1;
      salesByMonthMap.set(monthKey, current);
    }

    const monthNames = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];
    const byMonthThis: Record<number, number> = {};
    const byMonthLast: Record<number, number> = {};
    monthNames.forEach((_, index) => {
      byMonthThis[index] = 0;
      byMonthLast[index] = 0;
    });

    for (const transaction of approvedTransactions) {
      const rawDate = transaction.timestamps?.processed_at ?? transaction.timestamps?.created_at;
      if (!rawDate) {
        continue;
      }

      const transactionDate = new Date(rawDate);
      if (Number.isNaN(transactionDate.getTime())) {
        continue;
      }

      const month = transactionDate.getMonth();
      const amount = this.safeNumber(transaction.amount_approved ?? transaction.amount);

      if (transactionDate >= thisYearStart) {
        byMonthThis[month] = (byMonthThis[month] || 0) + amount;
        continue;
      }

      if (transactionDate >= lastYearStart && transactionDate < thisYearStart) {
        byMonthLast[month] = (byMonthLast[month] || 0) + amount;
      }
    }

    return {
      source: this.providerName,
      totalRevenue,
      refundedAmount,
      successfulTransactions: approvedTransactions.length,
      failedTransactions,
      salesByMonth: Array.from(salesByMonthMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, value]) => ({
          month: value.month,
          revenue: Number(value.revenue.toFixed(2)),
          orders: value.orders,
        })),
      monthlyComparison: monthNames.map((month, index) => ({
        month,
        thisYear: Math.round(byMonthThis[index] || 0),
        lastYear: Math.round(byMonthLast[index] || 0),
      })),
    };
  }

  private async getOrderForPaymentAdmin(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        payments: {
          where: { provider: this.providerName },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            providerPaymentId: true,
            status: true,
            amount: true,
            currency: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    return order;
  }

  private resolveProviderTransactionId(
    order: Awaited<ReturnType<typeof this.getOrderForPaymentAdmin>>,
  ) {
    return (
      String(order.paymentIntentId || order.payments[0]?.providerPaymentId || '').trim() || null
    );
  }

  private async fetchProviderTransactionById(providerTransactionId: string) {
    try {
      const response = await this.fetchProviderJson<{ data?: SupernovaTransactionResource }>(
        `/transactions/${encodeURIComponent(providerTransactionId)}`,
      );
      return response.data ?? null;
    } catch (error) {
      this.logger.warn(
        `Could not fetch Supernova transaction ${providerTransactionId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  private buildOrderPaymentReconciliation(
    order: Awaited<ReturnType<typeof this.getOrderForPaymentAdmin>>,
    gatewayTransaction: SupernovaTransactionResource | null,
  ) {
    const localPayment = order.payments[0] ?? null;
    const providerTransactionId = this.resolveProviderTransactionId(order);
    const gatewayPaymentStatus = gatewayTransaction
      ? this.normalizeGatewayStatus(gatewayTransaction.status)
      : null;
    const gatewayStatus = gatewayTransaction
      ? String(gatewayTransaction.status ?? '')
          .trim()
          .toLowerCase()
      : null;

    return {
      source: this.providerName,
      orderId: order.id,
      orderNumber: order.orderNumber,
      local: {
        orderStatus: order.status,
        paymentStatus: order.paymentStatus,
        paymentIntentId: order.paymentIntentId,
        latestPayment: localPayment,
      },
      gateway: gatewayTransaction
        ? {
            providerTransactionId: String(gatewayTransaction.id),
            status: gatewayStatus,
            paymentStatus: gatewayPaymentStatus,
            amount: this.safeNumber(gatewayTransaction.amount),
            approvedAmount: this.safeNumber(
              gatewayTransaction.amount_approved ?? gatewayTransaction.amount,
            ),
            currency: String(gatewayTransaction.currency ?? order.currency).toUpperCase(),
            paymentMethodType: gatewayTransaction.payment_method?.type ?? null,
            paymentMethodUsed: gatewayTransaction.payment_method?.used ?? null,
            createdAt: gatewayTransaction.timestamps?.created_at ?? null,
            processedAt: gatewayTransaction.timestamps?.processed_at ?? null,
            rawPayload: gatewayTransaction,
          }
        : {
            providerTransactionId,
            status: null,
            paymentStatus: null,
            amount: null,
            approvedAmount: null,
            currency: order.currency,
            paymentMethodType: null,
            paymentMethodUsed: null,
            createdAt: null,
            processedAt: null,
            rawPayload: null,
          },
      hasGatewayTransaction: Boolean(gatewayTransaction),
      hasMismatch: Boolean(gatewayPaymentStatus) && gatewayPaymentStatus !== order.paymentStatus,
    };
  }

  async getAdminOrderPaymentReconciliation(orderId: string) {
    const order = await this.getOrderForPaymentAdmin(orderId);
    const providerTransactionId = this.resolveProviderTransactionId(order);
    const gatewayTransaction = providerTransactionId
      ? await this.fetchProviderTransactionById(providerTransactionId)
      : null;

    return this.buildOrderPaymentReconciliation(order, gatewayTransaction);
  }

  async resyncAdminOrderPayment(orderId: string) {
    const order = await this.getOrderForPaymentAdmin(orderId);
    const providerTransactionId = this.resolveProviderTransactionId(order);

    if (!providerTransactionId) {
      throw new BadRequestException('Order has no provider transaction id to synchronize');
    }

    const gatewayTransaction = await this.fetchProviderTransactionById(providerTransactionId);

    if (!gatewayTransaction) {
      throw new BadRequestException('Provider transaction could not be retrieved');
    }

    const normalizedGatewayStatus = this.normalizeGatewayStatus(gatewayTransaction.status);
    const payload = { data: gatewayTransaction };

    if (normalizedGatewayStatus === 'PAID') {
      await this.markPaymentAsPaid(providerTransactionId, payload);
    } else if (normalizedGatewayStatus === 'FAILED') {
      await this.prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findFirst({
          where: {
            orderId,
            provider: this.providerName,
            providerPaymentId: providerTransactionId,
          },
        });

        if (payment) {
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: 'FAILED',
              errorMessage: `Synchronized from gateway status ${gatewayTransaction.status}`,
              rawPayload: gatewayTransaction as any,
            },
          });
        }

        await tx.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'FAILED',
            paymentIntentId: providerTransactionId,
          },
        });
      });
    } else if (normalizedGatewayStatus === 'REFUNDED') {
      await this.prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findFirst({
          where: {
            orderId,
            provider: this.providerName,
            providerPaymentId: providerTransactionId,
          },
        });

        if (payment) {
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: 'REFUNDED',
              rawPayload: gatewayTransaction as any,
            },
          });
        }

        await tx.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'REFUNDED',
            paymentIntentId: providerTransactionId,
          },
        });
      });
    } else {
      await this.prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findFirst({
          where: {
            orderId,
            provider: this.providerName,
            providerPaymentId: providerTransactionId,
          },
        });

        if (payment) {
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: 'PENDING',
              rawPayload: gatewayTransaction as any,
              errorMessage: null,
            },
          });
        }

        if (order.paymentStatus !== 'PAID') {
          await tx.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: 'PENDING',
              paymentIntentId: providerTransactionId,
            },
          });
        }
      });
    }

    return this.getAdminOrderPaymentReconciliation(orderId);
  }

  async getAdminTransactions(params: AdminTransactionsQuery) {
    const page = Math.max(1, Math.floor(Number(params.page) || 1));
    const perPage = Math.min(100, Math.max(1, Math.floor(Number(params.perPage) || 50)));
    const status =
      String(params.status ?? '')
        .trim()
        .toLowerCase() || undefined;
    const search = String(params.search ?? '').trim() || undefined;

    let gatewayTransactions: SupernovaTransactionResource[] = [];
    let gatewayRefunds: SupernovaRefundResource[] = [];
    let gatewayMeta: SupernovaCollectionMeta | undefined;
    let source = this.providerName;

    try {
      const transactionsResponse = await this.fetchProviderJson<
        SupernovaCollection<SupernovaTransactionResource>
      >(
        `/transactions${this.buildQueryString({
          page,
          per_page: perPage,
          status,
          search,
        })}`,
      );
      gatewayTransactions = Array.isArray(transactionsResponse.data)
        ? transactionsResponse.data
        : [];
      gatewayMeta = transactionsResponse.meta;
    } catch (error) {
      source = 'local-payments-fallback';
      this.logger.warn(
        `Falling back to local payments for admin transactions: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    try {
      const refundsResponse = await this.fetchProviderJson<
        SupernovaCollection<SupernovaRefundResource>
      >(
        `/refunds${this.buildQueryString({
          page: 1,
          per_page: 100,
        })}`,
      );
      gatewayRefunds = Array.isArray(refundsResponse.data) ? refundsResponse.data : [];
    } catch (error) {
      this.logger.warn(
        `Could not retrieve gateway refunds for admin finance: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    const [localPayments, localRefundTotals] = await Promise.all([
      this.prisma.payment.findMany({
        where: { provider: this.providerName },
        orderBy: { createdAt: 'desc' },
        take: Math.max(perPage * 5, 300),
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              paymentStatus: true,
              total: true,
              grandTotal: true,
              currency: true,
              createdAt: true,
              user: {
                select: {
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.refund.aggregate({
        where: { status: 'PROCESSED' },
        _sum: { amount: true },
      }),
    ]);

    const gatewayTransactionIds = gatewayTransactions.map((transaction) => String(transaction.id));
    const gatewayOrderReferences = Array.from(
      new Set(
        gatewayTransactions.flatMap((transaction) =>
          [transaction.merchant_reference, transaction.internal_reference]
            .map((value) => String(value ?? '').trim())
            .filter(Boolean),
        ),
      ),
    );

    const extraMatchedOrders =
      gatewayTransactionIds.length || gatewayOrderReferences.length
        ? await this.prisma.order.findMany({
            where: {
              OR: [
                ...(gatewayTransactionIds.length
                  ? [{ paymentIntentId: { in: gatewayTransactionIds } }]
                  : []),
                ...(gatewayOrderReferences.length
                  ? [{ orderNumber: { in: gatewayOrderReferences } }]
                  : []),
              ],
            },
            select: {
              id: true,
              orderNumber: true,
              paymentIntentId: true,
              status: true,
              paymentStatus: true,
              total: true,
              grandTotal: true,
              currency: true,
              createdAt: true,
              user: {
                select: {
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
              payments: {
                where: { provider: this.providerName },
                orderBy: { createdAt: 'desc' },
                select: {
                  id: true,
                  providerPaymentId: true,
                  status: true,
                  amount: true,
                  currency: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
            },
          })
        : [];

    const gatewayTransactionsById = new Map(
      gatewayTransactions.map((transaction) => [String(transaction.id), transaction]),
    );

    const localPaymentsByTransactionId = new Map(
      localPayments.map((payment) => [String(payment.providerPaymentId), payment]),
    );

    const extraOrdersByOrderNumber = new Map(
      extraMatchedOrders.map((order) => [String(order.orderNumber), order]),
    );
    const extraOrdersByTransactionId = new Map(
      extraMatchedOrders
        .filter((order) => order.paymentIntentId)
        .map((order) => [String(order.paymentIntentId), order]),
    );

    const allTransactionIds = Array.from(
      new Set([
        ...gatewayTransactions.map((transaction) => String(transaction.id)),
        ...localPayments.map((payment) => String(payment.providerPaymentId)),
      ]),
    );

    const mergedData = allTransactionIds.map((providerTransactionId) => {
      const gatewayTransaction = gatewayTransactionsById.get(providerTransactionId) ?? null;
      const localPayment = localPaymentsByTransactionId.get(providerTransactionId) ?? null;
      const references = gatewayTransaction
        ? [gatewayTransaction.merchant_reference, gatewayTransaction.internal_reference]
            .map((value) => String(value ?? '').trim())
            .filter(Boolean)
        : [];

      const matchedOrderFromGateway =
        extraOrdersByTransactionId.get(providerTransactionId) ||
        references.map((reference) => extraOrdersByOrderNumber.get(reference)).find(Boolean) ||
        null;

      const order = localPayment?.order ?? matchedOrderFromGateway ?? null;
      const localPaymentStatus = localPayment?.status ?? null;
      const localOrderPaymentStatus = order?.paymentStatus ?? null;
      const gatewayStatus = gatewayTransaction
        ? String(gatewayTransaction.status ?? '')
            .trim()
            .toLowerCase()
        : null;
      const normalizedPaymentStatus = gatewayTransaction
        ? this.normalizeGatewayStatus(gatewayTransaction.status)
        : (localPaymentStatus ?? localOrderPaymentStatus ?? 'PENDING');
      const amount = gatewayTransaction
        ? this.safeNumber(gatewayTransaction.amount)
        : this.safeNumber(localPayment?.amount ?? order?.grandTotal ?? order?.total);
      const approvedAmount = gatewayTransaction
        ? this.safeNumber(gatewayTransaction.amount_approved ?? gatewayTransaction.amount)
        : normalizedPaymentStatus === 'PAID'
          ? this.safeNumber(localPayment?.amount ?? order?.grandTotal ?? order?.total)
          : amount;

      return {
        id: `supernova-${providerTransactionId}`,
        source,
        providerTransactionId,
        providerReference:
          gatewayTransaction?.merchant_reference ?? gatewayTransaction?.internal_reference ?? null,
        gatewayStatus,
        paymentStatus: normalizedPaymentStatus,
        amount,
        approvedAmount,
        currency: String(
          gatewayTransaction?.currency ?? localPayment?.currency ?? order?.currency ?? 'USD',
        ).toUpperCase(),
        orderId: order?.id ?? null,
        orderNumber: order?.orderNumber ?? null,
        orderTotal: this.safeNumber(order?.grandTotal ?? order?.total),
        localOrderStatus: order?.status ?? null,
        localOrderPaymentStatus,
        localPaymentId: localPayment?.id ?? null,
        localPaymentStatus,
        paymentMethodType: gatewayTransaction?.payment_method?.type ?? null,
        paymentMethodUsed: gatewayTransaction?.payment_method?.used ?? null,
        paymentMethodLabel:
          gatewayTransaction?.payment_method?.used ||
          gatewayTransaction?.payment_method?.type ||
          'Tarjeta',
        merchantFee: this.safeNumber(gatewayTransaction?.fees?.merchant_fee),
        netAmount: this.safeNumber(gatewayTransaction?.fees?.net_amount),
        customerName:
          gatewayTransaction?.customer?.name ||
          [order?.user?.firstName, order?.user?.lastName].filter(Boolean).join(' ') ||
          null,
        customerEmail: gatewayTransaction?.customer?.email || order?.user?.email || null,
        createdAt:
          gatewayTransaction?.timestamps?.created_at ||
          localPayment?.createdAt ||
          order?.createdAt ||
          null,
        processedAt: gatewayTransaction?.timestamps?.processed_at ?? null,
        rawPayload: gatewayTransaction ?? null,
      };
    });

    const filteredData = mergedData
      .filter((transaction) => {
        if (!status) {
          return true;
        }

        return (
          String(transaction.gatewayStatus ?? '').toLowerCase() === status ||
          String(transaction.paymentStatus ?? '').toLowerCase() === status
        );
      })
      .filter((transaction) => {
        if (!search) {
          return true;
        }

        const haystack = [
          transaction.providerTransactionId,
          transaction.providerReference,
          transaction.orderNumber,
          transaction.customerName,
          transaction.customerEmail,
        ]
          .map((value) => String(value ?? '').toLowerCase())
          .join(' ');

        return haystack.includes(search.toLowerCase());
      })
      .sort((a, b) => {
        const dateA = new Date(a.processedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.processedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      });

    const start = (page - 1) * perPage;
    const data = filteredData.slice(start, start + perPage);

    const realizedTransactions = filteredData.filter(
      (transaction) =>
        transaction.paymentStatus === 'PAID' &&
        (transaction.localOrderPaymentStatus === 'PAID' ||
          transaction.localPaymentStatus === 'PAID'),
    );

    const totalRevenue = realizedTransactions.reduce(
      (sum, transaction) => sum + (transaction.orderTotal || transaction.approvedAmount),
      0,
    );

    const successfulTransactions = realizedTransactions.length;

    const failedTransactions = filteredData.filter(
      (transaction) =>
        transaction.paymentStatus === 'FAILED' ||
        ['failed', 'rejected'].includes(String(transaction.gatewayStatus ?? '')),
    ).length;

    const gatewayRefundedAmount = gatewayRefunds
      .filter((refund) => {
        const refundStatus = String(refund.status ?? '')
          .trim()
          .toLowerCase();
        return refundStatus === 'approved' || refundStatus === 'processing';
      })
      .reduce((sum, refund) => sum + this.safeNumber(refund.amount), 0);

    const refundedAmount =
      gatewayRefundedAmount > 0
        ? gatewayRefundedAmount
        : this.safeNumber(localRefundTotals._sum.amount);

    return {
      source:
        gatewayTransactions.length > 0
          ? source === this.providerName
            ? 'supernova+local'
            : source
          : 'local-payments-fallback',
      data,
      meta: {
        page,
        perPage,
        total: filteredData.length,
        lastPage: Math.max(1, Math.ceil(filteredData.length / perPage)),
        providerTotal: this.safeNumber(gatewayMeta?.total),
      },
      stats: {
        totalRevenue,
        successfulTransactions,
        failedTransactions,
        refundedAmount,
      },
    };
  }

  async createIntentForOrder(orderId: string, userId: string): Promise<CreateIntentResult> {
    const normalizedOrderId = String(orderId ?? '').trim();
    if (!normalizedOrderId) {
      throw new BadRequestException('Order id is required');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: normalizedOrderId },
      include: { user: true },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.userId !== userId) {
      throw new BadRequestException('Order not found');
    }

    // Seguridad: nunca permitir generar links para órdenes ya pagadas
    // o que ya avanzaron en el flujo operativo.
    if (order.paymentStatus === 'PAID') {
      throw new BadRequestException('Order is already paid');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is not pending payment');
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

    this.logger.log(
      `Creating Supernova payment link for order ${order.id} (${order.orderNumber}) amount=${Number(order.grandTotal ?? order.total)}`,
    );

    const apiBase = this.getApiBaseUrl();
    const apiKey = this.getApiKey();
    const apiSecret = this.getApiSecret();

    const url = `${apiBase}/payment-links`;

    const customerName =
      `${order.user?.firstName ?? ''} ${order.user?.lastName ?? ''}`.trim() ||
      order.user?.email ||
      'Cliente';
    const customerEmail = order.user?.email || 'user@example.com';
    const customerPhone = (order.user?.phone || '123456789').trim();

    // Igualar el request a la llamada exitosa de Postman.
    const body = {
      amount: Number(order.grandTotal ?? order.total),
      currency: (order.currency || 'USD').toString().toUpperCase().slice(0, 3),
      description: `Pedido ${order.orderNumber}`,
      reference: order.orderNumber,
      single_use: true,
      expires_in_hours: 1,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
      metadata: [`orderId:${order.id}`],
    };

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'x-api-secret': apiSecret,
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      this.logger.error(
        'Error calling Supernova /payment-links',
        error instanceof Error ? error.stack : String(error),
      );
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
      this.logger.error(
        `Supernova /payment-links response missing fields: ${JSON.stringify(data)}`,
      );
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
  async handleWebhook(
    rawBody: string,
    headers: Record<string, string | string[] | undefined>,
  ): Promise<void> {
    const signature = (headers['x-webhook-signature'] || headers['X-Webhook-Signature']) as
      | string
      | undefined;
    const eventType = (headers['x-webhook-event'] || headers['X-Webhook-Event']) as
      | string
      | undefined;
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
      this.logger.log(
        `Ignoring Supernova webhook with status=${status} for transaction ${transactionId}`,
      );
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
              product: {
                select: {
                  id: true,
                  name: true,
                  stock: true,
                },
              },
              productVariant: {
                select: {
                  id: true,
                  productId: true,
                  name: true,
                  stock: true,
                },
              },
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
