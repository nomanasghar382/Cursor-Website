import { Module } from "@nestjs/common";
import { StorageModule } from "../storage/storage.module";
import { CustomerController } from "./controllers/customer.controller";
import { CustomerRepository } from "./repositories/customer.repository";
import { CustomerAccountService } from "./services/customer-account.service";
import { CustomerAddressesService } from "./services/customer-addresses.service";
import { CustomerDashboardService } from "./services/customer-dashboard.service";

@Module({
  imports: [StorageModule],
  controllers: [CustomerController],
  providers: [CustomerRepository, CustomerDashboardService, CustomerAddressesService, CustomerAccountService],
  exports: [CustomerDashboardService, CustomerAddressesService, CustomerAccountService],
})
export class CustomerModule {}
