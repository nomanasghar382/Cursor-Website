import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { QUEUES } from "../common/constants/app.constants";
import { createRedisClientOptions, RedisConnectionSettings } from "../config/redis-connection.util";
import { RedisModule } from "../shared/redis/redis.module";

@Module({
  imports: [
    RedisModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const settings = configService.getOrThrow<RedisConnectionSettings>("redis");
        const connection = createRedisClientOptions(settings);

        return {
        connection: typeof connection === "string"
          ? connection
          : {
              ...connection,
              ...(connection.host?.includes(".railway.internal") ? { family: 0 } : {}),
            },
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: "exponential", delay: 5000 },
          removeOnComplete: 1000,
          removeOnFail: 5000,
        },
      };
      },
    }),
    BullModule.registerQueue(
      { name: QUEUES.AUDIT },
      { name: QUEUES.EMAIL },
      { name: QUEUES.NOTIFICATIONS },
      { name: QUEUES.MEDIA },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
