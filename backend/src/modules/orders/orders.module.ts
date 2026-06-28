import { Module } from "@nestjs/common";
import { CartModule } from "../cart/cart.module";
import { FulfillmentModule } from "../fulfillment/fulfillment.module";
import { OrdersController } from "./controllers/orders.controller";
import { OrdersRepository, OrdersService } from "./services/orders.service";

@Module({
  imports: [FulfillmentModule, CartModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository],
  exports: [OrdersService],
})
export class OrdersModule {}
