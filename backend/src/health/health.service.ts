import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { RedisService } from "../shared/redis/redis.service";

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  liveness() {
    return {
      status: "ok",
      checks: { api: "ok" },
      timestamp: new Date().toISOString(),
    };
  }

  async readiness() {
    const [database, redis] = await Promise.allSettled([this.prisma.$queryRaw`SELECT 1`, this.redisService.ping()]);

    return {
      status: database.status === "fulfilled" && redis.status === "fulfilled" ? "ok" : "degraded",
      checks: {
        database: database.status === "fulfilled" ? "ok" : "error",
        redis: redis.status === "fulfilled" ? "ok" : "error",
      },
      timestamp: new Date().toISOString(),
    };
  }

  async check() {
    const readiness = await this.readiness();
    return {
      status: readiness.status,
      checks: {
        api: "ok",
        ...readiness.checks,
      },
      timestamp: readiness.timestamp,
    };
  }
}
