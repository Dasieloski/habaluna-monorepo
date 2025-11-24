import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    try {
      console.log('📦 Creando producto:', {
        name: createProductDto.name,
        slug: createProductDto.slug,
        categoryId: createProductDto.categoryId,
        images: createProductDto.images?.length || 0,
        allergens: createProductDto.allergens?.length || 0,
      });

      // Preparar datos asegurando que los arrays estén presentes
      const productData: any = {
        name: createProductDto.name,
        slug: createProductDto.slug,
        description: createProductDto.description,
        categoryId: createProductDto.categoryId,
        stock: createProductDto.stock ?? 0,
        isActive: createProductDto.isActive ?? true,
        isFeatured: createProductDto.isFeatured ?? false,
        allergens: Array.isArray(createProductDto.allergens) ? createProductDto.allergens : [],
        images: Array.isArray(createProductDto.images) ? createProductDto.images : [],
      };

      // Campos opcionales
      if (createProductDto.shortDescription) {
        productData.shortDescription = createProductDto.shortDescription;
      }
      if (createProductDto.sku) {
        productData.sku = createProductDto.sku;
      }
      if (createProductDto.priceUSD !== undefined && createProductDto.priceUSD !== null) {
        productData.priceUSD = createProductDto.priceUSD;
      }
      if (createProductDto.priceMNs !== undefined && createProductDto.priceMNs !== null) {
        productData.priceMNs = createProductDto.priceMNs;
      }
      if (createProductDto.comparePriceUSD !== undefined && createProductDto.comparePriceUSD !== null) {
        productData.comparePriceUSD = createProductDto.comparePriceUSD;
      }
      if (createProductDto.comparePriceMNs !== undefined && createProductDto.comparePriceMNs !== null) {
        productData.comparePriceMNs = createProductDto.comparePriceMNs;
      }
      if (createProductDto.weight !== undefined && createProductDto.weight !== null) {
        productData.weight = createProductDto.weight;
      }
      if (createProductDto.nutritionalInfo) {
        productData.nutritionalInfo = createProductDto.nutritionalInfo;
      }

      console.log('📦 Datos preparados para Prisma:', {
        ...productData,
        description: productData.description?.substring(0, 50) + '...',
      });

      const product = await this.prisma.product.create({
        data: productData,
        include: { category: true },
      });

      console.log('✅ Producto creado exitosamente:', product.id);
      return product;
    } catch (error: any) {
      console.error('❌ Error al crear producto:', {
        message: error.message,
        code: error.code,
        meta: error.meta,
        cause: error.cause,
      });
      throw error;
    }
  }

  async findAll(pagination: PaginationDto, filters?: any) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { 
          category: true,
          variants: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { 
        category: true,
        variants: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { 
        category: true,
        variants: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: { category: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.delete({
      where: { id },
    });
  }
}

