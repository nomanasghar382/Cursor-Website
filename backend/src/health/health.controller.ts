import { Controller, Get, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import { Public } from "../common/decorators/public.decorator";
import { HealthService } from "./health.service";

@ApiTags("Health")
@SkipThrottle()
@Controller({ path: "health", version: ["1", VERSION_NEUTRAL] })
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  check() {
    return this.healthService.check();
  }

  @Public()
  @Get("live")
  liveness() {
    return this.healthService.liveness();
  }

  @Public()
  @Get("ready")
  readiness() {
    return this.healthService.readiness();
  }
}
