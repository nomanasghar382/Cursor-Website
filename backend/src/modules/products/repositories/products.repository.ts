import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../database/prisma.service";
import { ProductQueryDto } from "../dto/product-query.dto";

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findCatalog(query: ProductQueryDto) {
    const where: Prisma.ProductWhereInput = {
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
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      query.sort === "price-asc"
        ? { basePrice: "asc" }
        : query.sort === "price-desc"
          ? { basePrice: "desc" }
          : query.sort === "newest"
            ? { createdAt: "desc" }
            : { aiScore: "desc" };

    return this.prisma.product.findMany({
      where,
      orderBy,
      take: 48,
      include: {
        category: true,
        variants: {
          where: { deletedAt: null, status: "ACTIVE" },
          include: { inventoryItems: true },
          orderBy: { price: "asc" },
        },
        reviews: {
          where: { status: "APPROVED" },
          select: { rating: true },
        },
      },
    });
  }
}
