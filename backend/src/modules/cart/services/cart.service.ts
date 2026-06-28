import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { AddCartItemDto, SaveForLaterDto, SyncCartDto, UpdateCartItemDto } from "../dto/cart.dto";
import { CartLineView, CartView } from "../entities/cart.entity";
import { CartRepository, CartWithItems } from "../repositories/cart.repository";

type SavedForLaterEntry = {
  variantId: string;
  quantity: number;
  priceSnapshot: number;
  name: string;
  slug: string;
  sku: string;
  productId: string;
  imageUrl?: string;
  gradient: string;
  brand?: string;
};

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  async getCart(userId: string): Promise<{ cart: CartView }> {
    const cart = await this.cartRepository.findOrCreate(userId);
    return { cart: this.toCartView(cart) };
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const variant = await this.cartRepository.findVariant(dto.variantId);
    if (!variant) {
      throw new NotFoundException("Product variant not found.");
    }

    const stock = variant.inventoryItems.reduce((sum, item) => sum + item.availableQuantity, 0);
    const quantity = dto.quantity ?? 1;
    if (stock < quantity) {
      throw new BadRequestException("Insufficient inventory for the requested quantity.");
    }

    const cart = await this.cartRepository.findOrCreate(userId);
    const existing = cart.items.find((item) => item.variantId === dto.variantId);
    const nextQuantity = (existing?.quantity ?? 0) + quantity;
    if (stock < nextQuantity) {
      throw new BadRequestException("Insufficient inventory for the requested quantity.");
    }

    await this.cartRepository.upsertItem(cart.id, dto.variantId, nextQuantity, Number(variant.price));
    const refreshed = await this.cartRepository.findByUserId(userId);
    return { cart: this.toCartView(refreshed!) };
  }

  async updateItem(userId: string, variantId: string, dto: UpdateCartItemDto) {
    const cart = await this.cartRepository.findOrCreate(userId);
    const line = cart.items.find((item) => item.variantId === variantId);
    if (!line) {
      throw new NotFoundException("Cart item not found.");
    }

    const stock = line.variant.inventoryItems.reduce((sum, item) => sum + item.availableQuantity, 0);
    if (stock < dto.quantity) {
      throw new BadRequestException("Insufficient inventory for the requested quantity.");
    }

    await this.cartRepository.updateItemQuantity(cart.id, variantId, dto.quantity);
    const refreshed = await this.cartRepository.findByUserId(userId);
    return { cart: this.toCartView(refreshed!) };
  }

  async removeItem(userId: string, variantId: string) {
    const cart = await this.cartRepository.findOrCreate(userId);
    const line = cart.items.find((item) => item.variantId === variantId);
    if (!line) {
      throw new NotFoundException("Cart item not found.");
    }

    await this.cartRepository.removeItem(cart.id, variantId);
    const refreshed = await this.cartRepository.findByUserId(userId);
    return { cart: this.toCartView(refreshed!) };
  }

  async syncCart(userId: string, dto: SyncCartDto) {
    const cart = await this.cartRepository.findOrCreate(userId);
    for (const entry of dto.items) {
      const variant = await this.cartRepository.findVariant(entry.variantId);
      if (!variant) continue;
      const stock = variant.inventoryItems.reduce((sum, item) => sum + item.availableQuantity, 0);
      const quantity = Math.min(entry.quantity, stock);
      if (quantity <= 0) continue;

      const existing = cart.items.find((item) => item.variantId === entry.variantId);
      const mergedQuantity = Math.min(stock, (existing?.quantity ?? 0) + quantity);
      await this.cartRepository.upsertItem(cart.id, entry.variantId, mergedQuantity, Number(variant.price));
    }

    const refreshed = await this.cartRepository.findByUserId(userId);
    return { cart: this.toCartView(refreshed!) };
  }

  async saveForLater(userId: string, dto: SaveForLaterDto) {
    const cart = await this.cartRepository.findOrCreate(userId);
    const line = cart.items.find((item) => item.variantId === dto.variantId);
    if (!line) {
      throw new NotFoundException("Cart item not found.");
    }

    const metadata = (cart.metadata ?? {}) as { savedForLater?: SavedForLaterEntry[] };
    const saved = metadata.savedForLater ?? [];
    const mapped = this.toLineView(line);
    const nextSaved = [
      {
        variantId: mapped.variantId,
        quantity: mapped.quantity,
        priceSnapshot: mapped.unitPrice,
        name: mapped.name,
        slug: mapped.slug,
        sku: mapped.sku,
        productId: mapped.productId,
        imageUrl: mapped.imageUrl,
        gradient: mapped.gradient,
        brand: mapped.brand,
      },
      ...saved.filter((entry) => entry.variantId !== dto.variantId),
    ];

    await this.cartRepository.removeItem(cart.id, dto.variantId);
    await this.cartRepository.updateMetadata(cart.id, { ...metadata, savedForLater: nextSaved });
    const refreshed = await this.cartRepository.findByUserId(userId);
    return { cart: this.toCartView(refreshed!) };
  }

  async moveSavedToCart(userId: string, variantId: string) {
    const cart = await this.cartRepository.findOrCreate(userId);
    const metadata = (cart.metadata ?? {}) as { savedForLater?: SavedForLaterEntry[] };
    const saved = metadata.savedForLater ?? [];
    const entry = saved.find((item) => item.variantId === variantId);
    if (!entry) {
      throw new NotFoundException("Saved item not found.");
    }

    await this.addItem(userId, { variantId, quantity: entry.quantity });
    await this.cartRepository.updateMetadata(cart.id, {
      ...metadata,
      savedForLater: saved.filter((item) => item.variantId !== variantId),
    });
    const refreshed = await this.cartRepository.findByUserId(userId);
    return { cart: this.toCartView(refreshed!) };
  }

  async clearCart(userId: string) {
    const cart = await this.cartRepository.findOrCreate(userId);
    await this.cartRepository.clearItems(cart.id);
    const refreshed = await this.cartRepository.findByUserId(userId);
    return { cart: this.toCartView(refreshed!) };
  }

  private toCartView(cart: CartWithItems): CartView {
    const items = cart.items.map((item) => this.toLineView(item));
    const metadata = (cart.metadata ?? {}) as { savedForLater?: SavedForLaterEntry[] };
    const savedForLater = (metadata.savedForLater ?? []).map((entry) => ({
      id: entry.variantId,
      variantId: entry.variantId,
      productId: entry.productId,
      name: entry.name,
      slug: entry.slug,
      sku: entry.sku,
      imageUrl: entry.imageUrl,
      gradient: entry.gradient,
      quantity: entry.quantity,
      unitPrice: entry.priceSnapshot,
      lineTotal: entry.priceSnapshot * entry.quantity,
      stock: entry.quantity,
      brand: entry.brand,
    }));
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

    return {
      id: cart.id,
      currencyCode: cart.currencyCode,
      items,
      savedForLater,
      subtotal,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      estimatedTax: Number((subtotal * 0.08875).toFixed(2)),
      shippingEstimate: subtotal >= 150 ? 0 : 19.95,
      aiSuggestions: [
        "Bundle immersive audio with your robotics pick for 12% better fulfillment confidence.",
        "Apply NOVAEXVIP20 for premium launch savings on orders over $200.",
      ],
      crossSell: items.slice(0, 2).map((item) => item.name),
      upsell: items.slice(0, 1).map((item) => `${item.name} extended warranty`),
    };
  }

  private toLineView(item: CartWithItems["items"][number]): CartLineView {
    const product = item.variant.product;
    const stock = item.variant.inventoryItems.reduce((sum, inventory) => sum + inventory.availableQuantity, 0);
    const unitPrice = Number(item.priceSnapshot);
    return {
      id: item.id,
      variantId: item.variantId,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      sku: item.variant.sku,
      imageUrl: product.images[0]?.url,
      gradient: this.gradientForCategory(product.category.slug),
      quantity: item.quantity,
      unitPrice,
      lineTotal: Number((unitPrice * item.quantity).toFixed(2)),
      stock,
      brand: product.brand?.name,
    };
  }

  private gradientForCategory(category: string): string {
    const gradients: Record<string, string> = {
      robotics: "from-cyan-400 via-blue-500 to-violet-600",
      "smart-home": "from-emerald-300 via-teal-500 to-cyan-600",
      wearables: "from-fuchsia-400 via-rose-500 to-orange-500",
      "immersive-audio": "from-indigo-400 via-purple-500 to-pink-500",
    };
    return gradients[category] ?? "from-slate-300 via-slate-500 to-slate-700";
  }
}
