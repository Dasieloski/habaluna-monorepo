import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTransportConfigDto } from './dto/update-transport-config.dto';

export interface TransportRule {
  minProducts: number;
  discountType: 'percent' | 'fixed';
  discountValue: number;
}

export interface TransportConfigModel {
  id: string;
  baseCost: number;
  discountsEnabled: boolean;
  rules: TransportRule[];
  noDiscountMessage: string | null;
}

export interface ComputeResult {
  shipping: number;
  baseCost: number;
  appliedRule: TransportRule | null;
  amountOff: number;
  messageKey: 'discount' | 'transparent' | 'optimized' | 'fair';
}

const POSITIVE_MESSAGES: Record<ComputeResult['messageKey'], string> = {
  discount: '', // Se reemplaza por el descuento aplicado
  transparent: '🤝 Envío con tarifa transparente, sin sobrecostos',
  optimized: '📦 Transporte optimizado para tu pedido',
  fair: '🚚 Transporte calculado al costo justo',
};

@Injectable()
export class TransportConfigService {
  constructor(private prisma: PrismaService) {}

  private defaults(): { baseCost: number; discountsEnabled: boolean; rules: TransportRule[]; noDiscountMessage: string | null } {
    return {
      baseCost: 5.99,
      discountsEnabled: false,
      rules: [],
      noDiscountMessage: '🚚 Transporte calculado al costo justo',
    };
  }

  private async getOrCreate(): Promise<{ id: string; baseCost: any; discountsEnabled: boolean; rules: any; noDiscountMessage: string | null }> {
    const existing = await this.prisma.transportConfig.findFirst();
    if (existing) {
      return {
        id: existing.id,
        baseCost: existing.baseCost,
        discountsEnabled: existing.discountsEnabled,
        rules: (existing.rules as TransportRule[]) ?? [],
        noDiscountMessage: existing.noDiscountMessage,
      };
    }
    const d = this.defaults();
    const created = await this.prisma.transportConfig.create({
      data: {
        baseCost: d.baseCost,
        discountsEnabled: d.discountsEnabled,
        rules: d.rules as any,
        noDiscountMessage: d.noDiscountMessage,
      },
    });
    return {
      id: created.id,
      baseCost: created.baseCost,
      discountsEnabled: created.discountsEnabled,
      rules: (created.rules as TransportRule[]) ?? [],
      noDiscountMessage: created.noDiscountMessage,
    };
  }

  /** Obtener config pública (frontend, estimados) */
  async getPublic(): Promise<TransportConfigModel> {
    const row = await this.getOrCreate();
    return {
      id: row.id,
      baseCost: Number(row.baseCost),
      discountsEnabled: row.discountsEnabled,
      rules: Array.isArray(row.rules) ? row.rules : [],
      noDiscountMessage: row.noDiscountMessage,
    };
  }

  async getAdmin(): Promise<TransportConfigModel> {
    return this.getPublic();
  }

  async updateAdmin(dto: UpdateTransportConfigDto): Promise<TransportConfigModel> {
    const current = await this.getOrCreate();
    const data: any = {};
    if (dto.baseCost !== undefined) data.baseCost = dto.baseCost;
    if (dto.discountsEnabled !== undefined) data.discountsEnabled = dto.discountsEnabled;
    if (dto.rules !== undefined) data.rules = dto.rules;
    if (dto.noDiscountMessage !== undefined) data.noDiscountMessage = dto.noDiscountMessage || null;
    await this.prisma.transportConfig.update({
      where: { id: current.id },
      data,
    });
    return this.getPublic();
  }

  /**
   * Calcular costo de transporte para un número de unidades.
   * itemCount = suma de cantidades en el carrito.
   */
  computeShipping(itemCount: number, config?: TransportConfigModel | null): ComputeResult {
    const cfg = config ?? null;
    const baseCost = cfg ? Number(cfg.baseCost) : 5.99;
    const rules: TransportRule[] = (cfg?.rules && Array.isArray(cfg.rules)) ? cfg.rules : [];
    const discountsEnabled = cfg?.discountsEnabled ?? false;

    let shipping = baseCost;
    let appliedRule: TransportRule | null = null;
    let amountOff = 0;

    if (discountsEnabled && rules.length > 0 && itemCount > 0) {
      // Ordenar por minProducts descendente para aplicar la regla más alta que cumpla
      const sorted = [...rules].sort((a, b) => b.minProducts - a.minProducts);
      for (const r of sorted) {
        if (itemCount >= r.minProducts) {
          appliedRule = r;
          if (r.discountType === 'percent') {
            const p = Math.min(100, Math.max(0, r.discountValue));
            amountOff = (baseCost * p) / 100;
          } else {
            amountOff = Math.min(baseCost, Math.max(0, r.discountValue));
          }
          shipping = Math.max(0, baseCost - amountOff);
          break;
        }
      }
    }

    const keys: ComputeResult['messageKey'][] = ['transparent', 'optimized', 'fair'];
    const messageKey: ComputeResult['messageKey'] = appliedRule ? 'discount' : keys[itemCount % 3];

    return { shipping, baseCost, appliedRule, amountOff, messageKey };
  }

  /** Para el endpoint de estimado: usa la config actual. */
  async estimate(itemCount: number): Promise<ComputeResult & { positiveMessage: string; config: TransportConfigModel }> {
    const config = await this.getPublic();
    const result = this.computeShipping(itemCount, config);
    const positiveMessage =
      config.noDiscountMessage?.trim() || POSITIVE_MESSAGES[result.messageKey];
    return { ...result, positiveMessage, config };
  }

  getPositiveMessage(key: ComputeResult['messageKey'], custom: string | null): string {
    if (custom?.trim()) return custom.trim();
    return POSITIVE_MESSAGES[key];
  }
}
