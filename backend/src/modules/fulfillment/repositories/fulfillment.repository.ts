import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../database/prisma.service";
import { OrderListQueryDto } from "../dto/fulfillment.dto";

const orderDetailInclude = {
  items: true,
  payments: { include: { transactions: true, refunds: true } },
  shipments: { include: { shippingMethod: true, trackingEvents: { orderBy: { occurredAt: "asc" as const } } } },
  invoices: true,
  returns: true,
  couponRedemptions: { include: { coupon: true } },
  user: { include: { profile: true } },
} satisfies Prisma.OrderInclude;

@Injectable()
export class FulfillmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  listOrdersForUser(userId: string, query: OrderListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.OrderWhereInput = {
      userId,
      ...(query.search
        ? {
            OR: [
              { orderNumber: { contains: query.search, mode: "insensitive" } },
              { items: { some: { productNameSnapshot: { contains: query.search, mode: "insensitive" } } } },
            ],
          }
        : {}),
      ...(query.status ? { status: query.status as Prisma.EnumOrderStatusFilter["equals"] } : {}),
    };

    return Promise.all([
      this.prisma.order.findMany({
        where,
        include: orderDetailInclude,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);
  }

  findOrderForUser(userId: string, orderId: string) {
    return this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: orderDetailInclude,
    });
  }

  findOrderById(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: orderDetailInclude,
    });
  }

  updateOrder(orderId: string, data: Prisma.OrderUpdateInput) {
    return this.prisma.order.update({ where: { id: orderId }, data, include: orderDetailInclude });
  }

  findPaymentByIntentId(paymentIntentId: string) {
    return this.prisma.payment.findFirst({
      where: { gatewayPaymentId: paymentIntentId },
      include: { order: { include: orderDetailInclude }, transactions: true },
    });
  }

  createPaymentTransaction(data: Prisma.PaymentTransactionCreateInput) {
    return this.prisma.paymentTransaction.create({ data });
  }

  updatePayment(paymentId: string, data: Prisma.PaymentUpdateInput) {
    return this.prisma.payment.update({ where: { id: paymentId }, data });
  }

  createRefund(data: Prisma.RefundCreateInput) {
    return this.prisma.refund.create({ data });
  }

  listPayments(query: { page?: number; limit?: number; status?: string }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.PaymentWhereInput = query.status ? { status: query.status as Prisma.EnumPaymentStatusFilter["equals"] } : {};

    return Promise.all([
      this.prisma.payment.findMany({
        where,
        include: { order: { include: { user: { include: { profile: true } } } }, refunds: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
    ]);
  }

  listShipments(query: { page?: number; limit?: number; status?: string }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ShipmentWhereInput = query.status
      ? { status: query.status as Prisma.EnumShipmentStatusFilter["equals"] }
      : {};

    return Promise.all([
      this.prisma.shipment.findMany({
        where,
        include: {
          order: { include: { user: { include: { profile: true } } } },
          shippingMethod: true,
          trackingEvents: { orderBy: { occurredAt: "desc" }, take: 3 },
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.shipment.count({ where }),
    ]);
  }

  getShippingMethods() {
    return this.prisma.shippingMethod.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { basePrice: "asc" },
    });
  }

  getShippingZones() {
    return this.prisma.shippingZone.findMany({
      where: { deletedAt: null },
      include: { country: true, city: true },
      orderBy: { name: "asc" },
    });
  }

  getShipment(shipmentId: string) {
    return this.prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { order: true, shippingMethod: true, trackingEvents: { orderBy: { occurredAt: "asc" } } },
    });
  }

  updateShipment(shipmentId: string, data: Prisma.ShipmentUpdateInput) {
    return this.prisma.shipment.update({
      where: { id: shipmentId },
      data,
      include: { shippingMethod: true, trackingEvents: { orderBy: { occurredAt: "asc" } } },
    });
  }

  addTrackingEvent(data: Prisma.TrackingEventCreateInput) {
    return this.prisma.trackingEvent.create({ data });
  }

  listOrdersAdmin(query: OrderListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.OrderWhereInput = {
      ...(query.search
        ? {
            OR: [
              { orderNumber: { contains: query.search, mode: "insensitive" } },
              { user: { email: { contains: query.search, mode: "insensitive" } } },
            ],
          }
        : {}),
      ...(query.status ? { status: query.status as Prisma.EnumOrderStatusFilter["equals"] } : {}),
    };

    return Promise.all([
      this.prisma.order.findMany({
        where,
        include: orderDetailInclude,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);
  }

  getOrderItems(orderId: string) {
    return this.prisma.orderItem.findMany({
      where: { orderId },
      include: { variant: { include: { inventoryItems: true } } },
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

  commitReservedInventory(variantId: string, quantity: number) {
    return this.prisma.inventoryItem.updateMany({
      where: { variantId, reservedQuantity: { gte: quantity } },
      data: { reservedQuantity: { decrement: quantity } },
    });
  }

  restoreInventory(variantId: string, quantity: number) {
    return this.prisma.inventoryItem.updateMany({
      where: { variantId },
      data: {
        availableQuantity: { increment: quantity },
        reservedQuantity: { decrement: quantity },
      },
    });
  }

  findLowStockItems(threshold = 5) {
    return this.prisma.inventoryItem.findMany({
      where: { availableQuantity: { lte: threshold } },
      include: { variant: { include: { product: true } } },
      take: 20,
    });
  }

  getFulfillmentAnalytics(days: number) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return Promise.all([
      this.prisma.order.groupBy({ by: ["status"], _count: true, where: { createdAt: { gte: since } } }),
      this.prisma.payment.groupBy({ by: ["status"], _count: true, _sum: { amount: true }, where: { createdAt: { gte: since } } }),
      this.prisma.shipment.groupBy({ by: ["status"], _count: true, where: { createdAt: { gte: since } } }),
      this.prisma.refund.aggregate({ _count: true, _sum: { amount: true }, where: { createdAt: { gte: since } } }),
    ]);
  }
}
