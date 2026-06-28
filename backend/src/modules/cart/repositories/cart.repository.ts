import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../database/prisma.service";

const cartInclude = {
  items: {
    include: {
      variant: {
        include: {
          product: {
            include: {
              images: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" as const }, take: 1 },
              category: true,
              brand: true,
            },
          },
          inventoryItems: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" as const },
  },
} satisfies Prisma.ShoppingCartInclude;

export type CartWithItems = Prisma.ShoppingCartGetPayload<{ include: typeof cartInclude }>;

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string) {
    return this.prisma.shoppingCart.findFirst({
      where: { userId, deletedAt: null },
      include: cartInclude,
    });
  }

  create(userId: string) {
    return this.prisma.shoppingCart.create({
      data: {
        userId,
        currencyCode: "USD",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        metadata: { savedForLater: [] },
      },
      include: cartInclude,
    });
  }

  async findOrCreate(userId: string) {
    const existing = await this.findByUserId(userId);
    if (existing) return existing;
    return this.create(userId);
  }

  updateMetadata(cartId: string, metadata: Prisma.InputJsonValue) {
    return this.prisma.shoppingCart.update({
      where: { id: cartId },
      data: { metadata },
    });
  }

  async upsertItem(cartId: string, variantId: string, quantity: number, priceSnapshot: number) {
    return this.prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId, variantId } },
      create: { cartId, variantId, quantity, priceSnapshot },
      update: { quantity, priceSnapshot },
    });
  }

  updateItemQuantity(cartId: string, variantId: string, quantity: number) {
    return this.prisma.cartItem.update({
      where: { cartId_variantId: { cartId, variantId } },
      data: { quantity },
    });
  }

  removeItem(cartId: string, variantId: string) {
    return this.prisma.cartItem.delete({
      where: { cartId_variantId: { cartId, variantId } },
    });
  }

  findVariant(variantId: string) {
    return this.prisma.productVariant.findFirst({
      where: { id: variantId, deletedAt: null, status: "ACTIVE" },
      include: {
        product: true,
        inventoryItems: true,
      },
    });
  }

  clearItems(cartId: string) {
    return this.prisma.cartItem.deleteMany({ where: { cartId } });
  }
}
