import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service";
import { CreateReviewDto, ReturnRequestDto } from "../../customer/dto/customer.dto";
import { CartRepository } from "../../cart/repositories/cart.repository";
import { OrderListQueryDto } from "../../fulfillment/dto/fulfillment.dto";
import { FulfillmentRepository } from "../../fulfillment/repositories/fulfillment.repository";
import { InvoiceFulfillmentService } from "../../fulfillment/services/invoice-fulfillment.service";
import { OrderLifecycleService } from "../../fulfillment/services/order-lifecycle.service";
import { PaymentFulfillmentService } from "../../fulfillment/services/payment-fulfillment.service";

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  createReturn(orderId: string, userId: string, reason: string) {
    return this.prisma.return.create({
      data: { orderId, userId, reason, status: "REQUESTED" },
    });
  }

  upsertReview(input: {
    userId: string;
    productId: string;
    orderItemId: string;
    rating: number;
    title?: string;
    body: string;
  }) {
    return this.prisma.review.upsert({
      where: { orderItemId: input.orderItemId },
      create: {
        userId: input.userId,
        productId: input.productId,
        orderItemId: input.orderItemId,
        rating: input.rating,
        title: input.title,
        body: input.body,
        status: "APPROVED",
      },
      update: {
        rating: input.rating,
        title: input.title,
        body: input.body,
        status: "APPROVED",
      },
    });
  }
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly fulfillmentRepository: FulfillmentRepository,
    private readonly lifecycleService: OrderLifecycleService,
    private readonly paymentFulfillmentService: PaymentFulfillmentService,
    private readonly invoiceService: InvoiceFulfillmentService,
    private readonly cartRepository: CartRepository,
  ) {}

  async list(userId: string, query?: OrderListQueryDto) {
    const [orders, total] = await this.fulfillmentRepository.listOrdersForUser(userId, query ?? {});
    return {
      orders: orders.map((order) => this.lifecycleService.mapOrder(order)),
      total,
      page: query?.page ?? 1,
      limit: query?.limit ?? 20,
      hasMore: (query?.page ?? 1) * (query?.limit ?? 20) < total,
    };
  }

  async getById(userId: string, orderId: string) {
    const order = await this.fulfillmentRepository.findOrderForUser(userId, orderId);
    if (!order) throw new NotFoundException("Order not found.");
    return { order: this.lifecycleService.mapOrder(order) };
  }

  async track(userId: string, orderId: string) {
    const result = await this.getById(userId, orderId);
    return {
      tracking: {
        orderNumber: result.order.orderNumber,
        status: result.order.status,
        timeline: result.order.timeline,
        shipments: result.order.shipments,
        estimatedDeliveryDays: result.order.estimatedDeliveryDays,
      },
    };
  }

  async cancel(userId: string, orderId: string) {
    const order = await this.fulfillmentRepository.findOrderForUser(userId, orderId);
    if (!order) throw new NotFoundException("Order not found.");
    if (!["PENDING_PAYMENT", "CONFIRMED"].includes(order.status)) {
      throw new BadRequestException("This order can no longer be cancelled.");
    }
    const updated = await this.lifecycleService.transitionOrder(orderId, "CANCELLED", "Cancelled by customer", userId);
    return { order: updated };
  }

  async requestReturn(userId: string, orderId: string, dto: ReturnRequestDto) {
    const order = await this.fulfillmentRepository.findOrderForUser(userId, orderId);
    if (!order) throw new NotFoundException("Order not found.");
    if (order.status !== "DELIVERED") {
      throw new BadRequestException("Returns are available for delivered orders only.");
    }
    await this.ordersRepository.createReturn(orderId, userId, dto.reason);
    await this.lifecycleService.transitionOrder(orderId, "RETURNED", dto.reason, userId);
    return this.getById(userId, orderId);
  }

  async requestRefund(userId: string, orderId: string, reason: string) {
    await this.lifecycleService.addNote(orderId, `Refund requested: ${reason}`, userId);
    return { requested: true };
  }

  async reorder(userId: string, orderId: string) {
    const order = await this.fulfillmentRepository.findOrderForUser(userId, orderId);
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

  getInvoice(userId: string, orderId: string) {
    return this.invoiceService.getInvoice(orderId, userId);
  }

  async createReview(userId: string, orderId: string, orderItemId: string, dto: CreateReviewDto) {
    const order = await this.fulfillmentRepository.findOrderForUser(userId, orderId);
    if (!order) throw new NotFoundException("Order not found.");
    const item = order.items.find((entry) => entry.id === orderItemId);
    if (!item?.productId) throw new NotFoundException("Order item not found.");

    const review = await this.ordersRepository.upsertReview({
      userId,
      productId: item.productId,
      orderItemId,
      rating: dto.rating,
      title: dto.title,
      body: dto.body,
    });

    return { review: { id: review.id, rating: review.rating } };
  }

  retryPayment(userId: string, orderId: string) {
    return this.paymentFulfillmentService.retryPayment(userId, orderId);
  }
}
