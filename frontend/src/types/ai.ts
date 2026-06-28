import type { ProductCard } from "@/types/catalog";

export type AiConfig = {
  modelName: string;
  modelVersion: string;
  features: {
    chat: boolean;
    semanticSearch: boolean;
    voiceSearch: boolean;
    imageSearch: boolean;
  };
  architecture: Record<string, string[]>;
};

export type AiChatMessage = {
  id?: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  message: string;
  createdAt?: string;
};

export type AiChatResponse = {
  sessionId?: string;
  message: string;
  intent: string;
  products: ProductCard[];
  suggestions: string[];
  metadata: Record<string, unknown>;
};

export type AiSearchResponse = {
  query: string;
  explanation: string;
  searchHistoryId: string;
  count: number;
  products: Array<ProductCard & { relevanceScore?: number; matchReasons?: string[] }>;
  ranking: Array<{ rank: number; productId: string; aiMatch: number; name: string }>;
};

export type AiRecommendationsResponse = {
  type: string;
  reason: string;
  products: ProductCard[];
};

export type AiVoiceSearchResponse = AiSearchResponse & {
  voiceSearchId: string;
  transcript: string;
  confidence?: number;
  architecture: Record<string, string | string[]>;
};

export type AiImageSearchMatch = {
  score: number;
  product: {
    id: string;
    slug: string;
    name: string;
    category: string;
    categorySlug: string;
    brand?: string;
    price: number;
    stock: number;
    aiMatch: number;
    imageUrl?: string;
    description: string;
    createdAt: string;
  };
};

export type AiImageSearchResponse = {
  imageSearchId: string;
  imageUrl: string;
  detectedLabels: string[];
  architecture: Record<string, string | string[]>;
  matches: AiImageSearchMatch[];
};

export type AiSessionSummary = {
  id: string;
  title: string;
  status: string;
  startedAt: string;
  updatedAt: string;
  lastMessage?: string;
};

export type RecommendationType =
  | "personalized"
  | "recently-viewed"
  | "cart"
  | "purchase-history"
  | "similar"
  | "frequently-bought-together"
  | "cross-sell"
  | "upsell";
