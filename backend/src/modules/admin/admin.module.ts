import { Module } from "@nestjs/common";
import { AdminCatalogController } from "./controllers/admin-catalog.controller";
import { AdminDashboardController } from "./controllers/admin-dashboard.controller";
import { AdminGrowthController } from "./controllers/admin-growth.controller";
import { AdminOperationsController } from "./controllers/admin-operations.controller";
import { AdminPlatformController } from "./controllers/admin-platform.controller";
import { AdminRepository } from "./repositories/admin.repository";
import { AdminDashboardService } from "./services/admin-dashboard.service";
import {
  AdminCatalogService,
  AdminGrowthService,
  AdminOperationsService,
  AdminPlatformService,
} from "./services/admin-domain.service";

@Module({
  controllers: [
    AdminDashboardController,
    AdminCatalogController,
    AdminOperationsController,
    AdminGrowthController,
    AdminPlatformController,
  ],
  providers: [
    AdminRepository,
    AdminDashboardService,
    AdminCatalogService,
    AdminOperationsService,
    AdminGrowthService,
    AdminPlatformService,
  ],
  exports: [AdminDashboardService],
})
export class AdminModule {}
