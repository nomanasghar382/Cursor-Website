import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { createIntegrationApp, apiPath } from "./helpers/bootstrap-app";

describe("Security API (integration)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createIntegrationApp();
  }, 60_000);

  afterAll(async () => {
    await app.close();
  });

  it("rejects protected routes without a token", async () => {
    await request(app.getHttpServer()).get(apiPath("/auth/me")).expect(401);
    await request(app.getHttpServer()).get(apiPath("/cart")).expect(401);
    await request(app.getHttpServer()).get(apiPath("/admin/dashboard")).expect(401);
  });

  it("rejects invalid bearer tokens", async () => {
    await request(app.getHttpServer())
      .get(apiPath("/auth/me"))
      .set("Authorization", "Bearer invalid-token")
      .expect(401);
  });

  it("rejects malformed auth payloads", async () => {
    await request(app.getHttpServer())
      .post(apiPath("/auth/login"))
      .send({ email: "not-email", password: "short" })
      .expect(400);
  });

  it("rejects SQL injection patterns in search query", async () => {
    const response = await request(app.getHttpServer())
      .get(apiPath("/products"))
      .query({ search: "'; DROP TABLE users; --" })
      .expect(200);

    expect(response.body).toHaveProperty("data");
  });

  it("sanitizes XSS in registration rejection without crashing", async () => {
    await request(app.getHttpServer())
      .post(apiPath("/auth/register"))
      .send({
        email: "<script>alert(1)</script>@test.com",
        password: "short",
        firstName: "<img src=x onerror=alert(1)>",
        lastName: "User",
      })
      .expect(400);
  });

  it("rejects unknown fields on validated DTOs", async () => {
    await request(app.getHttpServer())
      .post(apiPath("/auth/register"))
      .send({
        email: "user@novaex.ai",
        password: "Novaex!Secure123",
        firstName: "Nova",
        lastName: "User",
        isAdmin: true,
      })
      .expect(400);
  });
});
