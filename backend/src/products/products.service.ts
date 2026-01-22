import { BadRequestException, ConflictException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { LowStockAlertDto } from './dto/low-stock-alert.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private prisma: PrismaService) {}

  async bulkStockUpdate(items: { productId: string; variantId?: string; stock: number }[]) {
    const results = [];
    
    // Ejecutar en transacción para integridad
    await this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        if (item.variantId) {
          const updated = await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: item.stock },
          });
          results.push(updated);
        } else {
          const updated = await tx.product.update({
            where: { id: item.productId },
            data: { stock: item.stock },
          });
          results.push(updated);
        }
      }
    });

    return { count: results.length, message: 'Stock updated successfully' };
  }

  async create(createProductDto: CreateProductDto) {
    try {
      this.logger.log('Creando producto', 'ProductsService', {
        name: createProductDto.name,
        slug: createProductDto.slug,
        categoryId: createProductDto.categoryId,
        imagesCount: createProductDto.images?.length || 0,
        allergensCount: createProductDto.allergens?.length || 0,
        isCombo: (createProductDto as any).isCombo ?? false,
      });

      const { comboItems, ...rest } = createProductDto as any;

      // Preparar datos asegurando que los arrays estén presentes
      const productData: any = {
        name: rest.name,
        slug: rest.slug,
        description: rest.description,
        categoryId: rest.categoryId,
        stock: rest.stock ?? 0,
        isActive: rest.isActive ?? true,
        isFeatured: rest.isFeatured ?? false,
        isCombo: rest.isCombo ?? false,
        allergens: Array.isArray(rest.allergens) ? rest.allergens : [],
        images: Array.isArray(rest.images) ? rest.images : [],
      };

      // Enforce rule: products in "Sin categoría" can never be active
      const category = await this.prisma.category.findUnique({
        where: { id: createProductDto.categoryId },
        select: { slug: true },
      });
      if (category?.slug === 'sin-categoria') {
        productData.isActive = false;
      }

      // Campos opcionales
      if (rest.shortDescription) {
        productData.shortDescription = rest.shortDescription;
      }
      if (rest.sku) {
        productData.sku = rest.sku;
      }
      if (rest.priceUSD !== undefined && rest.priceUSD !== null) {
        productData.priceUSD = rest.priceUSD;
      }
      if (rest.priceMNs !== undefined && rest.priceMNs !== null) {
        productData.priceMNs = rest.priceMNs;
      }
      if (rest.comparePriceUSD !== undefined && rest.comparePriceUSD !== null) {
        productData.comparePriceUSD = rest.comparePriceUSD;
      }
      if (rest.comparePriceMNs !== undefined && rest.comparePriceMNs !== null) {
        productData.comparePriceMNs = rest.comparePriceMNs;
      }
      if (rest.weight !== undefined && rest.weight !== null) {
        productData.weight = rest.weight;
      }
      if (rest.nutritionalInfo) {
        productData.nutritionalInfo = rest.nutritionalInfo;
      }
      if (rest.adultsOnly !== undefined) {
        productData.adultsOnly = !!rest.adultsOnly;
      }

      this.logger.debug('Datos preparados para Prisma', 'ProductsService', {
        name: productData.name,
        slug: productData.slug,
        categoryId: productData.categoryId,
        stock: productData.stock,
        isActive: productData.isActive,
        isCombo: productData.isCombo,
      });

      const product = await this.prisma.$transaction(async (tx) => {
        const created = await tx.product.create({
          data: productData,
          include: { category: true },
        });

        if (productData.isCombo) {
          const items = Array.isArray(comboItems) ? comboItems : [];
          const normalized = items
            .filter((i: any) => i?.productId && i.productId !== created.id)
            .map((i: any) => ({
              comboId: created.id,
              productId: i.productId,
              quantity: i.quantity ? Number(i.quantity) : 1,
            }));

          if (normalized.length > 0) {
            await tx.comboItem.createMany({ data: normalized, skipDuplicates: true });
            const withProducts = await tx.comboItem.findMany({
              where: { comboId: created.id },
              include: { product: { select: { adultsOnly: true } } },
            });
            const fromItems = withProducts.some((ci: any) => ci.product?.adultsOnly);
            if (fromItems && !productData.adultsOnly) {
              await tx.product.update({
                where: { id: created.id },
                data: { adultsOnly: true },
              });
            }
          }
        }

        return created;
      });

      this.logger.log(`Producto creado exitosamente: ${product.id}`, 'ProductsService', {
        productId: product.id,
        name: product.name,
        slug: product.slug,
      });
      return product;
    } catch (error: any) {
      // Slug duplicado
      if (
        error?.code === 'P2002' &&
        Array.isArray(error?.meta?.target) &&
        error.meta.target.includes('slug')
      ) {
        this.logger.warn('Intento de crear producto con slug duplicado', 'ProductsService', {
          slug: createProductDto.slug,
          code: error.code,
        });
        throw new ConflictException('El slug ya existe. Por favor usa otro slug.');
      }
      this.logger.error(
        'Error al crear producto',
        error.stack || String(error),
        'ProductsService',
        {
          message: error.message,
          code: error.code,
          meta: error.meta,
          cause: error.cause,
          slug: createProductDto.slug,
        },
      );
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

    if (filters?.isCombo !== undefined) {
      where.isCombo = filters.isCombo;
    }

    // Filtro de stock disponible
    if (filters?.inStock === true) {
      where.stock = {
        gt: 0,
      };
    }

    // Filtro de rango de precios
    const priceFilters: any[] = [];
    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      // Para productos sin variantes
      const productPriceFilter: any = {};
      if (filters?.minPrice !== undefined) {
        productPriceFilter.gte = filters.minPrice;
      }
      if (filters?.maxPrice !== undefined) {
        productPriceFilter.lte = filters.maxPrice;
      }
      if (Object.keys(productPriceFilter).length > 0) {
        priceFilters.push({
          priceUSD: productPriceFilter,
        });
      }

      // Para productos con variantes, necesitamos verificar las variantes
      // Esto es más complejo y requeriría un subquery
      // Por ahora, filtramos por precio del producto base
    }

    // Búsqueda por texto
    if (filters?.search) {
      const searchConditions = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];

      if (where.OR) {
        // Si ya hay condiciones OR (de precio), combinarlas
        where.AND = [{ OR: where.OR }, { OR: searchConditions }];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    // Si hay filtros de precio, agregarlos
    if (priceFilters.length > 0) {
      if (where.OR || where.AND) {
        // Ya hay condiciones complejas, usar AND
        if (!where.AND) {
          where.AND = [];
        }
        where.AND.push({ OR: priceFilters });
      } else {
        where.OR = priceFilters;
      }
    }

    // Ordenamiento
    let orderBy: any = { createdAt: 'desc' }; // Default
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'price-asc':
          orderBy = { priceUSD: 'asc' };
          break;
        case 'price-desc':
          orderBy = { priceUSD: 'desc' };
          break;
        case 'name-asc':
          orderBy = { name: 'asc' };
          break;
        case 'name-desc':
          orderBy = { name: 'desc' };
          break;
        case 'created-desc':
          orderBy = { createdAt: 'desc' };
          break;
        default:
          orderBy = { createdAt: 'desc' };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.product
        .findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            shortDescription: true,
            priceUSD: true,
            priceMNs: true,
            comparePriceUSD: true,
            comparePriceMNs: true,
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
            category: true,
            variants: {
              where: { isActive: true },
              orderBy: { order: 'asc' },
            },
            comboItems: { select: { product: { select: { adultsOnly: true } } } },
            // Campos opcionales (pueden no existir si la migración no se ha aplicado)
            averageRating: true,
            reviewCount: true,
          },
          orderBy,
        })
        .then((rows: any[]) =>
          rows.map((p) => ({ ...p, adultsOnly: !!(p.adultsOnly || (p.comboItems || []).some((ci: any) => ci.product?.adultsOnly)) }))
        )
        .catch(async (error) => {
          // Si falla por campos que no existen, intentar sin ellos
          if (error.message?.includes('does not exist') || error.message?.includes('no existe')) {
            return this.prisma.product
              .findMany({
                where,
                skip,
                take: limit,
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  description: true,
                  shortDescription: true,
                  priceUSD: true,
                  priceMNs: true,
                  comparePriceUSD: true,
                  comparePriceMNs: true,
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
                  category: true,
                  variants: {
                    where: { isActive: true },
                    orderBy: { order: 'asc' },
                  },
                },
                orderBy,
              })
              .then((rows: any[]) => rows.map((p) => ({ ...p, adultsOnly: !!p.adultsOnly })));
          }
          throw error;
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
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          variants: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
          },
          comboItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true,
                  priceUSD: true,
                  priceMNs: true,
                  comparePriceUSD: true,
                  comparePriceMNs: true,
                  isActive: true,
                  isCombo: true,
                  adultsOnly: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const adultsOnly = !!(product.adultsOnly || (product.comboItems || []).some((ci: any) => ci.product?.adultsOnly));
      return { ...product, adultsOnly };
    } catch (error: any) {
      // Si falla por campos que no existen (migración no aplicada), intentar sin ellos
      if (
        error.message?.includes('does not exist') ||
        error.message?.includes('no existe') ||
        error.message?.includes('column')
      ) {
        // SEGURIDAD: Uso seguro de $queryRaw con template literals de Prisma
        // Los parámetros (${id}) son automáticamente escapados por Prisma, previniendo SQL injection
        // NUNCA usar concatenación de strings con $queryRaw - siempre usar template literals
        // Este uso es seguro porque:
        // 1. ${id} viene de parámetros validados del endpoint
        // 2. Prisma escapa automáticamente los valores en template literals
        // 3. No hay concatenación de strings que pueda ser manipulada
        const product = (await this.prisma.$queryRaw`
          SELECT 
            id, name, slug, description, "shortDescription",
            "priceUSD", "priceMNs", "comparePriceUSD", "comparePriceMNs",
            sku, stock, "isActive", "isFeatured", "isCombo", "adultsOnly",
            images, allergens, "nutritionalInfo", weight, "categoryId",
            "createdAt", "updatedAt"
          FROM products
          WHERE id = ${id}
        `) as any[];

        if (!product || product.length === 0) {
          throw new NotFoundException('Product not found');
        }

        // Obtener relaciones por separado
        const [category, variants, comboItems] = await Promise.all([
          this.prisma.category.findUnique({ where: { id: product[0].categoryId } }),
          this.prisma.productVariant.findMany({
            where: { productId: id, isActive: true },
            orderBy: { order: 'asc' },
          }),
          this.prisma.comboItem.findMany({
            where: { comboId: id },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true,
                  priceUSD: true,
                  priceMNs: true,
                  comparePriceUSD: true,
                  comparePriceMNs: true,
                  isActive: true,
                  isCombo: true,
                  adultsOnly: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          }),
        ]);

        const adultsOnly = !!(product[0]?.adultsOnly || (comboItems || []).some((ci: any) => ci.product?.adultsOnly));
        return {
          ...product[0],
          category,
          variants,
          comboItems,
          averageRating: null,
          reviewCount: 0,
          adultsOnly,
        };
      }
      throw error;
    }
  }

  async findBySlug(slug: string) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { slug },
        include: {
          category: true,
          variants: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
          },
          comboItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true,
                  priceUSD: true,
                  priceMNs: true,
                  comparePriceUSD: true,
                  comparePriceMNs: true,
                  isActive: true,
                  isCombo: true,
                  adultsOnly: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const adultsOnly = !!(product.adultsOnly || (product.comboItems || []).some((ci: any) => ci.product?.adultsOnly));
      return { ...product, adultsOnly };
    } catch (error: any) {
      // Si falla por campos que no existen (migración no aplicada), intentar sin ellos
      if (
        error.message?.includes('does not exist') ||
        error.message?.includes('no existe') ||
        error.message?.includes('column')
      ) {
        // SEGURIDAD: Uso seguro de $queryRaw con template literals de Prisma
        // Los parámetros (${slug}) son automáticamente escapados por Prisma, previniendo SQL injection
        // NUNCA usar concatenación de strings con $queryRaw - siempre usar template literals
        // Este uso es seguro porque:
        // 1. ${slug} viene de parámetros validados del endpoint
        // 2. Prisma escapa automáticamente los valores en template literals
        // 3. No hay concatenación de strings que pueda ser manipulada
        const product = (await this.prisma.$queryRaw`
          SELECT 
            id, name, slug, description, "shortDescription",
            "priceUSD", "priceMNs", "comparePriceUSD", "comparePriceMNs",
            sku, stock, "isActive", "isFeatured", "isCombo", "adultsOnly",
            images, allergens, "nutritionalInfo", weight, "categoryId",
            "createdAt", "updatedAt"
          FROM products
          WHERE slug = ${slug}
        `) as any[];

        if (!product || product.length === 0) {
          throw new NotFoundException('Product not found');
        }

        // Obtener relaciones por separado
        const [category, variants, comboItems] = await Promise.all([
          this.prisma.category.findUnique({ where: { id: product[0].categoryId } }),
          this.prisma.productVariant.findMany({
            where: { productId: product[0].id, isActive: true },
            orderBy: { order: 'asc' },
          }),
          this.prisma.comboItem.findMany({
            where: { comboId: product[0].id },
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true,
                  priceUSD: true,
                  priceMNs: true,
                  comparePriceUSD: true,
                  comparePriceMNs: true,
                  isActive: true,
                  isCombo: true,
                  adultsOnly: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          }),
        ]);

        const adultsOnly = !!(product[0]?.adultsOnly || (comboItems || []).some((ci: any) => ci.product?.adultsOnly));
        return {
          ...product[0],
          category,
          variants,
          comboItems,
          averageRating: null,
          reviewCount: 0,
          adultsOnly,
        };
      }
      throw error;
    }
  }

  async getBestSellers(limit = 8) {
    const take = Number.isFinite(limit) ? Math.max(1, Math.min(50, Number(limit))) : 8;

    // Rank por cantidad total vendida (solo órdenes pagadas)
    const ranked = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          paymentStatus: 'PAID',
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take,
    });

    const ids = ranked.map((r) => r.productId);
    // Fallback: si no hay ventas todavía, devolver productos en oferta
    if (ids.length === 0) {
      const candidates = await this.prisma.product
        .findMany({
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            shortDescription: true,
            priceUSD: true,
            priceMNs: true,
            comparePriceUSD: true,
            comparePriceMNs: true,
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
            category: true,
            variants: {
              where: { isActive: true },
              orderBy: { order: 'asc' },
            },
            comboItems: { select: { product: { select: { adultsOnly: true } } } },
          },
          orderBy: { createdAt: 'desc' },
          take: Math.max(50, take * 5), // buscar suficientes para filtrar
        })
        .then((rows: any[]) => rows.map((p) => ({ ...p, adultsOnly: !!(p.adultsOnly || (p.comboItems || []).some((ci: any) => ci.product?.adultsOnly)) })))
        .catch(async (error) => {
          // Si falla por campos que no existen, intentar sin ellos
          if (
            error.message?.includes('does not exist') ||
            error.message?.includes('no existe') ||
            error.message?.includes('column')
          ) {
            return this.prisma.product
              .findMany({
                where: { isActive: true },
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  description: true,
                  shortDescription: true,
                  priceUSD: true,
                  priceMNs: true,
                  comparePriceUSD: true,
                  comparePriceMNs: true,
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
                  category: true,
                  variants: {
                    where: { isActive: true },
                    orderBy: { order: 'asc' },
                  },
                },
                orderBy: { createdAt: 'desc' },
                take: Math.max(50, take * 5),
              })
              .then((rows: any[]) => rows.map((p) => ({ ...p, adultsOnly: !!p.adultsOnly })));
          }
          throw error;
        });

      const isOnSale = (p: any) => {
        const price = p.priceUSD ? Number(p.priceUSD) : 0;
        const compare =
          p.comparePriceUSD !== null && p.comparePriceUSD !== undefined
            ? Number(p.comparePriceUSD)
            : null;
        if (compare !== null && compare > price) return true;
        // variantes
        const vars = Array.isArray(p.variants) ? p.variants : [];
        return vars.some((v: any) => {
          const vPrice = v.priceUSD ? Number(v.priceUSD) : 0;
          const vCompare =
            v.comparePriceUSD !== null && v.comparePriceUSD !== undefined
              ? Number(v.comparePriceUSD)
              : null;
          return vCompare !== null && vCompare > vPrice;
        });
      };

      return candidates.filter(isOnSale).slice(0, take);
    }

    const products = await this.prisma.product
      .findMany({
        where: {
          id: { in: ids },
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          shortDescription: true,
          priceUSD: true,
          priceMNs: true,
          comparePriceUSD: true,
          comparePriceMNs: true,
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
          category: true,
          variants: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
          },
          comboItems: { select: { product: { select: { adultsOnly: true } } } },
        },
      })
      .then((rows: any[]) => rows.map((p) => ({ ...p, adultsOnly: !!(p.adultsOnly || (p.comboItems || []).some((ci: any) => ci.product?.adultsOnly)) })))
      .catch(async (error) => {
        // Si falla por campos que no existen, intentar sin ellos
        if (
          error.message?.includes('does not exist') ||
          error.message?.includes('no existe') ||
          error.message?.includes('column')
        ) {
          return this.prisma.product
            .findMany({
              where: {
                id: { in: ids },
                isActive: true,
              },
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                shortDescription: true,
                priceUSD: true,
                priceMNs: true,
                comparePriceUSD: true,
                comparePriceMNs: true,
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
                category: true,
                variants: {
                  where: { isActive: true },
                  orderBy: { order: 'asc' },
                },
              },
            })
            .then((rows: any[]) => rows.map((p) => ({ ...p, adultsOnly: !!p.adultsOnly })));
        }
        throw error;
      });

    const byId = new Map(products.map((p) => [p.id, p]));
    return ids.map((id) => byId.get(id)).filter(Boolean);
  }

  /** Registra un email para recibir aviso cuando el producto tenga stock (solo si stock === 0). */
  async stockNotify(productId: string, email: string): Promise<{ message: string }> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, stock: true, name: true },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    const totalStock = product.stock ?? 0;
    if (totalStock > 0) {
      throw new BadRequestException('Este producto ya tiene stock. Puedes añadirlo al carrito.');
    }
    await this.prisma.stockNotify.upsert({
      where: {
        productId_email: { productId, email: email.trim().toLowerCase() },
      },
      create: { productId, email: email.trim().toLowerCase() },
      update: { notifiedAt: null },
    });
    return { message: 'Te avisaremos por email cuando haya stock.' };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const existing = await this.findOne(id);
    // Enforce rule: products in "Sin categoría" can never be active
    const nextCategoryId = updateProductDto.categoryId ?? existing.categoryId;
    let categorySlug: string | null = existing.category?.slug ?? null;
    if (updateProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: nextCategoryId },
        select: { slug: true },
      });
      categorySlug = category?.slug ?? null;
    }

    const { comboItems, ...rest } = updateProductDto as any;
    const data: any = {
      ...rest,
    };
    const existingIsUncategorized = existing.category?.slug === 'sin-categoria';
    const nextIsUncategorized = categorySlug === 'sin-categoria';

    if (nextIsUncategorized) {
      data.isActive = false;
    } else if (existingIsUncategorized && !nextIsUncategorized) {
      // Moving out of "Sin categoría" => auto-activate (unless explicitly set false)
      if (updateProductDto.isActive === undefined) {
        data.isActive = true;
      }
    }

    const nextIsCombo = data.isCombo !== undefined ? !!data.isCombo : !!(existing as any).isCombo;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const updated = await tx.product.update({
          where: { id },
          data,
          include: { category: true },
        });

        // Si se desactiva combo, borrar items
        if (!nextIsCombo) {
          await tx.comboItem.deleteMany({ where: { comboId: id } });
          return updated;
        }

        // Si es combo y se envía comboItems, reemplazar exactamente
        if (comboItems !== undefined) {
          await tx.comboItem.deleteMany({ where: { comboId: id } });
          const items = Array.isArray(comboItems) ? comboItems : [];
          const normalized = items
            .filter((i: any) => i?.productId && i.productId !== id)
            .map((i: any) => ({
              comboId: id,
              productId: i.productId,
              quantity: i.quantity ? Number(i.quantity) : 1,
            }));
          if (normalized.length > 0) {
            await tx.comboItem.createMany({ data: normalized, skipDuplicates: true });
          }
        }

        // Para combos: si algún ítem es +18, el combo debe ser +18
        if (nextIsCombo) {
          const withProducts = await tx.comboItem.findMany({
            where: { comboId: id },
            include: { product: { select: { adultsOnly: true } } },
          });
          const fromItems = withProducts.some((ci: any) => ci.product?.adultsOnly);
          const effective = !!((data.adultsOnly !== undefined ? data.adultsOnly : (existing as any).adultsOnly) || fromItems);
          if (effective !== (updated as any).adultsOnly) {
            await tx.product.update({
              where: { id },
              data: { adultsOnly: effective },
            });
            return tx.product.findUnique({
              where: { id },
              include: { category: true },
            }) as Promise<typeof updated>;
          }
        }

        return updated;
      });
    } catch (error: any) {
      if (
        error?.code === 'P2002' &&
        Array.isArray(error?.meta?.target) &&
        error.meta.target.includes('slug')
      ) {
        throw new ConflictException('El slug ya existe. Por favor usa otro slug.');
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.delete({
      where: { id },
    });
  }

  /**
   * Obtener productos con stock bajo
   * @param threshold - Umbral de stock bajo (default: 10)
   * @returns Lista de productos con stock bajo
   */
  async getLowStockProducts(threshold: number = 10): Promise<LowStockAlertDto[]> {
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        stock: {
          lte: threshold,
        },
      },
      include: {
        variants: {
          where: {
            stock: {
              lte: threshold,
            },
          },
        },
      },
      orderBy: {
        stock: 'asc',
      },
    });

    return products.map((product) => {
      const hasVariants = product.variants.length > 0;
      const lowStockVariants = hasVariants
        ? product.variants
            .filter((v) => v.stock <= threshold)
            .map((v) => ({
              id: v.id,
              name: v.name || product.name,
              stock: v.stock,
            }))
        : undefined;

      return {
        id: product.id,
        name: product.name,
        stock: product.stock,
        minStock: threshold,
        hasVariants,
        lowStockVariants,
      };
    });
  }

  /**
   * Obtener productos relacionados/sugeridos
   * Basado en la misma categoría y productos destacados
   * @param productId - ID del producto actual
   * @param limit - Número máximo de productos relacionados (default: 4)
   * @returns Lista de productos relacionados
   */
  async getRelatedProducts(productId: string, limit: number = 4) {
    // Obtener el producto actual para conocer su categoría
    const currentProduct = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true },
    });

    if (!currentProduct) {
      return [];
    }

    // Buscar productos de la misma categoría, excluyendo el actual
    const relatedProducts = await this.prisma.product.findMany({
      where: {
        id: {
          not: productId,
        },
        categoryId: currentProduct.categoryId,
        isActive: true,
        stock: {
          gt: 0, // Solo productos con stock
        },
      },
      take: limit,
      orderBy: [
        { isFeatured: 'desc' }, // Priorizar destacados
        { createdAt: 'desc' }, // Luego los más recientes
      ],
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        variants: {
          where: {
            stock: {
              gt: 0,
            },
          },
          take: 1,
        },
        comboItems: { select: { product: { select: { adultsOnly: true } } } },
      },
    });

    return relatedProducts.map((product) => {
      const adultsOnly = !!(product.adultsOnly || (product.comboItems || []).some((ci: any) => ci.product?.adultsOnly));
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        priceUSD: product.priceUSD ? Number(product.priceUSD) : null,
        priceMNs: product.priceMNs ? Number(product.priceMNs) : null,
        comparePriceUSD: product.comparePriceUSD ? Number(product.comparePriceUSD) : null,
        comparePriceMNs: product.comparePriceMNs ? Number(product.comparePriceMNs) : null,
        stock: product.stock,
        images: product.images,
        isFeatured: product.isFeatured,
        adultsOnly,
        category: product.category,
        variants: product.variants.map((v) => ({
          id: v.id,
          name: v.name,
          priceUSD: v.priceUSD ? Number(v.priceUSD) : null,
          priceMNs: v.priceMNs ? Number(v.priceMNs) : null,
          stock: v.stock,
        })),
      };
    });
  }
}
