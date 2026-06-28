export type AiIntent =
  | "search"
  | "compare"
  | "recommend"
  | "order-help"
  | "product-question"
  | "shopping-guidance"
  | "general";

export type ParsedAiIntent = {
  intent: AiIntent;
  searchTerms: string;
  productIds: string[];
  budget?: { min?: number; max?: number };
  categoryHint?: string;
};

const COMPARE_PATTERNS = /\b(compare|versus|vs\.?|difference between|which is better)\b/i;
const ORDER_PATTERNS = /\b(order|track|delivery|shipping|return|refund|cancel|reorder|invoice)\b/i;
const RECOMMEND_PATTERNS = /\b(recommend|suggest|best|top|gift|ideas|what should i buy)\b/i;
const SEARCH_PATTERNS = /\b(find|search|show me|looking for|need|want|under|below|around)\b/i;
const GUIDANCE_PATTERNS = /\b(help|guide|how to|what fits|advice|choose|pick)\b/i;

const CATEGORY_HINTS: Record<string, string> = {
  robot: "robotics",
  robotics: "robotics",
  audio: "immersive-audio",
  headphone: "immersive-audio",
  earbuds: "immersive-audio",
  speaker: "immersive-audio",
  wearable: "wearables",
  watch: "wearables",
  smart: "smart-home",
  home: "smart-home",
};

export function parseAiIntent(message: string, productIds: string[] = []): ParsedAiIntent {
  const normalized = message.trim();
  const lower = normalized.toLowerCase();

  let intent: AiIntent = "general";
  if (COMPARE_PATTERNS.test(lower)) intent = "compare";
  else if (ORDER_PATTERNS.test(lower)) intent = "order-help";
  else if (RECOMMEND_PATTERNS.test(lower)) intent = "recommend";
  else if (SEARCH_PATTERNS.test(lower)) intent = "search";
  else if (GUIDANCE_PATTERNS.test(lower)) intent = "shopping-guidance";
  else if (lower.includes("?")) intent = "product-question";

  const budget = extractBudget(lower);
  const categoryHint = extractCategoryHint(lower);

  return {
    intent,
    searchTerms: stripIntentPhrases(normalized),
    productIds,
    budget,
    categoryHint,
  };
}

function extractBudget(text: string): ParsedAiIntent["budget"] | undefined {
  const underMatch = text.match(/\b(?:under|below|less than|max)\s*\$?\s*(\d+(?:\.\d+)?)/i);
  const overMatch = text.match(/\b(?:over|above|more than|min)\s*\$?\s*(\d+(?:\.\d+)?)/i);
  const rangeMatch = text.match(/\$?\s*(\d+(?:\.\d+)?)\s*(?:-|to)\s*\$?\s*(\d+(?:\.\d+)?)/i);

  if (rangeMatch) {
    return { min: Number(rangeMatch[1]), max: Number(rangeMatch[2]) };
  }
  if (underMatch || overMatch) {
    return {
      ...(underMatch ? { max: Number(underMatch[1]) } : {}),
      ...(overMatch ? { min: Number(overMatch[1]) } : {}),
    };
  }
  return undefined;
}

function extractCategoryHint(text: string): string | undefined {
  for (const [keyword, slug] of Object.entries(CATEGORY_HINTS)) {
    if (text.includes(keyword)) return slug;
  }
  return undefined;
}

function stripIntentPhrases(message: string) {
  return message
    .replace(/\b(find|search|show me|looking for|recommend|suggest|compare|help me|i need|i want)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeSearchQuery(query: string) {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

export function tokenizeQuery(query: string) {
  return normalizeSearchQuery(query)
    .split(/[^a-z0-9]+/i)
    .filter((token) => token.length > 1);
}
