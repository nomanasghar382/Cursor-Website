import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { QUEUES } from "../common/constants/app.constants";
import { RedisModule } from "../shared/redis/redis.module";

@Module({
  imports: [
    RedisModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.getOrThrow<string>("redis.host"),
          port: configService.getOrThrow<number>("redis.port"),
          password: configService.get<string>("redis.password"),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: "exponential", delay: 5000 },
          removeOnComplete: 1000,
          removeOnFail: 5000,
        },
      }),
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
