import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { FulfillmentRepository } from "../repositories/fulfillment.repository";
import { FulfillmentNotificationService } from "./fulfillment-notification.service";

@Injectable()
export class OrderInventoryService {
  private readonly logger = new Logger(OrderInventoryService.name);

  constructor(
    private readonly fulfillmentRepository: FulfillmentRepository,
    private readonly notificationService: FulfillmentNotificationService,
  ) {}

  async verifyOrderStock(orderId: string) {
    const items = await this.fulfillmentRepository.getOrderItems(orderId);
    const failures: string[] = [];

    for (const item of items) {
      if (!item.variantId) continue;
      const stock = item.variant?.inventoryItems?.reduce((sum, entry) => sum + entry.availableQuantity, 0) ?? 0;
      if (stock < item.quantity) failures.push(item.productNameSnapshot);
    }

    return { valid: failures.length === 0, failures };
  }

  async commitOrderInventory(orderId: string) {
    const items = await this.fulfillmentRepository.getOrderItems(orderId);
    for (const item of items) {
      if (!item.variantId) continue;
      await this.fulfillmentRepository.commitReservedInventory(item.variantId, item.quantity);
    }
    await this.checkLowStock();
  }

  async restoreOrderInventory(orderId: string) {
    const items = await this.fulfillmentRepository.getOrderItems(orderId);
    for (const item of items) {
      if (!item.variantId) continue;
      await this.fulfillmentRepository.restoreInventory(item.variantId, item.quantity);
    }
  }

  private async checkLowStock() {
    const lowStock = await this.fulfillmentRepository.findLowStockItems();
    if (lowStock.length === 0) return;

    this.logger.warn(`Low stock detected for ${lowStock.length} SKUs`);
    await this.notificationService.notifyLowStock(
      lowStock.map((entry) => ({
        sku: entry.variant.sku,
        productName: entry.variant.product.name,
        available: entry.availableQuantity,
      })),
    );
  }
}
