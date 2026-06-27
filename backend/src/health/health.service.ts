import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { RedisService } from "../shared/redis/redis.service";

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async check() {
    const [database, redis] = await Promise.allSettled([this.prisma.$queryRaw`SELECT 1`, this.redisService.ping()]);

    return {
      status: database.status === "fulfilled" && redis.status === "fulfilled" ? "ok" : "degraded",
      checks: {
        api: "ok",
        database: database.status === "fulfilled" ? "ok" : "error",
        redis: redis.status === "fulfilled" ? "ok" : "error",
      },
      timestamp: new Date().toISOString(),
    };
  }
}
