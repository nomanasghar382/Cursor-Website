import { Controller, Headers, Post, RawBodyRequest, Req, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { Public } from "../../../common/decorators/public.decorator";
import { StripeService } from "../../payments/services/stripe.service";
import { PaymentFulfillmentService } from "../services/payment-fulfillment.service";

@ApiTags("Payments")
@Controller({ path: "payments", version: ["1", VERSION_NEUTRAL] })
export class PaymentsWebhookController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentFulfillmentService: PaymentFulfillmentService,
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
      if (orderId) {
        await this.paymentFulfillmentService.handleStripePaymentSucceeded(paymentIntent.id, orderId);
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      await this.paymentFulfillmentService.handleStripePaymentFailed(paymentIntent.id);
    }

    return { received: true };
  }
}
