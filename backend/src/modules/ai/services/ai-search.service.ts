import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ProductsService } from "../../products/services/products.service";
import { ProductCard } from "../../products/entities/product-card.entity";
import { AI_CONFIG_KEY } from "../ai.config";
import { AiSearchDto } from "../dto/ai.dto";
import { AiRepository } from "../repositories/ai.repository";
import { buildSearchExplanation } from "../utils/ai-response.util";
import { rankProductsByQuery } from "../utils/ai-ranking.util";
import { AiUsageService } from "./ai-usage.service";

@Injectable()
export class AiSearchService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly aiRepository: AiRepository,
    private readonly aiUsageService: AiUsageService,
    private readonly configService: ConfigService,
  ) {}

  async search(userId: string | undefined, dto: AiSearchDto) {
    const products = await this.searchProducts(dto);
    const explanation = buildSearchExplanation(dto.query, products.length, products[0]);

    const history = await this.aiRepository.recordSearchHistory({
      userId,
      query: dto.query,
      resultCount: products.length,
      metadata: {
        semantic: true,
        filters: {
          category: dto.category,
          brand: dto.brand,
          minPrice: dto.minPrice,
          maxPrice: dto.maxPrice,
          inStock: dto.inStock,
        },
      },
    });

    await this.aiUsageService.track("ai.search", {
      userId,
      properties: { query: dto.query, resultCount: products.length },
    });

    return {
      query: dto.query,
      explanation,
      searchHistoryId: history.id,
      count: products.length,
      products,
      ranking: products.slice(0, 5).map((product, index) => ({
        rank: index + 1,
        productId: product.id,
        aiMatch: product.aiMatch,
        name: product.name,
      })),
    };
  }

  async searchProducts(dto: Pick<AiSearchDto, "query" | "category" | "brand" | "minPrice" | "maxPrice" | "inStock" | "limit" | "page">) {
    const limit = dto.limit ?? this.configService.get<number>(`${AI_CONFIG_KEY}.searchResultLimit`) ?? 24;
    const catalog = await this.productsService.list({
      search: dto.query,
      category: dto.category,
      brand: dto.brand,
      minPrice: dto.minPrice,
      maxPrice: dto.maxPrice,
      inStock: dto.inStock,
      sort: "ai-recommended",
      page: dto.page ?? 1,
      limit,
    });

    const ranked = rankProductsByQuery(
      catalog.products.map((product) => ({
        ...product,
        aiScore: product.aiMatch,
        brand: product.brand,
        category: product.category,
        price: product.price,
        rating: product.rating,
        stock: product.stock,
      })),
      dto.query,
    );

    return ranked.map((entry) => this.toRankedCard(entry));
  }

  async getSuggestions(query: string, limit?: number) {
    const max = limit ?? this.configService.get<number>(`${AI_CONFIG_KEY}.suggestionLimit`) ?? 8;
    const historyMatches = await this.aiRepository.getSearchSuggestions(query, max);
    const historySuggestions = historyMatches.slice(0, max).map((entry) => entry.query);

    if (historySuggestions.length >= max) {
      return { query, suggestions: historySuggestions };
    }

    const catalog = await this.productsService.list({ search: query, limit: max, sort: "ai-recommended" });
    const productSuggestions = catalog.products.map((product) => product.name);

    const merged = [...new Set([...historySuggestions, ...productSuggestions])].slice(0, max);
    return { query, suggestions: merged };
  }

  async getPopularSearches(limit = 10) {
    const popular = await this.aiRepository.getPopularSearches(limit);
    return {
      searches: popular.map((entry) => ({
        query: entry.normalizedQuery,
        count: entry._count.normalizedQuery,
      })),
    };
  }

  async getSearchHistory(userId: string) {
    const history = await this.aiRepository.getUserSearchHistory(userId);
    return {
      history: history.map((entry) => ({
        id: entry.id,
        query: entry.query,
        resultCount: entry.resultCount,
        clickedProductId: entry.clickedProductId,
        createdAt: entry.createdAt.toISOString(),
      })),
    };
  }

  async recordClick(userId: string | undefined, searchHistoryId: string, productId: string) {
    await this.aiRepository.recordSearchClick(searchHistoryId, productId);
    await this.aiUsageService.track("ai.search.click", { userId, productId, properties: { searchHistoryId } });
    return { recorded: true };
  }

  async getAnalytics() {
    const popular = await this.getPopularSearches(10);
    return {
      popularSearches: popular.searches,
      architecture: {
        semanticSearch: this.configService.get<boolean>(`${AI_CONFIG_KEY}.semanticSearchEnabled`),
        rankingSignals: ["token overlap", "aiScore", "stock availability", "review rating"],
      },
    };
  }

  private toRankedCard<T extends ProductCard & { relevanceScore?: number; matchReasons?: string[] }>(product: T): ProductCard & {
    relevanceScore: number;
    matchReasons: string[];
  } {
    return {
      ...product,
      relevanceScore: product.relevanceScore ?? product.aiMatch,
      matchReasons: product.matchReasons ?? [`AI confidence ${product.aiMatch}%`],
    };
  }
}
