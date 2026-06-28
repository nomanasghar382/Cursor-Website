import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service";
import { CartRepository } from "../../cart/repositories/cart.repository";
import { CreateReviewDto, ReturnRequestDto } from "../../customer/dto/customer.dto";

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
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly prisma: PrismaService,
    private readonly cartRepository: CartRepository,
  ) {}

  async list(userId: string) {
    const orders = await this.ordersRepository.listByUser(userId);
    return { orders: orders.map((order) => this.toSummary(order)) };
  }

  async getById(userId: string, orderId: string) {
    const order = await this.ordersRepository.findById(userId, orderId);
    if (!order) throw new NotFoundException("Order not found.");
    return { order: this.toDetail(order) };
  }

  async cancel(userId: string, orderId: string) {
    const order = await this.ordersRepository.findById(userId, orderId);
    if (!order) throw new NotFoundException("Order not found.");
    if (!["PENDING_PAYMENT", "CONFIRMED"].includes(order.status)) {
      throw new BadRequestException("This order can no longer be cancelled.");
    }
    await this.prisma.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
    return this.getById(userId, orderId);
  }

  async requestReturn(userId: string, orderId: string, dto: ReturnRequestDto) {
    const order = await this.ordersRepository.findById(userId, orderId);
    if (!order) throw new NotFoundException("Order not found.");
    if (order.status !== "DELIVERED") {
      throw new BadRequestException("Returns are available for delivered orders only.");
    }
    await this.prisma.return.create({
      data: { orderId, userId, reason: dto.reason, status: "REQUESTED" },
    });
    return this.getById(userId, orderId);
  }

  async reorder(userId: string, orderId: string) {
    const order = await this.ordersRepository.findById(userId, orderId);
    if (!order) throw new NotFoundException("Order not found.");

    for (const item of order.items) {
      if (!item.variantId) continue;
      const variant = await this.cartRepository.findVariant(item.variantId);
      if (!variant) continue;
      const cart = await this.cartRepository.findOrCreate(userId);
      await this.cartRepository.upsertItem(cart.id, item.variantId, item.quantity, Number(item.unitPrice));
    }

    return { message: "Items added back to your cart." };
  }

  async getInvoice(userId: string, orderId: string) {
    const order = await this.ordersRepository.findById(userId, orderId);
    if (!order) throw new NotFoundException("Order not found.");
    const invoice = order.invoices[0];
    if (!invoice) throw new NotFoundException("Invoice not found.");

    return {
      invoice: {
        invoiceNumber: invoice.invoiceNumber,
        issuedAt: invoice.issuedAt?.toISOString(),
        orderNumber: order.orderNumber,
        subtotal: Number(order.subtotal),
        taxTotal: Number(order.taxTotal),
        shippingTotal: Number(order.shippingTotal),
        discountTotal: Number(order.discountTotal),
        grandTotal: Number(order.grandTotal),
        items: order.items.map((item) => ({
          name: item.productNameSnapshot,
          sku: item.skuSnapshot,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          lineTotal: Number(item.lineTotal),
        })),
      },
    };
  }

  async createReview(userId: string, orderId: string, orderItemId: string, dto: CreateReviewDto) {
    const order = await this.ordersRepository.findById(userId, orderId);
    if (!order) throw new NotFoundException("Order not found.");
    const item = order.items.find((entry) => entry.id === orderItemId);
    if (!item?.productId) throw new NotFoundException("Order item not found.");

    const review = await this.prisma.review.upsert({
      where: { orderItemId },
      create: {
        userId,
        productId: item.productId,
        orderItemId,
        rating: dto.rating,
        title: dto.title,
        body: dto.body,
        status: "APPROVED",
      },
      update: {
        rating: dto.rating,
        title: dto.title,
        body: dto.body,
        status: "APPROVED",
      },
    });

    return { review: { id: review.id, rating: review.rating } };
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
