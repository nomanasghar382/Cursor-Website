import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { FulfillmentRepository } from "../repositories/fulfillment.repository";
import {
  buildOrderTimeline,
  canTransitionOrderStatus,
  shipmentStatusForOrderStatus,
} from "../utils/order-workflow.util";
import { OrderInventoryService } from "./order-inventory.service";
import { FulfillmentNotificationService } from "./fulfillment-notification.service";
import { ShippingFulfillmentService } from "./shipping-fulfillment.service";

type OrderNote = {
  id: string;
  note: string;
  createdAt: string;
  author?: string;
};

@Injectable()
export class OrderLifecycleService {
  constructor(
    private readonly fulfillmentRepository: FulfillmentRepository,
    private readonly inventoryService: OrderInventoryService,
    private readonly notificationService: FulfillmentNotificationService,
    private readonly shippingService: ShippingFulfillmentService,
  ) {}

  async transitionOrder(orderId: string, nextStatus: string, note?: string, actor?: string) {
    const order = await this.fulfillmentRepository.findOrderById(orderId);
    if (!order) throw new NotFoundException("Order not found.");

    if (!canTransitionOrderStatus(order.status, nextStatus)) {
      throw new BadRequestException(`Cannot transition order from ${order.status} to ${nextStatus}.`);
    }

    const metadata = (order.metadata ?? {}) as { notes?: OrderNote[] };
    const notes = metadata.notes ?? [];
    if (note) {
      notes.push({
        id: crypto.randomUUID(),
        note,
        createdAt: new Date().toISOString(),
        author: actor,
      });
    }

    if (nextStatus === "CANCELLED") {
      await this.inventoryService.restoreOrderInventory(orderId);
    }

    const updated = await this.fulfillmentRepository.updateOrder(orderId, {
      status: nextStatus as never,
      metadata: { ...metadata, notes } satisfies Prisma.InputJsonObject,
    });

    const shipment = updated.shipments[0];
    if (shipment && ["PROCESSING", "SHIPPED", "DELIVERED"].includes(nextStatus)) {
      await this.shippingService.syncShipmentWithOrderStatus(shipment.id, nextStatus);
    }

    if (nextStatus === "SHIPPED" && order.user) {
      await this.notificationService.shipmentUpdate(
        order.userId,
        order.user.email,
        order.orderNumber,
        "Your package has shipped.",
      );
    }

    if (nextStatus === "DELIVERED" && order.user) {
      await this.notificationService.deliveryUpdate(order.userId, order.user.email, order.orderNumber);
    }

    return this.mapOrder(updated);
  }

  async addNote(orderId: string, note: string, actor?: string) {
    const order = await this.fulfillmentRepository.findOrderById(orderId);
    if (!order) throw new NotFoundException("Order not found.");

    const metadata = (order.metadata ?? {}) as { notes?: OrderNote[] };
    const notes = [
      ...(metadata.notes ?? []),
      { id: crypto.randomUUID(), note, createdAt: new Date().toISOString(), author: actor },
    ];

    const updated = await this.fulfillmentRepository.updateOrder(orderId, {
      metadata: { ...metadata, notes } satisfies Prisma.InputJsonObject,
    });
    return { notes: notes };
  }

  mapOrder(order: NonNullable<Awaited<ReturnType<FulfillmentRepository["findOrderById"]>>>) {
    const metadata = (order.metadata ?? {}) as {
      shippingAddress?: Record<string, string>;
      billingAddress?: Record<string, string>;
      deliveryInstructions?: string;
      notes?: OrderNote[];
    };
    const shipment = order.shipments[0];

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      currencyCode: order.currencyCode,
      subtotal: Number(order.subtotal),
      taxTotal: Number(order.taxTotal),
      shippingTotal: Number(order.shippingTotal),
      discountTotal: Number(order.discountTotal),
      grandTotal: Number(order.grandTotal),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      createdAt: order.createdAt.toISOString(),
      estimatedDeliveryDays: (shipment?.metadata as { estimatedDays?: number })?.estimatedDays ?? 5,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productNameSnapshot,
        sku: item.skuSnapshot,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
      })),
      shippingAddress: metadata.shippingAddress,
      billingAddress: metadata.billingAddress,
      deliveryInstructions: metadata.deliveryInstructions,
      notes: metadata.notes ?? [],
      payments: order.payments.map((payment) => ({
        id: payment.id,
        gateway: payment.gateway,
        status: payment.status,
        amount: Number(payment.amount),
        clientSecret: (payment.metadata as { clientSecret?: string })?.clientSecret,
        refunds: payment.refunds.map((refund) => ({
          id: refund.id,
          amount: Number(refund.amount),
          status: refund.status,
        })),
      })),
      shipments: order.shipments.map((entry) => ({
        id: entry.id,
        carrier: entry.carrier,
        status: entry.status,
        trackingNumber: entry.trackingNumber,
        method: entry.shippingMethod.name,
        shippedAt: entry.shippedAt?.toISOString(),
        deliveredAt: entry.deliveredAt?.toISOString(),
        events: entry.trackingEvents.map((event) => ({
          id: event.id,
          status: event.status,
          description: event.message,
          location: event.location,
          occurredAt: event.occurredAt.toISOString(),
        })),
      })),
      returns: order.returns.map((entry) => ({
        id: entry.id,
        status: entry.status,
        reason: entry.reason,
        requestedAt: entry.requestedAt.toISOString(),
      })),
      invoiceNumber: order.invoices[0]?.invoiceNumber,
      coupon: order.couponRedemptions[0]?.coupon.code,
      timeline: buildOrderTimeline(order.status, shipment?.status),
      customerEmail: order.user?.email,
      customerName: order.user?.profile
        ? `${order.user.profile.firstName ?? ""} ${order.user.profile.lastName ?? ""}`.trim()
        : order.user?.email,
    };
  }

  getShipmentStatusForOrder(status: string) {
    return shipmentStatusForOrderStatus(status);
  }
}
