import { HealthService } from "./health.service";

describe("HealthService", () => {
  const prisma = { $queryRaw: jest.fn() };
  const redisService = { ping: jest.fn() };
  let service: HealthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new HealthService(prisma as never, redisService as never);
  });

  it("returns liveness without external dependencies", () => {
    const result = service.liveness();
    expect(result.status).toBe("ok");
    expect(result.checks.api).toBe("ok");
  });

  it("returns ok readiness when database and redis are healthy", async () => {
    prisma.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);
    redisService.ping.mockResolvedValue("PONG");

    const result = await service.readiness();
    expect(result.status).toBe("ok");
    expect(result.checks.database).toBe("ok");
    expect(result.checks.redis).toBe("ok");
  });

  it("returns degraded readiness when a dependency fails", async () => {
    prisma.$queryRaw.mockRejectedValue(new Error("db down"));
    redisService.ping.mockResolvedValue("PONG");

    const result = await service.readiness();
    expect(result.status).toBe("degraded");
    expect(result.checks.database).toBe("error");
    expect(result.checks.redis).toBe("ok");
  });
});
