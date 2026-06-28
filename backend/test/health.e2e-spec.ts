import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { createIntegrationApp, apiPath } from "./helpers/bootstrap-app";

describe("Health API (integration)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createIntegrationApp();
  }, 60_000);

  afterAll(async () => {
    await app.close();
  });

  it("returns liveness probe", async () => {
    const response = await request(app.getHttpServer()).get(apiPath("/health/live")).expect(200);
    expect(response.body).toMatchObject({ status: "ok" });
  });

  it("returns readiness probe with dependency checks", async () => {
    const response = await request(app.getHttpServer()).get(apiPath("/health/ready"));
    expect([200, 503]).toContain(response.status);
    expect(response.body).toHaveProperty("status");
    expect(response.body).toHaveProperty("checks");
  });

  it("returns aggregate health check", async () => {
    const response = await request(app.getHttpServer()).get(apiPath("/health")).expect(200);
    expect(response.body).toHaveProperty("status");
  });
});
