import { Module } from "@nestjs/common";
import { NotificationsModule } from "../notifications/notifications.module";
import { PaymentsController } from "./controllers/payments.controller";
import { StripeService } from "./services/stripe.service";

@Module({
  imports: [NotificationsModule],
  controllers: [PaymentsController],
  providers: [StripeService],
  exports: [StripeService],
})
export class PaymentsModule {}
