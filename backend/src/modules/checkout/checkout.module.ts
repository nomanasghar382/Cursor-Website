import { Module } from "@nestjs/common";
import { CartModule } from "../cart/cart.module";
import { CouponsModule } from "../coupons/coupons.module";
import { PaymentsModule } from "../payments/payments.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { CheckoutController } from "./controllers/checkout.controller";
import { CheckoutRepository } from "./repositories/checkout.repository";
import { CheckoutService } from "./services/checkout.service";

@Module({
  imports: [CartModule, CouponsModule, PaymentsModule, NotificationsModule],
  controllers: [CheckoutController],
  providers: [CheckoutService, CheckoutRepository],
  exports: [CheckoutService],
})
export class CheckoutModule {}
