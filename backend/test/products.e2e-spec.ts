import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { createIntegrationApp, apiPath } from "./helpers/bootstrap-app";

describe("Products API (integration)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createIntegrationApp();
  }, 60_000);

  afterAll(async () => {
    await app.close();
  });

  it("lists published products", async () => {
    const response = await request(app.getHttpServer()).get(apiPath("/products")).expect(200);
    expect(response.body).toHaveProperty("data");
    const payload = response.body.data ?? response.body;
    expect(payload).toHaveProperty("products");
    expect(Array.isArray(payload.products)).toBe(true);
  });

  it("supports pagination parameters", async () => {
    const response = await request(app.getHttpServer())
      .get(apiPath("/products"))
      .query({ page: 1, limit: 5 })
      .expect(200);

    const payload = response.body.data ?? response.body;
    expect(payload.products.length).toBeLessThanOrEqual(5);
  });

  it("returns 404 for unknown product id", async () => {
    await request(app.getHttpServer())
      .get(apiPath("/products/00000000-0000-0000-0000-000000000000"))
      .expect(404);
  });

  it("responds within performance budget for catalog list", async () => {
    const started = Date.now();
    await request(app.getHttpServer()).get(apiPath("/products")).expect(200);
    expect(Date.now() - started).toBeLessThan(5000);
  });
});
