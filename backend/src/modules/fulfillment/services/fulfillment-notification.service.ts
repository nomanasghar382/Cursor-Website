import { Injectable } from "@nestjs/common";
import { NotificationService } from "../../notifications/services/notification.service";

@Injectable()
export class FulfillmentNotificationService {
  constructor(private readonly notificationService: NotificationService) {}

  async notifyOrderEvent(input: {
    userId: string;
    email?: string;
    orderNumber: string;
    title: string;
    body: string;
    templateKey?: string;
  }) {
    await this.notificationService.notifyUser({
      userId: input.userId,
      title: input.title,
      body: input.body,
      email: input.email,
    });
  }

  orderConfirmation(userId: string, email: string | undefined, orderNumber: string) {
    return this.notifyOrderEvent({
      userId,
      email,
      orderNumber,
      title: "Order confirmed",
      body: `Your order ${orderNumber} is confirmed and entering fulfillment.`,
      templateKey: "order_confirmation",
    });
  }

  paymentSuccess(userId: string, email: string | undefined, orderNumber: string) {
    return this.notifyOrderEvent({
      userId,
      email,
      orderNumber,
      title: "Payment successful",
      body: `Payment for order ${orderNumber} was captured successfully.`,
      templateKey: "payment_success",
    });
  }

  shipmentUpdate(userId: string, email: string | undefined, orderNumber: string, message: string) {
    return this.notifyOrderEvent({
      userId,
      email,
      orderNumber,
      title: "Shipment update",
      body: `${orderNumber}: ${message}`,
      templateKey: "shipment_update",
    });
  }

  deliveryUpdate(userId: string, email: string | undefined, orderNumber: string) {
    return this.notifyOrderEvent({
      userId,
      email,
      orderNumber,
      title: "Delivered",
      body: `Your order ${orderNumber} has been delivered.`,
      templateKey: "delivery_update",
    });
  }

  refundUpdate(userId: string, email: string | undefined, orderNumber: string, amount: number) {
    return this.notifyOrderEvent({
      userId,
      email,
      orderNumber,
      title: "Refund processed",
      body: `A refund of $${amount.toFixed(2)} has been initiated for order ${orderNumber}.`,
      templateKey: "refund_update",
    });
  }

  async notifyLowStock(items: Array<{ sku: string; productName: string; available: number }>) {
    void items;
  }
}
