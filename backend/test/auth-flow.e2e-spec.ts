import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { createIntegrationApp, apiPath } from "./helpers/bootstrap-app";

describe("Auth flow (integration)", () => {
  let app: INestApplication;
  const uniqueEmail = `qa-${Date.now()}@novaex.test`;

  beforeAll(async () => {
    app = await createIntegrationApp();
  }, 60_000);

  afterAll(async () => {
    await app.close();
  });

  it("registers a new customer account", async () => {
    const response = await request(app.getHttpServer())
      .post(apiPath("/auth/register"))
      .send({
        email: uniqueEmail,
        password: "Novaex!Secure123",
        firstName: "QA",
        lastName: "Tester",
      })
      .expect(201);

    expect(response.body.data ?? response.body).toMatchObject({
      email: uniqueEmail,
    });
  });

  it("rejects duplicate registration", async () => {
    await request(app.getHttpServer())
      .post(apiPath("/auth/register"))
      .send({
        email: uniqueEmail,
        password: "Novaex!Secure123",
        firstName: "QA",
        lastName: "Tester",
      })
      .expect(409);
  });

  it("exposes oauth provider metadata publicly", async () => {
    const response = await request(app.getHttpServer()).get(apiPath("/auth/oauth/providers")).expect(200);
    const payload = response.body.data ?? response.body;
    expect(payload).toHaveProperty("google");
    expect(payload).toHaveProperty("github");
  });
});
