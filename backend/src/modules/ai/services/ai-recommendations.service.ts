import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ProductsService } from "../../products/services/products.service";
import { ProductCard } from "../../products/entities/product-card.entity";
import { CartRepository } from "../../cart/repositories/cart.repository";
import { AI_CONFIG_KEY } from "../ai.config";
import { AiRecommendationsQueryDto } from "../dto/ai.dto";
import { AiRepository } from "../repositories/ai.repository";
import { AiUsageService } from "./ai-usage.service";

@Injectable()
export class AiRecommendationsService {
  constructor(
    private readonly aiRepository: AiRepository,
    private readonly productsService: ProductsService,
    private readonly cartRepository: CartRepository,
    private readonly aiUsageService: AiUsageService,
    private readonly configService: ConfigService,
  ) {}

  async getRecommendations(userId: string | undefined, query: AiRecommendationsQueryDto) {
    const type = query.type ?? "personalized";
    const limit = query.limit ?? this.configService.get<number>(`${AI_CONFIG_KEY}.recommendationLimit`) ?? 8;

    let products: ProductCard[] = [];
    let reason = "AI catalog recommendations";

    switch (type) {
      case "personalized":
        products = await this.getPersonalized(userId, limit);
        reason = "Personalized from AI recommendation records";
        break;
      case "recently-viewed":
        products = await this.getRecentlyViewed(userId, limit);
        reason = "Based on your recently viewed products";
        break;
      case "cart":
        products = await this.getCartBased(userId, limit);
        reason = "Complements items in your cart";
        break;
      case "purchase-history":
        products = await this.getPurchaseHistory(userId, limit);
        reason = "Inspired by your purchase history";
        break;
      case "similar":
        products = await this.getSimilar(query.productId, limit);
        reason = "Visually and categorically similar products";
        break;
      case "frequently-bought-together":
        products = await this.getFrequentlyBoughtTogether(query.productId, limit);
        reason = "Frequently bought together";
        break;
      case "cross-sell":
        products = await this.getCrossSell(query.productId, limit);
        reason = "Cross-sell opportunities";
        break;
      case "upsell":
        products = await this.getUpsell(query.productId, limit);
        reason = "Premium upgrade paths";
        break;
      default:
        throw new BadRequestException("Unsupported recommendation type.");
    }

    await this.aiUsageService.track("ai.recommendations", {
      userId,
      productId: query.productId,
      properties: { type, count: products.length },
    });

    return { type, reason, products };
  }

  private async getPersonalized(userId: string | undefined, limit: number) {
    if (!userId) {
      const trending = await this.productsService.list({ section: "featured", limit, sort: "ai-recommended" });
      return trending.products;
    }

    const records = await this.aiRepository.getPersonalizedRecommendations(userId, limit);
    if (records.length === 0) {
      const fallback = await this.productsService.list({ section: "trending", limit, sort: "ai-recommended" });
      return fallback.products;
    }

    return records.map((record) => this.mapDbProduct(record.product));
  }

  private async getRecentlyViewed(userId: string | undefined, limit: number) {
    if (!userId) return [];
    const entries = await this.aiRepository.getRecentlyViewed(userId, limit);
    return entries.map((entry) => this.mapDbProduct(entry.product));
  }

  private async getCartBased(userId: string | undefined, limit: number) {
    if (!userId) return [];
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart || cart.items.length === 0) {
      const fallback = await this.productsService.list({ section: "featured", limit, sort: "ai-recommended" });
      return fallback.products;
    }

    const cartProductIds = new Set(cart.items.map((item) => item.variant.product.id));
    const categorySlug = cart.items[0]?.variant.product.category?.slug;

    const catalog = await this.productsService.list({
      category: categorySlug,
      limit: limit + cart.items.length,
      sort: "ai-recommended",
    });
    return catalog.products.filter((product) => !cartProductIds.has(product.id)).slice(0, limit);
  }

  private async getPurchaseHistory(userId: string | undefined, limit: number) {
    if (!userId) return [];
    const purchases = await this.aiRepository.getPurchaseHistoryProductIds(userId, limit);
    const products = await this.aiRepository.findProductsByIds(purchases.map((entry) => entry.productId));
    const mapped = products.map((product) => this.mapDbProduct(product));

    if (mapped.length >= limit) return mapped.slice(0, limit);

    const relatedCatalog = await this.productsService.list({ limit, sort: "ai-recommended" });
    const existing = new Set(mapped.map((product) => product.id));
    const merged = [...mapped, ...relatedCatalog.products.filter((product) => !existing.has(product.id))];
    return merged.slice(0, limit);
  }

  private async getSimilar(productId: string | undefined, limit: number) {
    if (!productId) throw new BadRequestException("productId is required for similar recommendations.");
    const detail = await this.productsService.getById(productId);
    return detail.product.similarProducts.slice(0, limit);
  }

  private async getFrequentlyBoughtTogether(productId: string | undefined, limit: number) {
    if (!productId) throw new BadRequestException("productId is required for frequently bought together.");
    const detail = await this.productsService.getById(productId);
    return detail.product.frequentlyBoughtTogether.slice(0, limit);
  }

  private async getCrossSell(productId: string | undefined, limit: number) {
    if (!productId) throw new BadRequestException("productId is required for cross-sell recommendations.");
    const detail = await this.productsService.getById(productId);
    return detail.product.crossSell.slice(0, limit);
  }

  private async getUpsell(productId: string | undefined, limit: number) {
    if (!productId) throw new BadRequestException("productId is required for upsell recommendations.");
    const detail = await this.productsService.getById(productId);
    return detail.product.upsell.slice(0, limit);
  }

  private mapDbProduct(product: {
    id: string;
    slug: string;
    name: string;
    description: string;
    basePrice: unknown;
    aiScore: unknown;
    createdAt: Date;
    category: { name: string; slug: string };
    brand?: { name: string; slug: string; isVerified?: boolean } | null;
    variants: Array<{
      price: unknown;
      compareAtPrice: unknown | null;
      inventoryItems: Array<{ availableQuantity: number }>;
    }>;
    images: Array<{ url: string; isPrimary: boolean }>;
    reviews: Array<{ rating: number }>;
  }): ProductCard {
    const variant = product.variants[0];
    const stock = product.variants.reduce(
      (sum, entry) => sum + entry.inventoryItems.reduce((inner, item) => inner + item.availableQuantity, 0),
      0,
    );
    const rating =
      product.reviews.length > 0
        ? Number((product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length).toFixed(1))
        : 4.8;
    const price = Number(variant?.price ?? product.basePrice);
    const compareAtPrice = variant?.compareAtPrice ? Number(variant.compareAtPrice) : undefined;
    const discountPercent =
      compareAtPrice && compareAtPrice > price ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : undefined;

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category.name,
      categorySlug: product.category.slug,
      brand: product.brand?.name,
      brandSlug: product.brand?.slug,
      price,
      compareAtPrice,
      rating,
      reviewCount: product.reviews.length,
      stock,
      badge: Number(product.aiScore) > 95 ? "AI Recommended" : "NOVAEX Verified",
      badges: [Number(product.aiScore) > 95 ? "AI Recommended" : "NOVAEX Verified"],
      aiMatch: Number(product.aiScore),
      description: product.description,
      gradient: "from-slate-300 via-slate-500 to-slate-700",
      imageUrl: product.images.find((image) => image.isPrimary)?.url ?? product.images[0]?.url,
      colors: [],
      discountPercent,
      createdAt: product.createdAt.toISOString(),
    };
  }
}
