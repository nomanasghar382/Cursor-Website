import { Injectable } from "@nestjs/common";
import { AiMessageRole, Prisma } from "@prisma/client";
import { PrismaService } from "../../../database/prisma.service";
import { normalizeSearchQuery } from "../utils/ai-intent.util";

@Injectable()
export class AiRepository {
  constructor(private readonly prisma: PrismaService) {}

  createChatSession(userId: string, title?: string) {
    return this.prisma.aiChatSession.create({
      data: {
        userId,
        sessionTitle: title,
        status: "active",
      },
    });
  }

  findChatSession(userId: string, sessionId: string) {
    return this.prisma.aiChatSession.findFirst({
      where: { id: sessionId, userId, deletedAt: null },
      include: {
        conversations: {
          where: { deletedAt: null },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  listChatSessions(userId: string, limit = 20) {
    return this.prisma.aiChatSession.findMany({
      where: { userId, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: {
        conversations: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
  }

  addConversation(
    sessionId: string,
    role: AiMessageRole,
    message: string,
    meta?: { tokensUsed?: number; modelName?: string; modelVersion?: string; metadata?: Prisma.InputJsonValue },
  ) {
    return this.prisma.aiConversation.create({
      data: {
        sessionId,
        role,
        message,
        tokensUsed: meta?.tokensUsed,
        modelName: meta?.modelName,
        modelVersion: meta?.modelVersion,
        metadata: meta?.metadata,
      },
    });
  }

  touchChatSession(sessionId: string, title?: string) {
    return this.prisma.aiChatSession.update({
      where: { id: sessionId },
      data: {
        ...(title ? { sessionTitle: title } : {}),
        updatedAt: new Date(),
      },
    });
  }

  recordSearchHistory(input: {
    userId?: string;
    query: string;
    resultCount: number;
    metadata?: Prisma.InputJsonValue;
  }) {
    return this.prisma.searchHistory.create({
      data: {
        userId: input.userId,
        query: input.query,
        normalizedQuery: normalizeSearchQuery(input.query),
        resultCount: input.resultCount,
        metadata: input.metadata,
      },
    });
  }

  recordSearchClick(searchHistoryId: string, productId: string) {
    return this.prisma.searchHistory.update({
      where: { id: searchHistoryId },
      data: { clickedProductId: productId },
    });
  }

  getUserSearchHistory(userId: string, limit = 12) {
    return this.prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      distinct: ["normalizedQuery"],
    });
  }

  getPopularSearches(limit = 10) {
    return this.prisma.searchHistory.groupBy({
      by: ["normalizedQuery"],
      _count: { normalizedQuery: true },
      orderBy: { _count: { normalizedQuery: "desc" } },
      take: limit,
    });
  }

  getSearchSuggestions(prefix: string, limit = 8) {
    const normalized = normalizeSearchQuery(prefix);
    return this.prisma.searchHistory.findMany({
      where: { normalizedQuery: { startsWith: normalized } },
      orderBy: { createdAt: "desc" },
      take: limit * 3,
      distinct: ["normalizedQuery"],
      select: { query: true, normalizedQuery: true },
    });
  }

  getPersonalizedRecommendations(userId: string, limit = 12) {
    return this.prisma.aiRecommendation.findMany({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { score: "desc" },
      take: limit,
      include: {
        product: {
          include: {
            category: true,
            brand: true,
            variants: {
              where: { deletedAt: null, status: "ACTIVE" },
              include: { inventoryItems: true },
              orderBy: { price: "asc" },
            },
            images: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } },
            reviews: { where: { status: "APPROVED", deletedAt: null } },
          },
        },
      },
    });
  }

  getRecentlyViewed(userId: string, limit = 8) {
    return this.prisma.recentlyViewedProduct.findMany({
      where: { userId },
      orderBy: { viewedAt: "desc" },
      take: limit,
      include: {
        product: {
          include: {
            category: true,
            brand: true,
            variants: {
              where: { deletedAt: null, status: "ACTIVE" },
              include: { inventoryItems: true },
              orderBy: { price: "asc" },
            },
            images: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } },
            reviews: { where: { status: "APPROVED", deletedAt: null } },
          },
        },
      },
    });
  }

  getPurchaseHistoryProductIds(userId: string, limit = 12) {
    return this.prisma.orderItem.findMany({
      where: { order: { userId, status: { in: ["DELIVERED", "SHIPPED", "PROCESSING", "CONFIRMED"] } } },
      orderBy: { createdAt: "desc" },
      take: limit,
      distinct: ["productId"],
      select: { productId: true },
    });
  }

  getOrderCount(userId: string) {
    return this.prisma.order.count({ where: { userId } });
  }

  recordVoiceSearch(input: {
    userId?: string;
    audioAssetUrl: string;
    transcript?: string;
    confidence?: number;
    metadata?: Prisma.InputJsonValue;
  }) {
    return this.prisma.voiceSearch.create({
      data: {
        userId: input.userId,
        audioAssetUrl: input.audioAssetUrl,
        transcript: input.transcript,
        confidence: input.confidence,
        metadata: input.metadata,
      },
    });
  }

  recordImageSearch(input: {
    userId?: string;
    imageUrl: string;
    detectedLabels?: Prisma.InputJsonValue;
    metadata?: Prisma.InputJsonValue;
  }) {
    return this.prisma.imageSearch.create({
      data: {
        userId: input.userId,
        imageUrl: input.imageUrl,
        detectedLabels: input.detectedLabels,
        metadata: input.metadata,
      },
    });
  }

  recordImageMatches(imageSearchId: string, matches: Array<{ productId: string; score: number }>) {
    return this.prisma.imageSearchProduct.createMany({
      data: matches.map((match) => ({
        imageSearchId,
        productId: match.productId,
        score: match.score,
      })),
      skipDuplicates: true,
    });
  }

  logUsage(input: {
    userId?: string;
    eventName: string;
    productId?: string;
    sessionId?: string;
    properties?: Prisma.InputJsonValue;
  }) {
    return this.prisma.analyticsEvent.create({
      data: {
        userId: input.userId,
        eventName: input.eventName,
        productId: input.productId,
        sessionId: input.sessionId,
        properties: input.properties,
      },
    });
  }

  findProductsByIds(ids: string[]) {
    if (ids.length === 0) return Promise.resolve([]);
    return this.prisma.product.findMany({
      where: {
        id: { in: ids },
        deletedAt: null,
        status: "ACTIVE",
        visibility: "PUBLIC",
      },
      include: {
        category: true,
        brand: true,
        variants: {
          where: { deletedAt: null, status: "ACTIVE" },
          include: { inventoryItems: true },
          orderBy: { price: "asc" },
        },
        images: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } },
        reviews: { where: { status: "APPROVED", deletedAt: null } },
      },
    });
  }

  findCatalogProductsForImageMatch(labels: string[], limit = 24) {
    const tokens = labels.map((label) => label.toLowerCase()).filter(Boolean);
    if (tokens.length === 0) {
      return this.prisma.product.findMany({
        where: { deletedAt: null, status: "ACTIVE", visibility: "PUBLIC" },
        orderBy: { aiScore: "desc" },
        take: limit,
        include: {
          category: true,
          brand: true,
          variants: {
            where: { deletedAt: null, status: "ACTIVE" },
            include: { inventoryItems: true },
            orderBy: { price: "asc" },
          },
          images: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } },
          reviews: { where: { status: "APPROVED", deletedAt: null } },
        },
      });
    }

    return this.prisma.product.findMany({
      where: {
        deletedAt: null,
        status: "ACTIVE",
        visibility: "PUBLIC",
        OR: tokens.flatMap((token) => [
          { name: { contains: token, mode: "insensitive" as const } },
          { description: { contains: token, mode: "insensitive" as const } },
          { category: { name: { contains: token, mode: "insensitive" as const } } },
          { brand: { name: { contains: token, mode: "insensitive" as const } } },
        ]),
      },
      orderBy: { aiScore: "desc" },
      take: limit,
      include: {
        category: true,
        brand: true,
        variants: {
          where: { deletedAt: null, status: "ACTIVE" },
          include: { inventoryItems: true },
          orderBy: { price: "asc" },
        },
        images: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } },
        reviews: { where: { status: "APPROVED", deletedAt: null } },
      },
    });
  }
}
