import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ProductsService } from "../../products/services/products.service";
import { ProductCard } from "../../products/entities/product-card.entity";
import { AI_CONFIG_KEY } from "../ai.config";
import { AiChatDto } from "../dto/ai.dto";
import { AiRepository } from "../repositories/ai.repository";
import { parseAiIntent } from "../utils/ai-intent.util";
import { buildAssistantResponse } from "../utils/ai-response.util";
import { AiUsageService } from "./ai-usage.service";
import { AiSearchService } from "./ai-search.service";
import { AiRecommendationsService } from "./ai-recommendations.service";

@Injectable()
export class AiAssistantService {
  constructor(
    private readonly aiRepository: AiRepository,
    private readonly aiSearchService: AiSearchService,
    private readonly aiRecommendationsService: AiRecommendationsService,
    private readonly aiUsageService: AiUsageService,
    private readonly productsService: ProductsService,
    private readonly configService: ConfigService,
  ) {}

  async chat(userId: string | undefined, dto: AiChatDto) {
    if (!this.configService.get<boolean>(`${AI_CONFIG_KEY}.chatEnabled`)) {
      throw new ServiceUnavailableException("AI chat is currently disabled.");
    }

    const parsed = parseAiIntent(dto.message, dto.productIds ?? []);
    let products: ProductCard[] = await this.aiSearchService.searchProducts({
      query: parsed.searchTerms || dto.message,
      category: parsed.categoryHint,
      minPrice: parsed.budget?.min,
      maxPrice: parsed.budget?.max,
      limit: 8,
    });

    if (parsed.intent === "recommend" && userId) {
      const personalized = await this.aiRecommendationsService.getRecommendations(userId, {
        type: "personalized",
        limit: 8,
      });
      if (personalized.products.length > 0) {
        products = personalized.products;
      }
    }

    let comparedProducts: ProductCard[] = products;
    if (parsed.intent === "compare" && parsed.productIds.length >= 2) {
      const detailProducts = await Promise.all(
        parsed.productIds.slice(0, 4).map(async (id) => {
          const result = await this.productsService.getById(id);
          return result.product;
        }),
      );
      comparedProducts = detailProducts;
    }

    const orderCount = userId ? await this.aiRepository.getOrderCount(userId) : 0;
    const response = buildAssistantResponse({
      intent: parsed.intent,
      userMessage: dto.message,
      products,
      orderCount,
      comparedProducts,
    });

    let sessionId = dto.sessionId;
    if (userId) {
      if (sessionId) {
        const existing = await this.aiRepository.findChatSession(userId, sessionId);
        if (!existing) throw new NotFoundException("Chat session not found.");
      } else {
        const session = await this.aiRepository.createChatSession(userId, dto.message.slice(0, 80));
        sessionId = session.id;
      }

      const modelName = this.configService.get<string>(`${AI_CONFIG_KEY}.modelName`)!;
      const modelVersion = this.configService.get<string>(`${AI_CONFIG_KEY}.modelVersion`)!;
      const userTokens = this.aiUsageService.estimateTokens(dto.message);
      const assistantTokens = this.aiUsageService.estimateTokens(response.message);

      await this.aiRepository.addConversation(sessionId, "USER", dto.message, {
        tokensUsed: userTokens,
        modelName,
        modelVersion,
      });
      await this.aiRepository.addConversation(sessionId, "ASSISTANT", response.message, {
        tokensUsed: assistantTokens,
        modelName,
        modelVersion,
        metadata: { intent: parsed.intent, productIds: response.products.map((p) => p.id) },
      });
      await this.aiRepository.touchChatSession(sessionId);
    }

    await this.aiUsageService.track("ai.chat", {
      userId,
      sessionId,
      properties: { intent: parsed.intent, resultCount: response.products.length },
    });

    return {
      sessionId,
      ...response,
    };
  }

  async listSessions(userId: string) {
    const sessions = await this.aiRepository.listChatSessions(userId);
    return {
      sessions: sessions.map((session) => ({
        id: session.id,
        title: session.sessionTitle ?? "Shopping conversation",
        status: session.status,
        startedAt: session.startedAt.toISOString(),
        updatedAt: session.updatedAt.toISOString(),
        lastMessage: session.conversations[0]?.message,
      })),
    };
  }

  async getSession(userId: string, sessionId: string) {
    const session = await this.aiRepository.findChatSession(userId, sessionId);
    if (!session) throw new NotFoundException("Chat session not found.");

    return {
      session: {
        id: session.id,
        title: session.sessionTitle,
        status: session.status,
        startedAt: session.startedAt.toISOString(),
        messages: session.conversations.map((entry) => ({
          id: entry.id,
          role: entry.role,
          message: entry.message,
          createdAt: entry.createdAt.toISOString(),
          metadata: entry.metadata,
        })),
      },
    };
  }

  async compareProducts(productIds: string[]) {
    if (productIds.length < 2) {
      throw new BadRequestException("Provide at least two product IDs to compare.");
    }

    const products = await Promise.all(
      productIds.slice(0, 4).map(async (id) => {
        const result = await this.productsService.getById(id);
        return result.product;
      }),
    );

    const leader = [...products].sort((a, b) => b.aiMatch - a.aiMatch)[0];
    return {
      products,
      summary: `${leader.name} leads with ${leader.aiMatch}% AI confidence, ${leader.rating}★ rating, and $${leader.price} pricing among ${products.length} compared items.`,
      dimensions: products.map((product) => ({
        id: product.id,
        name: product.name,
        aiMatch: product.aiMatch,
        rating: product.rating,
        price: product.price,
        stock: product.stock,
        category: product.category,
      })),
    };
  }
}
