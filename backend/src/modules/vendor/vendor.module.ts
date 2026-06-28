import { Module } from "@nestjs/common";
import { VendorPortalController } from "./controllers/vendor-portal.controller";
import { VendorRepository } from "./repositories/vendor.repository";
import { VendorPortalService } from "./services/vendor-portal.service";

@Module({
  controllers: [VendorPortalController],
  providers: [VendorRepository, VendorPortalService],
  exports: [VendorPortalService],
})
export class VendorModule {}
