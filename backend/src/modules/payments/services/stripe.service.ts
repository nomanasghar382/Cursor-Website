import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";

type SimulatedPaymentIntent = Stripe.PaymentIntent;

@Injectable()
export class StripeService {
  readonly client: Stripe;
  private readonly simulatedIntents = new Map<string, SimulatedPaymentIntent>();

  constructor(private readonly configService: ConfigService) {
    this.client = new Stripe(configService.getOrThrow<string>("stripe.secretKey"), {
      apiVersion: "2026-06-24.dahlia",
      typescript: true,
    });
  }

  private get simulationEnabled() {
    return (
      this.configService.get<string>("app.nodeEnv") === "test" &&
      this.configService.get<boolean>("stripe.enableTestSimulation") === true
    );
  }

  private buildSimulatedPaymentIntent(input: {
    amountCents: number;
    currency: string;
    orderId: string;
    customerEmail: string;
    status?: Stripe.PaymentIntent.Status;
  }): SimulatedPaymentIntent {
    const id = `pi_test_${input.orderId.replace(/-/g, "").slice(0, 24)}`;
    return {
      id,
      object: "payment_intent",
      amount: input.amountCents,
      currency: input.currency.toLowerCase(),
      client_secret: `${id}_secret_sim`,
      status: input.status ?? "requires_payment_method",
      metadata: {
        orderId: input.orderId,
        platform: "novaex",
        customerEmail: input.customerEmail,
      },
    } as unknown as SimulatedPaymentIntent;
  }

  createPaymentIntent(input: { amountCents: number; currency: string; orderId: string; customerEmail: string }) {
    if (this.simulationEnabled) {
      const intent = this.buildSimulatedPaymentIntent(input);
      this.simulatedIntents.set(intent.id, intent);
      return Promise.resolve(intent);
    }

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

  createRefund(input: { paymentIntentId: string; amountCents?: number; reason?: string }) {
    if (this.simulationEnabled && input.paymentIntentId.startsWith("pi_test_")) {
      return Promise.resolve({
        id: `re_test_${Date.now()}`,
        object: "refund",
        payment_intent: input.paymentIntentId,
        status: "succeeded",
      } as Stripe.Refund);
    }

    return this.client.refunds.create({
      payment_intent: input.paymentIntentId,
      ...(input.amountCents ? { amount: input.amountCents } : {}),
      metadata: {
        platform: "novaex",
        ...(input.reason ? { reason: input.reason } : {}),
      },
    });
  }

  retrievePaymentIntent(paymentIntentId: string) {
    if (this.simulationEnabled && paymentIntentId.startsWith("pi_test_")) {
      const intent = this.simulatedIntents.get(paymentIntentId);
      if (!intent) {
        return Promise.reject(new Error(`Simulated payment intent ${paymentIntentId} was not found.`));
      }
      return Promise.resolve({ ...intent, status: "succeeded" } as SimulatedPaymentIntent);
    }

    return this.client.paymentIntents.retrieve(paymentIntentId);
  }

  constructWebhookEvent(payload: Buffer | string, signature: string) {
    if (this.simulationEnabled && signature === "simulated_webhook") {
      const body = typeof payload === "string" ? JSON.parse(payload) : JSON.parse(payload.toString("utf8"));
      return body as Stripe.Event;
    }

    return this.client.webhooks.constructEvent(payload, signature, this.configService.getOrThrow<string>("stripe.webhookSecret"));
  }
}
