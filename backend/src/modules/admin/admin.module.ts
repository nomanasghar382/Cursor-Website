import { Module } from "@nestjs/common";
import { AdminCatalogController } from "./controllers/admin-catalog.controller";
import { AdminDashboardController } from "./controllers/admin-dashboard.controller";
import { AdminOperationsController } from "./controllers/admin-operations.controller";
import { AdminPlatformController } from "./controllers/admin-platform.controller";
import { AdminRepository } from "./repositories/admin.repository";
import { AdminDashboardService } from "./services/admin-dashboard.service";
import {
  AdminCatalogService,
  AdminOperationsService,
  AdminPlatformService,
} from "./services/admin-domain.service";

@Module({
  controllers: [
    AdminDashboardController,
    AdminCatalogController,
    AdminOperationsController,
    AdminPlatformController,
  ],
  providers: [
    AdminRepository,
    AdminDashboardService,
    AdminCatalogService,
    AdminOperationsService,
    AdminPlatformService,
  ],
  exports: [AdminDashboardService],
})
export class AdminModule {}
