import { Controller, Get, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Permissions } from "../common/decorators/permissions.decorator";
import { MonitoringService } from "./monitoring.service";

@ApiTags("Monitoring")
@ApiBearerAuth()
@Controller({ path: "admin/monitoring", version: ["1", VERSION_NEUTRAL] })
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get("architecture")
  @Permissions("settings:read")
  architecture() {
    return this.monitoringService.getArchitecture();
  }
}
