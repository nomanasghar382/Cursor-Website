import { BadRequestException, NotFoundException } from "@nestjs/common";
import { PaymentFulfillmentService } from "./payment-fulfillment.service";
import { FulfillmentRepository } from "../repositories/fulfillment.repository";
import { StripeService } from "../../payments/services/stripe.service";
import { OrderInventoryService } from "./order-inventory.service";
import { OrderLifecycleService } from "./order-lifecycle.service";
import { FulfillmentNotificationService } from "./fulfillment-notification.service";

describe("PaymentFulfillmentService", () => {
  const fulfillmentRepository = {
    findPaymentByIntentId: jest.fn(),
    updatePayment: jest.fn(),
    createPaymentTransaction: jest.fn(),
    findOrderForUser: jest.fn(),
    findOrderById: jest.fn(),
    createRefund: jest.fn(),
    updateOrder: jest.fn(),
    listPayments: jest.fn(),
  } as unknown as FulfillmentRepository;

  const stripeService = {
    retrievePaymentIntent: jest.fn(),
    createPaymentIntent: jest.fn(),
    createRefund: jest.fn(),
  } as unknown as StripeService;

  const inventoryService = {
    restoreOrderInventory: jest.fn(),
    reserveOrderInventory: jest.fn(),
    commitOrderInventory: jest.fn(),
  } as unknown as OrderInventoryService;

  const lifecycleService = {
    transitionOrder: jest.fn(),
  } as unknown as OrderLifecycleService;

  const notificationService = {
    refundUpdate: jest.fn(),
    paymentCaptured: jest.fn(),
    paymentSuccess: jest.fn(),
    orderConfirmation: jest.fn(),
  } as unknown as FulfillmentNotificationService;

  const service = new PaymentFulfillmentService(
    fulfillmentRepository,
    stripeService,
    inventoryService,
    lifecycleService,
    notificationService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("confirms payment when intent succeeded", async () => {
    const payment = {
      id: "pay-1",
      orderId: "order-1",
      amount: 120,
      order: {
        id: "order-1",
        grandTotal: 120,
        status: "PENDING_PAYMENT",
        userId: "user-1",
        orderNumber: "ORD-1001",
        user: { email: "user@novaex.ai" },
      },
    };
    (fulfillmentRepository.findPaymentByIntentId as jest.Mock).mockResolvedValue(payment);
    (stripeService.retrievePaymentIntent as jest.Mock).mockResolvedValue({ id: "pi_1", status: "succeeded" });

    await service.confirmPayment("pi_1");
    expect(fulfillmentRepository.updatePayment).toHaveBeenCalledWith("pay-1", { status: "CAPTURED" });
  });

  it("rejects non-succeeded payment intents", async () => {
    (fulfillmentRepository.findPaymentByIntentId as jest.Mock).mockResolvedValue({
      id: "pay-1",
      orderId: "order-1",
      order: { grandTotal: 120 },
    });
    (stripeService.retrievePaymentIntent as jest.Mock).mockResolvedValue({ status: "requires_payment_method" });

    await expect(service.confirmPayment("pi_1")).rejects.toBeInstanceOf(BadRequestException);
  });

  it("restores inventory when stripe payment fails", async () => {
    (fulfillmentRepository.findPaymentByIntentId as jest.Mock).mockResolvedValue({
      id: "pay-1",
      orderId: "order-1",
      amount: 99,
      order: { status: "PENDING_PAYMENT" },
    });

    await service.handleStripePaymentFailed("pi_failed");

    expect(fulfillmentRepository.updatePayment).toHaveBeenCalledWith("pay-1", { status: "FAILED" });
    expect(inventoryService.restoreOrderInventory).toHaveBeenCalledWith("order-1");
    expect(lifecycleService.transitionOrder).toHaveBeenCalledWith("order-1", "CANCELLED", "Payment failed", "system");
  });

  it("throws when payment is missing on confirm", async () => {
    (fulfillmentRepository.findPaymentByIntentId as jest.Mock).mockResolvedValue(null);
    await expect(service.confirmPayment("pi_missing")).rejects.toBeInstanceOf(NotFoundException);
  });
});
