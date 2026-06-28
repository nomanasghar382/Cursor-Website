import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../database/prisma.service";

const wishlistInclude = {
  items: {
    where: { deletedAt: null },
    include: {
      product: {
        include: {
          images: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" as const }, take: 1 },
          category: true,
          brand: true,
          variants: {
            where: { deletedAt: null, status: "ACTIVE" as const },
            include: { inventoryItems: true },
            orderBy: { price: "asc" as const },
            take: 1,
          },
        },
      },
      variant: { include: { inventoryItems: true } },
    },
    orderBy: { createdAt: "desc" as const },
  },
} satisfies Prisma.WishlistInclude;

export type WishlistWithItems = Prisma.WishlistGetPayload<{ include: typeof wishlistInclude }>;

@Injectable()
export class WishlistRepository {
  constructor(private readonly prisma: PrismaService) {}

  listByUser(userId: string) {
    return this.prisma.wishlist.findMany({
      where: { userId, deletedAt: null },
      include: wishlistInclude,
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });
  }

  findById(userId: string, wishlistId: string) {
    return this.prisma.wishlist.findFirst({
      where: { id: wishlistId, userId, deletedAt: null },
      include: wishlistInclude,
    });
  }

  findByIdPublic(wishlistId: string) {
    return this.prisma.wishlist.findFirst({
      where: { id: wishlistId, deletedAt: null },
      include: wishlistInclude,
    });
  }

  async findOrCreateDefault(userId: string) {
    const existing = await this.prisma.wishlist.findFirst({
      where: { userId, isDefault: true, deletedAt: null },
      include: wishlistInclude,
    });
    if (existing) return existing;
    return this.prisma.wishlist.create({
      data: { userId, name: "My Wishlist", isDefault: true },
      include: wishlistInclude,
    });
  }

  create(userId: string, name: string) {
    return this.prisma.wishlist.create({
      data: { userId, name, isDefault: false },
      include: wishlistInclude,
    });
  }

  async addItem(wishlistId: string, productId: string, variantId?: string) {
    const existing = await this.prisma.wishlistItem.findFirst({
      where: {
        wishlistId,
        productId,
        variantId: variantId ?? null,
        deletedAt: null,
      },
    });
    if (existing) return existing;

    return this.prisma.wishlistItem.create({
      data: { wishlistId, productId, variantId },
    });
  }

  removeItem(itemId: string) {
    return this.prisma.wishlistItem.update({
      where: { id: itemId },
      data: { deletedAt: new Date() },
    });
  }
}
