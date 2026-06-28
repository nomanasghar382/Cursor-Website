import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service";

const DEFAULT_SHIPPING_METHOD_ID = "11111111-1111-4111-8111-111111111111";

@Injectable()
export class CheckoutRepository {
  constructor(private readonly prisma: PrismaService) {}

  getShippingMethods() {
    return this.prisma.shippingMethod.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { basePrice: "asc" },
    });
  }

  getShippingMethod(id?: string) {
    return this.prisma.shippingMethod.findFirst({
      where: {
        deletedAt: null,
        isActive: true,
        ...(id ? { id } : {}),
      },
      orderBy: { basePrice: "asc" },
    });
  }

  getDefaultShippingMethod() {
    return this.prisma.shippingMethod.findFirst({
      where: { id: DEFAULT_SHIPPING_METHOD_ID, isActive: true },
    });
  }

  getTaxRate() {
    return this.prisma.taxRate.findFirst({
      where: { taxName: "NY Digital Commerce Tax" },
      orderBy: { validFrom: "desc" },
    });
  }

  getUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  getUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
  }

  getVariants(variantIds: string[]) {
    return this.prisma.productVariant.findMany({
      where: { id: { in: variantIds }, deletedAt: null, status: "ACTIVE" },
      include: {
        product: true,
        inventoryItems: true,
      },
    });
  }

  reserveInventory(variantId: string, quantity: number) {
    return this.prisma.inventoryItem.updateMany({
      where: { variantId, availableQuantity: { gte: quantity } },
      data: {
        availableQuantity: { decrement: quantity },
        reservedQuantity: { increment: quantity },
      },
    });
  }

  releaseInventory(variantId: string, quantity: number) {
    return this.prisma.inventoryItem.updateMany({
      where: { variantId },
      data: {
        availableQuantity: { increment: quantity },
        reservedQuantity: { decrement: quantity },
      },
    });
  }
}

export { DEFAULT_SHIPPING_METHOD_ID };
