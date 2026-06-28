import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { StorageService } from "../../storage/services/storage.service";
import { AI_CONFIG_KEY } from "../ai.config";
import { AiRepository } from "../repositories/ai.repository";
import { scoreLabelImageMatch } from "../utils/ai-ranking.util";
import { AiUsageService } from "./ai-usage.service";

@Injectable()
export class AiImageService {
  constructor(
    private readonly storageService: StorageService,
    private readonly aiRepository: AiRepository,
    private readonly aiUsageService: AiUsageService,
    private readonly configService: ConfigService,
  ) {}

  async search(userId: string | undefined, file: Express.Multer.File) {
    if (!this.configService.get<boolean>(`${AI_CONFIG_KEY}.imageSearchEnabled`)) {
      throw new ServiceUnavailableException("Image search is currently disabled.");
    }

    const upload = await this.storageService.uploadBuffer(file, "novaex/ai-image-search");
    const detectedLabels = this.detectLabelsFromFile(file);

    const imageSearch = await this.aiRepository.recordImageSearch({
      userId,
      imageUrl: upload.secureUrl,
      detectedLabels,
      metadata: { format: upload.format, bytes: upload.bytes },
    });

    const candidates = await this.aiRepository.findCatalogProductsForImageMatch(detectedLabels, 24);
    const matches = candidates
      .map((product) => {
        const labels = [
          product.name,
          product.description,
          product.category.name,
          product.brand?.name ?? "",
        ];
        const score = scoreLabelImageMatch(labels, detectedLabels);
        return { product, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    if (matches.length > 0) {
      await this.aiRepository.recordImageMatches(
        imageSearch.id,
        matches.map((match) => ({ productId: match.product.id, score: match.score })),
      );
    }

    await this.aiUsageService.track("ai.image.search", {
      userId,
      properties: { imageSearchId: imageSearch.id, labelCount: detectedLabels.length, matchCount: matches.length },
    });

    return {
      imageSearchId: imageSearch.id,
      imageUrl: upload.secureUrl,
      detectedLabels,
      architecture: {
        pipeline: ["upload", "label-extraction", "visual-catalog-matching", "score-ranking"],
        futureReady: "Plug-in vision model endpoint without API contract changes",
      },
      matches: matches.map((match) => ({
        score: match.score,
        product: this.mapProduct(match.product),
      })),
    };
  }

  private detectLabelsFromFile(file: Express.Multer.File) {
    const mimeLabels: Record<string, string[]> = {
      "image/jpeg": ["photo", "product", "retail"],
      "image/png": ["photo", "product", "retail"],
      "image/webp": ["photo", "product", "retail"],
    };
    const base = mimeLabels[file.mimetype] ?? ["product"];
    const nameTokens = file.originalname
      .replace(/\.[^.]+$/, "")
      .split(/[^a-z0-9]+/i)
      .filter((token) => token.length > 2)
      .map((token) => token.toLowerCase());
    return [...new Set([...base, ...nameTokens])];
  }

  private mapProduct(product: {
    id: string;
    slug: string;
    name: string;
    description: string;
    basePrice: unknown;
    aiScore: unknown;
    createdAt: Date;
    category: { name: string; slug: string };
    brand?: { name: string; slug: string } | null;
    variants: Array<{
      price: unknown;
      compareAtPrice: unknown | null;
      inventoryItems: Array<{ availableQuantity: number }>;
    }>;
    images: Array<{ url: string; isPrimary: boolean }>;
    reviews: Array<{ rating: number }>;
  }) {
    const variant = product.variants[0];
    const stock = product.variants.reduce(
      (sum, entry) => sum + entry.inventoryItems.reduce((inner, item) => inner + item.availableQuantity, 0),
      0,
    );
    const price = Number(variant?.price ?? product.basePrice);
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category.name,
      categorySlug: product.category.slug,
      brand: product.brand?.name,
      price,
      stock,
      aiMatch: Number(product.aiScore),
      imageUrl: product.images.find((image) => image.isPrimary)?.url ?? product.images[0]?.url,
      description: product.description,
      createdAt: product.createdAt.toISOString(),
    };
  }
}
