import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

const variantSelect = {
  id: true,
  productId: true,
  name: true,
  priceUSD: true,
  comparePriceUSD: true,
  sku: true,
  stock: true,
  weight: true,
  unit: true,
  isActive: true,
  order: true,
  createdAt: true,
  updatedAt: true,
} as const;

const productSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  shortDescription: true,
  priceUSD: true,
  comparePriceUSD: true,
  sku: true,
  stock: true,
  isActive: true,
  isFeatured: true,
  isCombo: true,
  adultsOnly: true,
  images: true,
  allergens: true,
  nutritionalInfo: true,
  weight: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class ProductVariantsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductVariantDto: CreateProductVariantDto) {
    // Verificar que el producto existe
    const product = await this.prisma.product.findUnique({
      where: { id: createProductVariantDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.productVariant.create({
      data: createProductVariantDto,
      select: {
        ...variantSelect,
        product: {
          select: productSelect,
        },
      },
    });
  }

  async findAll(productId?: string) {
    const where: any = {};
    if (productId) {
      where.productId = productId;
    }

    return this.prisma.productVariant.findMany({
      where,
      select: {
        ...variantSelect,
        product: {
          select: productSelect,
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
      select: {
        ...variantSelect,
        product: {
          select: productSelect,
        },
      },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    return variant;
  }

  async update(id: string, updateProductVariantDto: UpdateProductVariantDto) {
    await this.findOne(id);
    return this.prisma.productVariant.update({
      where: { id },
      data: updateProductVariantDto,
      select: {
        ...variantSelect,
        product: {
          select: productSelect,
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.productVariant.delete({
      where: { id },
    });
  }
}
