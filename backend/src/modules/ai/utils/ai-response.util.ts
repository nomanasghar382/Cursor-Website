import type { ProductCard } from "../../products/entities/product-card.entity";
import type { AiIntent } from "./ai-intent.util";

export type AiAssistantResponse = {
  message: string;
  intent: AiIntent;
  products: ProductCard[];
  suggestions: string[];
  metadata: Record<string, unknown>;
};

export function buildAssistantResponse(input: {
  intent: AiIntent;
  userMessage: string;
  products: ProductCard[];
  orderCount?: number;
  comparedProducts?: ProductCard[];
}): AiAssistantResponse {
  const { intent, userMessage, products, orderCount = 0, comparedProducts = [] } = input;

  switch (intent) {
    case "search":
      return {
        intent,
        message:
          products.length > 0
            ? `I found ${products.length} products matching "${userMessage}". They are ranked by semantic relevance and AI confidence.`
            : `I could not find exact matches for "${userMessage}". Try broadening your search or adjusting filters.`,
        products,
        suggestions: products.length > 0 ? ["Compare top picks", "Show premium options", "Filter in-stock only"] : ["Browse featured", "Show trending", "Help me choose"],
        metadata: { resultCount: products.length },
      };
    case "compare":
      return {
        intent,
        message:
          comparedProducts.length >= 2
            ? `Here is an AI comparison across ${comparedProducts.length} products. ${comparedProducts[0]?.name} leads on AI confidence while alternatives offer different value tiers.`
            : products.length >= 2
              ? `I can compare ${products.slice(0, 3).map((p) => p.name).join(", ")}. The highest AI match is ${products[0]?.name} at ${products[0]?.aiMatch}%.`
              : "Share two or more product names or IDs and I will generate a comparison.",
        products: comparedProducts.length > 0 ? comparedProducts : products.slice(0, 4),
        suggestions: ["Add to cart", "Show similar products", "Explain differences"],
        metadata: { comparedCount: comparedProducts.length || Math.min(products.length, 4) },
      };
    case "recommend":
      return {
        intent,
        message:
          products.length > 0
            ? `Based on your intent, these ${products.length} picks balance AI confidence, reviews, and availability.`
            : "Sign in and browse the catalog to unlock deeper personalized recommendations.",
        products,
        suggestions: ["Show cart-based picks", "Recently viewed", "Frequently bought together"],
        metadata: { strategy: "intent-recommendation" },
      };
    case "order-help":
      return {
        intent,
        message:
          orderCount > 0
            ? `You have ${orderCount} orders in your account. Visit Account → Orders to track shipments, request returns, download invoices, or reorder favorites.`
            : "Order assistance is available after checkout. You can track shipments, request returns, and reorder from your account dashboard.",
        products: products.slice(0, 3),
        suggestions: ["Go to my orders", "Return policy", "Contact support"],
        metadata: { orderCount, architecture: "order-assistance-routed-to-account-module" },
      };
    case "shopping-guidance":
      return {
        intent,
        message:
          "Tell me your budget, category, and primary use case. I will narrow the catalog using semantic search, AI scoring, and inventory signals.",
        products: products.slice(0, 4),
        suggestions: ["Budget under $200", "Premium picks", "Best for gifting"],
        metadata: { guidance: true },
      };
    case "product-question":
      return {
        intent,
        message:
          products.length > 0
            ? `${products[0]?.name} scores ${products[0]?.aiMatch}% on NOVAEX AI confidence with ${products[0]?.reviewCount} verified reviews and ${products[0]?.stock} units available.`
            : "Ask about a specific product name or open a product page for detailed AI explanations.",
        products: products.slice(0, 3),
        suggestions: ["Show specifications", "Compare alternatives", "Similar products"],
        metadata: { answered: products.length > 0 },
      };
    default:
      return {
        intent: "general",
        message:
          "I am your NOVAEX shopping assistant. I can search the catalog, compare products, recommend picks, and guide your purchase journey.",
        products: products.slice(0, 4),
        suggestions: ["Find wireless audio", "Compare top robotics", "What's trending?"],
        metadata: {},
      };
  }
}

export function buildSearchExplanation(query: string, count: number, topMatch?: ProductCard) {
  if (count === 0) {
    return `No semantic matches for "${query}". Try different keywords or remove filters.`;
  }
  if (topMatch) {
    return `Top match: ${topMatch.name} (${topMatch.aiMatch}% AI confidence) among ${count} results for "${query}".`;
  }
  return `Found ${count} products ranked by semantic relevance and AI confidence for "${query}".`;
}
