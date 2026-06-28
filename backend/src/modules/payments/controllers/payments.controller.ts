import { Controller, Headers, Post, RawBodyRequest, Req, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { Public } from "../../../common/decorators/public.decorator";
import { StripeService } from "../services/stripe.service";
import { PrismaService } from "../../../database/prisma.service";
import { NotificationService } from "../../notifications/services/notification.service";

@ApiTags("Payments")
@Controller({ path: "payments", version: ["1", VERSION_NEUTRAL] })
export class PaymentsController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  @Public()
  @Post("stripe/webhook")
  async handleStripeWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers("stripe-signature") signature: string,
  ) {
    const event = this.stripeService.constructWebhookEvent(request.rawBody ?? request.body, signature);

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;
      if (!orderId) return { received: true };

      const payment = await this.prisma.payment.findFirst({
        where: { gatewayPaymentId: paymentIntent.id },
        include: { order: { include: { user: true } } },
      });
      if (!payment) return { received: true };

      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: "CAPTURED" },
        }),
        this.prisma.paymentTransaction.create({
          data: {
            paymentId: payment.id,
            transactionType: "CAPTURE",
            gatewayTransactionId: paymentIntent.id,
            amount: payment.amount,
            status: "CAPTURED",
            rawResponse: paymentIntent as object,
          },
        }),
        this.prisma.order.update({
          where: { id: orderId },
          data: { status: "CONFIRMED" },
        }),
      ]);

      await this.notificationService.notifyUser({
        userId: payment.order.userId,
        title: "Payment confirmed",
        body: `Your order ${payment.order.orderNumber} is confirmed and entering fulfillment.`,
        email: payment.order.user.email,
      });
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      await this.prisma.payment.updateMany({
        where: { gatewayPaymentId: paymentIntent.id },
        data: { status: "FAILED" },
      });
    }

    return { received: true };
  }
}
