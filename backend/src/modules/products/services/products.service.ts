import { Injectable } from "@nestjs/common";
import { ProductQueryDto } from "../dto/product-query.dto";
import { ProductCard } from "../entities/product-card.entity";
import { ProductsRepository } from "../repositories/products.repository";

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async list(query: ProductQueryDto): Promise<{ products: ProductCard[]; count: number }> {
    const products = await this.productsRepository.findCatalog(query);
    const mapped = products.map((product): ProductCard => {
      const variant = product.variants[0];
      const availableStock = product.variants.reduce((sum, item) => sum + item.inventoryItems.reduce((inventorySum, inventory) => inventorySum + inventory.availableQuantity, 0), 0);
      const rating =
        product.reviews.length === 0 ? 4.8 : product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length;

      return {
        id: product.id,
        name: product.name,
        category: product.category.slug,
        price: Number(variant?.price ?? product.basePrice),
        rating: Number(rating.toFixed(1)),
        stock: availableStock,
        badge: product.aiScore.greaterThan(95) ? "AI Best Match" : "NOVAEX Verified",
        aiMatch: Number(product.aiScore),
        description: product.description,
        gradient: this.gradientForCategory(product.category.slug),
      };
    });

    return { products: mapped, count: mapped.length };
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
