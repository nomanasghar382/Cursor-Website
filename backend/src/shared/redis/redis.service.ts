import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import { createRedisClientOptions, RedisConnectionSettings } from "../../config/redis-connection.util";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  readonly client: Redis;

  constructor(configService: ConfigService) {
    const settings = configService.getOrThrow<RedisConnectionSettings>("redis");
    this.client = new Redis(createRedisClientOptions(settings));

    this.client.on("error", (error) => this.logger.error(error.message));
  }

  async ping(): Promise<string> {
    if (this.client.status === "wait") {
      await this.client.connect();
    }
    return this.client.ping();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.status !== "end") {
      await this.client.quit();
    }
  }
}
