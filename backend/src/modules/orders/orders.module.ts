import { Module } from "@nestjs/common";
import { PaymentsModule } from "../payments/payments.module";
import { OrdersController } from "./controllers/orders.controller";
import { OrdersRepository, OrdersService } from "./services/orders.service";

@Module({
  imports: [PaymentsModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository],
  exports: [OrdersService],
})
export class OrdersModule {}
