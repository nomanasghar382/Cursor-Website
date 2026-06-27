import { Controller, Get, INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

@Controller()
class TestController {
  @Get()
  root() {
    return { status: "ready" };
  }
}

describe("App e2e structure", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TestController],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("serves an HTTP route", async () => {
    await request(app.getHttpServer()).get("/").expect(200).expect({ status: "ready" });
  });
});
