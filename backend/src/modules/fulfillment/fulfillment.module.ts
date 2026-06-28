import { Module } from "@nestjs/common";
import { NotificationsModule } from "../notifications/notifications.module";
import { PaymentsModule } from "../payments/payments.module";
import { FulfillmentAdminController } from "./controllers/fulfillment-admin.controller";
import { FulfillmentController } from "./controllers/fulfillment.controller";
import { PaymentsWebhookController } from "./controllers/payments-webhook.controller";
import { TestPaymentsController } from "./controllers/test-payments.controller";
import { FulfillmentRepository } from "./repositories/fulfillment.repository";
import { FulfillmentNotificationService } from "./services/fulfillment-notification.service";
import { InvoiceFulfillmentService } from "./services/invoice-fulfillment.service";
import { OrderInventoryService } from "./services/order-inventory.service";
import { OrderLifecycleService } from "./services/order-lifecycle.service";
import { PaymentFulfillmentService } from "./services/payment-fulfillment.service";
import { ShippingFulfillmentService } from "./services/shipping-fulfillment.service";

@Module({
  imports: [PaymentsModule, NotificationsModule],
  controllers: [FulfillmentController, FulfillmentAdminController, PaymentsWebhookController, TestPaymentsController],
  providers: [
    FulfillmentRepository,
    FulfillmentNotificationService,
    OrderInventoryService,
    OrderLifecycleService,
    ShippingFulfillmentService,
    InvoiceFulfillmentService,
    PaymentFulfillmentService,
  ],
  exports: [
    FulfillmentRepository,
    OrderInventoryService,
    OrderLifecycleService,
    PaymentFulfillmentService,
    ShippingFulfillmentService,
    InvoiceFulfillmentService,
  ],
})
export class FulfillmentModule {}
