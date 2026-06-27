import { Global, Module } from "@nestjs/common";
import { RedisModule } from "../redis/redis.module";
import { AppCacheService } from "./cache.service";

@Global()
@Module({
  imports: [RedisModule],
  providers: [AppCacheService],
  exports: [AppCacheService],
})
export class AppCacheModule {}
