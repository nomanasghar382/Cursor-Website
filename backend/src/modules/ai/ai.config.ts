import { registerAs } from "@nestjs/config";

export const AI_CONFIG_KEY = "ai";

export default registerAs(AI_CONFIG_KEY, () => ({
  modelVersion: process.env.AI_MODEL_VERSION ?? "novaex-intelligence-v1",
  modelName: process.env.AI_MODEL_NAME ?? "novaex-catalog-engine",
  maxChatTokens: Number(process.env.AI_MAX_CHAT_TOKENS ?? 512),
  searchResultLimit: Number(process.env.AI_SEARCH_RESULT_LIMIT ?? 24),
  suggestionLimit: Number(process.env.AI_SUGGESTION_LIMIT ?? 8),
  recommendationLimit: Number(process.env.AI_RECOMMENDATION_LIMIT ?? 12),
  voiceSearchEnabled: process.env.AI_VOICE_SEARCH_ENABLED !== "false",
  imageSearchEnabled: process.env.AI_IMAGE_SEARCH_ENABLED !== "false",
  chatEnabled: process.env.AI_CHAT_ENABLED !== "false",
  semanticSearchEnabled: process.env.AI_SEMANTIC_SEARCH_ENABLED !== "false",
}));
