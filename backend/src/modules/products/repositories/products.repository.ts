import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../database/prisma.service";
import { ProductQueryDto } from "../dto/product-query.dto";

const productInclude = {
  category: true,
  brand: true,
  variants: {
    where: { deletedAt: null, status: "ACTIVE" as const },
    include: {
      inventoryItems: true,
      productAttributes: {
        include: {
          attribute: true,
          attributeValue: true,
        },
      },
    },
    orderBy: { price: "asc" as const },
  },
  images: {
    where: { deletedAt: null },
    orderBy: { sortOrder: "asc" as const },
  },
  reviews: {
    where: { status: "APPROVED" as const, deletedAt: null },
    include: {
      images: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" as const } },
      user: { include: { profile: true } },
    },
    orderBy: { createdAt: "desc" as const },
    take: 12,
  },
  questions: {
    where: { status: "APPROVED" as const, deletedAt: null },
    include: {
      answers: {
        where: { status: "APPROVED" as const, deletedAt: null },
        orderBy: { createdAt: "asc" as const },
        take: 1,
        include: { user: { include: { profile: true } } },
      },
      user: { include: { profile: true } },
    },
    orderBy: { createdAt: "desc" as const },
    take: 8,
  },
  specifications: {
    where: { deletedAt: null },
    orderBy: { sortOrder: "asc" as const },
  },
  assets360: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" as const } },
  models3d: { where: { deletedAt: null }, orderBy: { lodLevel: "asc" as const }, take: 1 },
  arModels: { where: { deletedAt: null }, take: 1 },
} satisfies Prisma.ProductInclude;

type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findCatalog(query: ProductQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 24;
    const where = this.buildWhere(query);

    const orderBy = this.buildOrderBy(query);

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: productInclude,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products, total, page, limit };
  }

  async findById(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null, status: "ACTIVE", visibility: "PUBLIC" },
      include: productInclude,
    });
    if (!product) {
      throw new NotFoundException("Product not found.");
    }
    return product;
  }

  async findRelated(product: ProductWithRelations, take = 6) {
    return this.prisma.product.findMany({
      where: {
        deletedAt: null,
        status: "ACTIVE",
        visibility: "PUBLIC",
        id: { not: product.id },
        OR: [{ categoryId: product.categoryId }, { brandId: product.brandId ?? undefined }],
      },
      orderBy: { aiScore: "desc" },
      take,
      include: productInclude,
    });
  }

  async findFacets(query: ProductQueryDto) {
    const where = this.buildWhere({ ...query, section: undefined, page: undefined, limit: undefined });

    const [categories, brands, priceBounds] = await Promise.all([
      this.prisma.category.findMany({
        where: { deletedAt: null, isActive: true, products: { some: { deletedAt: null, status: "ACTIVE", visibility: "PUBLIC" } } },
        orderBy: { sortOrder: "asc" },
        select: { name: true, slug: true },
      }),
      this.prisma.brand.findMany({
        where: { deletedAt: null, products: { some: { deletedAt: null, status: "ACTIVE", visibility: "PUBLIC" } } },
        orderBy: { name: "asc" },
        select: { name: true, slug: true },
      }),
      this.prisma.product.aggregate({
        where,
        _min: { basePrice: true },
        _max: { basePrice: true },
      }),
    ]);

    return {
      categories,
      brands,
      minPrice: Number(priceBounds._min.basePrice ?? 0),
      maxPrice: Number(priceBounds._max.basePrice ?? 0),
    };
  }

  private buildWhere(query: ProductQueryDto): Prisma.ProductWhereInput {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    return {
      deletedAt: null,
      status: "ACTIVE",
      visibility: "PUBLIC",
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { description: { contains: query.search, mode: "insensitive" } },
              { brand: { name: { contains: query.search, mode: "insensitive" } } },
            ],
          }
        : {}),
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...(query.brand ? { brand: { slug: query.brand } } : {}),
      ...(query.minPrice !== undefined ? { basePrice: { gte: query.minPrice } } : {}),
      ...(query.maxPrice !== undefined ? { basePrice: { lte: query.maxPrice } } : {}),
      ...(query.section === "featured" ? { aiScore: { gt: 95 } } : {}),
      ...(query.section === "new" ? { createdAt: { gte: thirtyDaysAgo } } : {}),
      ...(query.section === "flash-sale"
        ? { variants: { some: { compareAtPrice: { not: null }, deletedAt: null, status: "ACTIVE" } } }
        : {}),
      ...(query.inStock
        ? { variants: { some: { inventoryItems: { some: { availableQuantity: { gt: 0 } } } } } }
        : {}),
    };
  }

  private buildOrderBy(query: ProductQueryDto): Prisma.ProductOrderByWithRelationInput {
    switch (query.sort) {
      case "price-asc":
        return { basePrice: "asc" };
      case "price-desc":
        return { basePrice: "desc" };
      case "newest":
        return { createdAt: "desc" };
      case "rating":
        return { reviews: { _count: "desc" } };
      case "discount":
        return { basePrice: "desc" };
      case "trending":
        return { aiScore: "desc" };
      case "ai-recommended":
        return { aiScore: "desc" };
      default:
        return query.section === "bestseller" ? { reviews: { _count: "desc" } } : { aiScore: "desc" };
    }
  }
}

export type { ProductWithRelations };
