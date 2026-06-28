import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { StripeService } from "../../payments/services/stripe.service";
import { FulfillmentRepository } from "../repositories/fulfillment.repository";
import { ProcessRefundDto } from "../dto/fulfillment.dto";
import { OrderInventoryService } from "./order-inventory.service";
import { OrderLifecycleService } from "./order-lifecycle.service";
import { FulfillmentNotificationService } from "./fulfillment-notification.service";

@Injectable()
export class PaymentFulfillmentService {
  constructor(
    private readonly fulfillmentRepository: FulfillmentRepository,
    private readonly stripeService: StripeService,
    private readonly inventoryService: OrderInventoryService,
    private readonly lifecycleService: OrderLifecycleService,
    private readonly notificationService: FulfillmentNotificationService,
  ) {}

  async confirmPayment(paymentIntentId: string) {
    const payment = await this.fulfillmentRepository.findPaymentByIntentId(paymentIntentId);
    if (!payment) throw new NotFoundException("Payment not found.");

    const intent = await this.stripeService.retrievePaymentIntent(paymentIntentId);
    if (intent.status !== "succeeded") {
      throw new BadRequestException(`Payment intent status is ${intent.status}.`);
    }

    return this.captureSuccessfulPayment(payment.id, payment.orderId, intent.id, payment.order);
  }

  async handleStripePaymentSucceeded(paymentIntentId: string, orderId: string) {
    const payment = await this.fulfillmentRepository.findPaymentByIntentId(paymentIntentId);
    if (!payment || payment.status === "CAPTURED") return { handled: false };

    await this.captureSuccessfulPayment(payment.id, orderId, paymentIntentId, payment.order);
    return { handled: true };
  }

  async handleStripePaymentFailed(paymentIntentId: string) {
    const payment = await this.fulfillmentRepository.findPaymentByIntentId(paymentIntentId);
    if (!payment) return;

    await this.fulfillmentRepository.updatePayment(payment.id, { status: "FAILED" });
    await this.fulfillmentRepository.createPaymentTransaction({
      payment: { connect: { id: payment.id } },
      transactionType: "VOID",
      gatewayTransactionId: `${paymentIntentId}-failed-${Date.now()}`,
      amount: payment.amount,
      status: "FAILED",
      rawResponse: { paymentIntentId } as Prisma.InputJsonValue,
    });
  }

  async retryPayment(userId: string, orderId: string) {
    const order = await this.fulfillmentRepository.findOrderForUser(userId, orderId);
    if (!order) throw new NotFoundException("Order not found.");

    const payment = order.payments[0];
    if (!payment || payment.status === "CAPTURED") {
      throw new BadRequestException("No retryable payment found.");
    }

    const paymentIntent = await this.stripeService.createPaymentIntent({
      amountCents: Math.round(Number(order.grandTotal) * 100),
      currency: order.currencyCode,
      orderId: order.id,
      customerEmail: order.user.email,
    });

    await this.fulfillmentRepository.updatePayment(payment.id, {
      gatewayPaymentId: paymentIntent.id,
      status: "REQUIRES_ACTION",
      metadata: { clientSecret: paymentIntent.client_secret },
    });

    return {
      payment: {
        id: payment.id,
        clientSecret: paymentIntent.client_secret,
        status: "REQUIRES_ACTION",
      },
    };
  }

  async processRefund(orderId: string, dto: ProcessRefundDto) {
    const order = await this.fulfillmentRepository.findOrderById(orderId);
    if (!order) throw new NotFoundException("Order not found.");

    const payment = order.payments.find((entry) => entry.status === "CAPTURED");
    if (!payment) throw new BadRequestException("No captured payment available for refund.");

    const amount = dto.amount ?? Number(payment.amount);
    const stripeRefund = await this.stripeService.createRefund({
      paymentIntentId: payment.gatewayPaymentId,
      amountCents: Math.round(amount * 100),
      reason: dto.reason,
    });

    const refund = await this.fulfillmentRepository.createRefund({
      payment: { connect: { id: payment.id } },
      amount,
      currencyCode: payment.currencyCode,
      status: "PROCESSED",
      gatewayRefundId: stripeRefund.id,
      metadata: { reason: dto.reason },
    });

    await this.fulfillmentRepository.updatePayment(payment.id, { status: "REFUNDED" });
    await this.fulfillmentRepository.updateOrder(orderId, { status: "REFUNDED" });
    await this.inventoryService.restoreOrderInventory(orderId);

    if (order.user) {
      await this.notificationService.refundUpdate(order.userId, order.user.email, order.orderNumber, amount);
    }

    return { refund: { id: refund.id, amount, status: refund.status, gatewayRefundId: refund.gatewayRefundId } };
  }

  async listPayments(query: { page?: number; limit?: number; status?: string }) {
    const [items, total] = await this.fulfillmentRepository.listPayments(query);
    return {
      payments: items.map((payment) => ({
        id: payment.id,
        orderId: payment.orderId,
        orderNumber: payment.order.orderNumber,
        customerEmail: payment.order.user?.email,
        gateway: payment.gateway,
        status: payment.status,
        amount: Number(payment.amount),
        refundCount: payment.refunds.length,
        createdAt: payment.createdAt.toISOString(),
      })),
      total,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    };
  }

  private async captureSuccessfulPayment(
    paymentId: string,
    orderId: string,
    paymentIntentId: string,
    order: NonNullable<Awaited<ReturnType<FulfillmentRepository["findPaymentByIntentId"]>>>["order"],
  ) {
    await this.fulfillmentRepository.updatePayment(paymentId, { status: "CAPTURED" });
    await this.fulfillmentRepository.createPaymentTransaction({
      payment: { connect: { id: paymentId } },
      transactionType: "CAPTURE",
      gatewayTransactionId: paymentIntentId,
      amount: order.grandTotal,
      status: "CAPTURED",
      rawResponse: { paymentIntentId } as Prisma.InputJsonValue,
    });

    await this.inventoryService.commitOrderInventory(orderId);
    await this.lifecycleService.transitionOrder(orderId, "CONFIRMED", "Payment captured", "system");
    await this.lifecycleService.transitionOrder(orderId, "PROCESSING", "Fulfillment queue", "system");

    if (order.user) {
      await this.notificationService.paymentSuccess(order.userId, order.user.email, order.orderNumber);
      await this.notificationService.orderConfirmation(order.userId, order.user.email, order.orderNumber);
    }

    return { orderId, status: "PROCESSING" };
  }
}
