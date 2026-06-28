import { Injectable, NotFoundException } from "@nestjs/common";
import { AddWishlistItemDto, CreateWishlistDto } from "../dto/wishlist.dto";
import { WishlistRepository, WishlistWithItems } from "../repositories/wishlist.repository";

@Injectable()
export class WishlistService {
  constructor(private readonly wishlistRepository: WishlistRepository) {}

  async list(userId: string) {
    const wishlists = await this.wishlistRepository.listByUser(userId);
    if (wishlists.length === 0) {
      const created = await this.wishlistRepository.findOrCreateDefault(userId);
      return { wishlists: [this.toWishlistView(created)] };
    }
    return { wishlists: wishlists.map((wishlist) => this.toWishlistView(wishlist)) };
  }

  async create(userId: string, dto: CreateWishlistDto) {
    const wishlist = await this.wishlistRepository.create(userId, dto.name);
    return { wishlist: this.toWishlistView(wishlist) };
  }

  async getById(userId: string, wishlistId: string) {
    const wishlist = await this.wishlistRepository.findById(userId, wishlistId);
    if (!wishlist) throw new NotFoundException("Wishlist not found.");
    return { wishlist: this.toWishlistView(wishlist) };
  }

  async addItem(userId: string, wishlistId: string | undefined, dto: AddWishlistItemDto) {
    const wishlist = wishlistId
      ? await this.wishlistRepository.findById(userId, wishlistId)
      : await this.wishlistRepository.findOrCreateDefault(userId);
    if (!wishlist) throw new NotFoundException("Wishlist not found.");

    await this.wishlistRepository.addItem(wishlist.id, dto.productId, dto.variantId);
    const refreshed = await this.wishlistRepository.findById(userId, wishlist.id);
    return { wishlist: this.toWishlistView(refreshed!) };
  }

  async removeItem(userId: string, itemId: string) {
    const wishlists = await this.wishlistRepository.listByUser(userId);
    const item = wishlists.flatMap((wishlist) => wishlist.items).find((entry) => entry.id === itemId);
    if (!item) throw new NotFoundException("Wishlist item not found.");

    await this.wishlistRepository.removeItem(itemId);
    const refreshed = await this.wishlistRepository.findById(userId, item.wishlistId);
    return { wishlist: this.toWishlistView(refreshed!) };
  }

  async share(userId: string, wishlistId: string) {
    const wishlist = await this.wishlistRepository.findById(userId, wishlistId);
    if (!wishlist) throw new NotFoundException("Wishlist not found.");
    return { shareUrl: `/wishlist/shared/${wishlistId}`, token: wishlistId };
  }

  async getShared(wishlistId: string) {
    const wishlist = await this.wishlistRepository.findByIdPublic(wishlistId);
    if (!wishlist) throw new NotFoundException("Shared wishlist not found.");
    return { wishlist: this.toWishlistView(wishlist) };
  }

  private toWishlistView(wishlist: WishlistWithItems) {
    return {
      id: wishlist.id,
      name: wishlist.name,
      isDefault: wishlist.isDefault,
      itemCount: wishlist.items.length,
      analytics: {
        views: wishlist.items.length * 3,
        shares: wishlist.isDefault ? 1 : 0,
      },
      items: wishlist.items.map((item) => {
        const variant = item.variant ?? item.product.variants[0];
        const price = Number(variant?.price ?? item.product.basePrice);
        const stock = variant?.inventoryItems.reduce((sum, entry) => sum + entry.availableQuantity, 0) ?? 0;
        return {
          id: item.id,
          productId: item.productId,
          variantId: variant?.id,
          name: item.product.name,
          slug: item.product.slug,
          imageUrl: item.product.images[0]?.url,
          category: item.product.category.name,
          brand: item.product.brand?.name,
          price,
          stock,
          inStock: stock > 0,
          priceDropAlert: true,
          backInStockAlert: true,
          gradient: this.gradientForCategory(item.product.category.slug),
        };
      }),
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
