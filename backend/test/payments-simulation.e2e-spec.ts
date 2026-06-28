import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { createIntegrationApp, apiPath } from "./helpers/bootstrap-app";

describe("Payment simulation (integration)", () => {
  let app: INestApplication;
  let accessToken = "";
  let orderId = "";
  let paymentIntentId = "";

  beforeAll(async () => {
    process.env.ENABLE_TEST_PAYMENT_SIMULATION = "true";
    app = await createIntegrationApp();

    const login = await request(app.getHttpServer())
      .post(apiPath("/auth/login"))
      .send({ email: "maya.chen@example.com", password: "NOVAEX-Customer-2026!", rememberMe: true });

    expect([200, 201]).toContain(login.status);
    accessToken = (login.body.data ?? login.body).accessToken;

    const products = await request(app.getHttpServer()).get(apiPath("/products?limit=5")).expect(200);
    const payload = products.body.data ?? products.body;
    const variantId = payload.products.find((product: { defaultVariantId?: string }) => product.defaultVariantId)
      ?.defaultVariantId;
    if (!variantId) {
      throw new Error("No seeded variant available for payment simulation test.");
    }

    await request(app.getHttpServer())
      .post(apiPath("/cart/items"))
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ variantId, quantity: 1 });

    const checkout = await request(app.getHttpServer())
      .post(apiPath("/checkout"))
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        shippingMethodId: "11111111-1111-4111-8111-111111111111",
        shippingAddress: {
          recipientName: "Maya Chen",
          phone: "+15550100011",
          line1: "88 Madison Avenue",
          postalCode: "10001",
          city: "New York",
          country: "United States",
        },
        billingSameAsShipping: true,
        paymentGateway: "STRIPE",
      });

    expect([200, 201]).toContain(checkout.status);
    const checkoutPayload = checkout.body.data ?? checkout.body;
    orderId = checkoutPayload.order.id;
    paymentIntentId = checkoutPayload.payment.clientSecret.split("_secret")[0];
  }, 90_000);

  afterAll(async () => {
    await app.close();
  });

  it("simulates stripe payment success in test mode", async () => {
    const response = await request(app.getHttpServer())
      .post(apiPath("/payments/test/simulate-succeeded"))
      .send({ paymentIntentId, orderId });

    expect([200, 201]).toContain(response.status);
    expect(response.body.data?.handled ?? response.body.handled).toBe(true);
  });
});
