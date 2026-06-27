import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";

@Injectable()
export class StripeService {
  readonly client: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.client = new Stripe(configService.getOrThrow<string>("stripe.secretKey"), {
      apiVersion: "2026-06-24.dahlia",
      typescript: true,
    });
  }

  createPaymentIntent(input: { amountCents: number; currency: string; orderId: string; customerEmail: string }) {
    return this.client.paymentIntents.create({
      amount: input.amountCents,
      currency: input.currency.toLowerCase(),
      receipt_email: input.customerEmail,
      metadata: {
        orderId: input.orderId,
        platform: "novaex",
      },
      automatic_payment_methods: { enabled: true },
    });
  }

  constructWebhookEvent(payload: Buffer | string, signature: string) {
    return this.client.webhooks.constructEvent(payload, signature, this.configService.getOrThrow<string>("stripe.webhookSecret"));
  }
}
