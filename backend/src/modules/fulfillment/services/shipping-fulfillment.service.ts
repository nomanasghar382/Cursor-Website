import { Injectable, NotFoundException } from "@nestjs/common";
import { FulfillmentRepository } from "../repositories/fulfillment.repository";
import { UpdateShipmentDto } from "../dto/fulfillment.dto";
import { FulfillmentNotificationService } from "./fulfillment-notification.service";
import { shipmentStatusForOrderStatus } from "../utils/order-workflow.util";

@Injectable()
export class ShippingFulfillmentService {
  constructor(
    private readonly fulfillmentRepository: FulfillmentRepository,
    private readonly notificationService: FulfillmentNotificationService,
  ) {}

  async getShippingCatalog() {
    const [methods, zones] = await Promise.all([
      this.fulfillmentRepository.getShippingMethods(),
      this.fulfillmentRepository.getShippingZones(),
    ]);

    return {
      methods: methods.map((method) => ({
        id: method.id,
        name: method.name,
        carrier: method.carrier,
        serviceLevel: method.serviceLevel,
        price: Number(method.basePrice),
        currencyCode: method.currencyCode,
        estimatedDays: method.serviceLevel.includes("priority") ? 2 : 5,
      })),
      zones: zones.map((zone) => ({
        id: zone.id,
        name: zone.name,
        country: zone.country.name,
        city: zone.city?.name,
        postalCodePattern: zone.postalCodePattern,
      })),
      architecture: {
        carrierIntegration: "Webhook-ready carrier adapter layer (FedEx, UPS, DHL, USPS)",
        rateShopping: "Zone + method based pricing with free-shipping thresholds",
      },
    };
  }

  calculateDeliveryCharge(input: { methodPrice: number; subtotal: number; zoneName?: string }) {
    const freeShippingThreshold = 150;
    const shippingTotal = input.subtotal >= freeShippingThreshold ? 0 : input.methodPrice;
    return {
      shippingTotal,
      freeShippingApplied: shippingTotal === 0,
      zone: input.zoneName ?? "default",
      estimatedDays: shippingTotal === 0 ? 5 : 3,
    };
  }

  async updateShipment(shipmentId: string, dto: UpdateShipmentDto) {
    const shipment = await this.fulfillmentRepository.getShipment(shipmentId);
    if (!shipment) throw new NotFoundException("Shipment not found.");

    const updated = await this.fulfillmentRepository.updateShipment(shipmentId, {
      ...(dto.trackingNumber ? { trackingNumber: dto.trackingNumber } : {}),
      ...(dto.status ? { status: dto.status as never } : {}),
      ...(dto.status === "SHIPPED" ? { shippedAt: new Date() } : {}),
      ...(dto.status === "DELIVERED" ? { deliveredAt: new Date() } : {}),
    });

    if (dto.message) {
      await this.fulfillmentRepository.addTrackingEvent({
        shipment: { connect: { id: shipmentId } },
        status: dto.status ?? updated.status,
        message: dto.message,
        location: dto.location,
        occurredAt: new Date(),
      });
    }

    if (dto.status === "IN_TRANSIT" || dto.status === "SHIPPED") {
      const order = await this.fulfillmentRepository.findOrderById(shipment.orderId);
      if (order?.user) {
        await this.notificationService.shipmentUpdate(
          order.userId,
          order.user.email,
          order.orderNumber,
          dto.message ?? `Shipment is now ${dto.status ?? updated.status}.`,
        );
      }
    }

    return { shipment: updated };
  }

  async syncShipmentWithOrderStatus(shipmentId: string, orderStatus: string) {
    const status = shipmentStatusForOrderStatus(orderStatus);
    return this.updateShipment(shipmentId, {
      status,
      message: `Order moved to ${orderStatus.replaceAll("_", " ").toLowerCase()}.`,
    });
  }

  async listShipments(query: { page?: number; limit?: number; status?: string }) {
    const [items, total] = await this.fulfillmentRepository.listShipments(query);
    return {
      shipments: items.map((shipment) => ({
        id: shipment.id,
        orderId: shipment.orderId,
        orderNumber: shipment.order.orderNumber,
        customerEmail: shipment.order.user?.email,
        carrier: shipment.carrier,
        status: shipment.status,
        trackingNumber: shipment.trackingNumber,
        method: shipment.shippingMethod.name,
        updatedAt: shipment.updatedAt.toISOString(),
      })),
      total,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    };
  }
}
