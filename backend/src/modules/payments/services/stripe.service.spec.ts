import { ConfigService } from "@nestjs/config";
import { StripeService } from "./stripe.service";

describe("StripeService simulation mode", () => {
  const configService = {
    get: jest.fn((key: string) => {
      const values: Record<string, unknown> = {
        "app.nodeEnv": "test",
        "stripe.enableTestSimulation": true,
        "stripe.secretKey": "sk_test_simulation",
        "stripe.webhookSecret": "whsec_simulation",
      };
      return values[key];
    }),
    getOrThrow: jest.fn((key: string) => {
      if (key === "stripe.secretKey") return "sk_test_simulation";
      if (key === "stripe.webhookSecret") return "whsec_simulation";
      throw new Error(`Missing config ${key}`);
    }),
  } as unknown as ConfigService;

  const service = new StripeService(configService);

  it("creates and retrieves simulated payment intents", async () => {
    const intent = await service.createPaymentIntent({
      amountCents: 2500,
      currency: "USD",
      orderId: "00000000-0000-0000-0000-000000000001",
      customerEmail: "test@novaex.ai",
    });

    expect(intent.id.startsWith("pi_test_")).toBe(true);
    expect(intent.client_secret).toContain("_secret");

    const retrieved = await service.retrievePaymentIntent(intent.id);
    expect(retrieved.status).toBe("succeeded");
  });

  it("constructs simulated webhook events", () => {
    const event = service.constructWebhookEvent(
      JSON.stringify({ type: "payment_intent.succeeded", data: { object: { id: "pi_test_1" } } }),
      "simulated_webhook",
    );

    expect(event.type).toBe("payment_intent.succeeded");
  });
});
