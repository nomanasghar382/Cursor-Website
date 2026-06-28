import { Injectable } from "@nestjs/common";
import { ProductQueryDto } from "../dto/product-query.dto";
import { ProductCard } from "../entities/product-card.entity";
import { ProductDetail } from "../entities/product-detail.entity";
import { ProductsRepository, ProductWithRelations } from "../repositories/products.repository";

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async list(query: ProductQueryDto) {
    const result = await this.productsRepository.findCatalog(query);
    const products = result.products.map((product) => this.toProductCard(product));
    const filtered =
      query.minRating !== undefined ? products.filter((product) => product.rating >= query.minRating!) : products;

    return {
      products: filtered,
      count: filtered.length,
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasMore: result.page * result.limit < result.total,
      facets: await this.productsRepository.findFacets(query),
    };
  }

  async getById(id: string): Promise<{ product: ProductDetail }> {
    const product = await this.productsRepository.findById(id);
    const related = await this.productsRepository.findRelated(product, 8);
    const cards = related.map((entry) => this.toProductCard(entry));

    return {
      product: {
        ...this.toProductCard(product),
        currencyCode: product.currencyCode,
        specifications: product.specifications.map((spec) => ({
          key: spec.specKey,
          value: spec.specValue,
          unit: spec.unit ?? undefined,
        })),
        images: product.images.map((image) => ({
          id: image.id,
          url: image.url,
          altText: image.altText ?? undefined,
          isPrimary: image.isPrimary,
        })),
        variants: product.variants.map((variant) => this.toVariantView(variant)),
        reviews: product.reviews.map((review) => ({
          id: review.id,
          rating: review.rating,
          title: review.title ?? undefined,
          body: review.body,
          author: [review.user.profile?.firstName, review.user.profile?.lastName].filter(Boolean).join(" ") || "NOVAEX Customer",
          createdAt: review.createdAt.toISOString(),
          verified: Boolean(review.orderItemId),
          images: review.images.map((image) => image.imageUrl),
        })),
        questions: product.questions.map((entry) => ({
          id: entry.id,
          question: entry.question,
          answer: entry.answers[0]?.answer,
          author: [entry.user.profile?.firstName, entry.user.profile?.lastName].filter(Boolean).join(" ") || "Customer",
          createdAt: entry.createdAt.toISOString(),
        })),
        assets360: product.assets360.map((asset) => ({ url: asset.assetUrl, frameCount: asset.frameCount })),
        model3dUrl: product.models3d[0]?.modelUrl,
        arModelUrl: product.arModels[0]?.modelUrl,
        aiSummary: this.buildAiSummary(product),
        aiHighlights: this.buildAiHighlights(product),
        aiAlternatives: cards.slice(0, 3),
        crossSell: cards.slice(0, 4),
        upsell: cards.slice(2, 6),
        frequentlyBoughtTogether: cards.slice(1, 4),
        similarProducts: cards.slice(0, 6),
        estimatedDeliveryDays: this.getStock(product) > 0 ? 2 : 7,
      },
    };
  }

  private toProductCard(product: ProductWithRelations): ProductCard {
    const variant = product.variants[0];
    const stock = this.getStock(product);
    const rating = this.getRating(product);
    const compareAtPrice = variant?.compareAtPrice ? Number(variant.compareAtPrice) : undefined;
    const price = Number(variant?.price ?? product.basePrice);
    const discountPercent =
      compareAtPrice && compareAtPrice > price ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : undefined;
    const isNew = Date.now() - product.createdAt.getTime() < 30 * 24 * 60 * 60 * 1000;
    const badges = [
      Number(product.aiScore) > 95 ? "AI Recommended" : "NOVAEX Verified",
      ...(isNew ? ["New"] : []),
      ...(discountPercent && discountPercent >= 10 ? ["Sale"] : []),
      ...(stock > 0 && stock < 8 ? ["Limited"] : []),
    ];

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
      badge: badges[0],
      badges,
      aiMatch: Number(product.aiScore),
      description: product.description,
      gradient: this.gradientForCategory(product.category.slug),
      imageUrl: product.images.find((image) => image.isPrimary)?.url ?? product.images[0]?.url,
      colors: this.extractColors(product),
      discountPercent,
      createdAt: product.createdAt.toISOString(),
    };
  }

  private toVariantView(variant: ProductWithRelations["variants"][number]) {
    const stock = variant.inventoryItems.reduce((sum, item) => sum + item.availableQuantity, 0);
    const metadata = (variant.metadata ?? {}) as Record<string, string>;
    const color = this.findAttribute(variant, "color") ?? metadata.color;
    const size = this.findAttribute(variant, "size") ?? metadata.size;
    const material = this.findAttribute(variant, "material") ?? metadata.material;

    return {
      id: variant.id,
      sku: variant.sku,
      price: Number(variant.price),
      compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : undefined,
      stock,
      color,
      size,
      material,
      label: [color, size, material].filter(Boolean).join(" · ") || variant.sku,
    };
  }

  private findAttribute(variant: ProductWithRelations["variants"][number], slug: string) {
    const match = variant.productAttributes.find((entry) => entry.attribute.slug === slug);
    return match?.attributeValue?.value ?? match?.rawValue ?? undefined;
  }

  private getStock(product: ProductWithRelations) {
    return product.variants.reduce(
      (sum, variant) => sum + variant.inventoryItems.reduce((inventorySum, item) => inventorySum + item.availableQuantity, 0),
      0,
    );
  }

  private getRating(product: ProductWithRelations) {
    if (product.reviews.length === 0) return 4.8;
    return Number((product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length).toFixed(1));
  }

  private extractColors(product: ProductWithRelations) {
    const colors = product.variants
      .map((variant) => this.findAttribute(variant, "color"))
      .filter((value): value is string => Boolean(value));
    return [...new Set(colors)];
  }

  private buildAiSummary(product: ProductWithRelations) {
    return `${product.name} is ranked in the top ${Math.max(5, Math.round(100 - Number(product.aiScore)))}% of ${product.category.name.toLowerCase()} experiences on NOVAEX, combining premium materials, verified reviews, and adaptive fulfillment intelligence.`;
  }

  private buildAiHighlights(product: ProductWithRelations) {
    return [
      `${Number(product.aiScore)}% AI confidence score across browsing and conversion signals`,
      `${this.getStock(product)} units available across active variants`,
      product.brand?.isVerified ? `${product.brand.name} is a verified NOVAEX brand partner` : "Curated by NOVAEX merchandising intelligence",
    ];
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
