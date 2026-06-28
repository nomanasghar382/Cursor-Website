import { Controller, Get, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { AdminDashboardService } from "../services/admin-dashboard.service";

@ApiTags("Admin Dashboard")
@ApiBearerAuth()
@Controller({ path: "admin/dashboard", version: ["1", VERSION_NEUTRAL] })
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get()
  @Permissions("analytics:read")
  overview() {
    return this.dashboardService.getOverview();
  }

  @Get("ai")
  @Permissions("ai:read")
  aiInsights() {
    return this.dashboardService.getAiInsights();
  }
}
