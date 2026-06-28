import { INestApplication, MiddlewareConsumer, Module, NestModule, ValidationPipe, VersioningType } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AuthContextMiddleware } from "../src/common/middlewares/auth-context.middleware";
import { AuthController } from "../src/modules/auth/controllers/auth.controller";
import { AuthService } from "../src/modules/auth/services/auth.service";

const authServiceMock = {
  register: jest.fn().mockResolvedValue({ message: "Registration successful. Verify your email to activate the account.", email: "user@novaex.ai" }),
  login: jest.fn().mockResolvedValue({ token: "access-token", accessToken: "access-token", refreshToken: "refresh-token", user: { id: "user-1" } }),
  refresh: jest.fn().mockResolvedValue({ accessToken: "new-access", refreshToken: "new-refresh", token: "new-access" }),
  getOAuthProviders: jest.fn().mockResolvedValue({ google: { enabled: false }, github: { enabled: false } }),
  me: jest.fn().mockResolvedValue({ id: "user-1", email: "user@novaex.ai" }),
};

@Module({
  controllers: [AuthController],
  providers: [{ provide: AuthService, useValue: authServiceMock }],
})
class AuthTestModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthContextMiddleware).forRoutes("*");
  }
}

describe("Auth API (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthTestModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api");
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registers a user with validated payload", async () => {
    await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({
        email: "user@novaex.ai",
        password: "Novaex!Secure123",
        firstName: "Nova",
        lastName: "User",
      })
      .expect(201);

    expect(authServiceMock.register).toHaveBeenCalled();
  });

  it("rejects invalid registration payloads", async () => {
    await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({ email: "not-an-email", password: "short", firstName: "", lastName: "" })
      .expect(400);
  });

  it("logs in with audience-specific routes", async () => {
    await request(app.getHttpServer())
      .post("/api/v1/auth/admin/login")
      .send({ email: "admin@novaex.ai", password: "Novaex!Secure123" })
      .expect(201);

    expect(authServiceMock.login).toHaveBeenCalledWith(
      expect.objectContaining({ audience: "admin" }),
      expect.any(Object),
      expect.any(Object),
    );
  });

  it("exposes oauth provider metadata", async () => {
    const response = await request(app.getHttpServer()).get("/api/v1/auth/oauth/providers").expect(200);
    expect(response.body).toHaveProperty("google");
    expect(authServiceMock.getOAuthProviders).toHaveBeenCalled();
  });
});
