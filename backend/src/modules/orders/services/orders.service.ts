import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service";

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  listByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        payments: true,
        shipments: { include: { shippingMethod: true } },
        invoices: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  findById(userId: string, orderId: string) {
    return this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: true,
        payments: { include: { transactions: true } },
        shipments: { include: { shippingMethod: true, trackingEvents: true } },
        invoices: true,
        couponRedemptions: { include: { coupon: true } },
      },
    });
  }
}

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async list(userId: string) {
    const orders = await this.ordersRepository.listByUser(userId);
    return { orders: orders.map((order) => this.toSummary(order)) };
  }

  async getById(userId: string, orderId: string) {
    const order = await this.ordersRepository.findById(userId, orderId);
    if (!order) throw new NotFoundException("Order not found.");
    return { order: this.toDetail(order) };
  }

  private toSummary(order: Awaited<ReturnType<OrdersRepository["listByUser"]>>[number]) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      grandTotal: Number(order.grandTotal),
      currencyCode: order.currencyCode,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      createdAt: order.createdAt.toISOString(),
      estimatedDeliveryDays: (order.shipments[0]?.metadata as { estimatedDays?: number })?.estimatedDays ?? 5,
    };
  }

  private toDetail(order: NonNullable<Awaited<ReturnType<OrdersRepository["findById"]>>>) {
    const metadata = (order.metadata ?? {}) as {
      shippingAddress?: Record<string, string>;
      billingAddress?: Record<string, string>;
      deliveryInstructions?: string;
    };

    return {
      ...this.toSummary(order),
      subtotal: Number(order.subtotal),
      taxTotal: Number(order.taxTotal),
      shippingTotal: Number(order.shippingTotal),
      discountTotal: Number(order.discountTotal),
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.productNameSnapshot,
        sku: item.skuSnapshot,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
      })),
      shippingAddress: metadata.shippingAddress,
      billingAddress: metadata.billingAddress,
      deliveryInstructions: metadata.deliveryInstructions,
      payments: order.payments.map((payment) => ({
        id: payment.id,
        gateway: payment.gateway,
        status: payment.status,
        amount: Number(payment.amount),
        clientSecret: (payment.metadata as { clientSecret?: string })?.clientSecret,
      })),
      shipments: order.shipments.map((shipment) => ({
        id: shipment.id,
        carrier: shipment.carrier,
        status: shipment.status,
        trackingNumber: shipment.trackingNumber,
        method: shipment.shippingMethod.name,
        events: shipment.trackingEvents.map((event) => ({
          id: event.id,
          status: event.status,
          description: event.message,
          occurredAt: event.occurredAt.toISOString(),
        })),
      })),
      invoiceNumber: order.invoices[0]?.invoiceNumber,
      timeline: this.buildTimeline(order.status),
      coupon: order.couponRedemptions[0]?.coupon.code,
    };
  }

  private buildTimeline(status: string) {
    const steps = [
      { key: "PENDING_PAYMENT", label: "Payment pending" },
      { key: "CONFIRMED", label: "Order confirmed" },
      { key: "PROCESSING", label: "Preparing shipment" },
      { key: "SHIPPED", label: "Shipped" },
      { key: "DELIVERED", label: "Delivered" },
    ];
    const activeIndex = steps.findIndex((step) => step.key === status);
    return steps.map((step, index) => ({
      ...step,
      completed: activeIndex >= 0 ? activeIndex >= index : false,
      current: step.key === status,
    }));
  }
}
