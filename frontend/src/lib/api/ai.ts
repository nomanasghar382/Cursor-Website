import { apiRequest, getApiBaseUrl } from "@/lib/api/client";
import type {
  AiChatResponse,
  AiConfig,
  AiImageSearchResponse,
  AiRecommendationsResponse,
  AiSearchResponse,
  AiSessionSummary,
  AiVoiceSearchResponse,
  RecommendationType,
} from "@/types/ai";
import { ApiError } from "@/types/api";

export const aiApi = {
  config() {
    return apiRequest<AiConfig>("ai/config", { method: "GET" });
  },

  chat(body: { message: string; sessionId?: string; productIds?: string[] }, token?: string | null) {
    return apiRequest<AiChatResponse>("ai/chat", { method: "POST", body, token });
  },

  listSessions(token: string) {
    return apiRequest<{ sessions: AiSessionSummary[] }>("ai/chat/sessions", { method: "GET", token });
  },

  getSession(token: string, sessionId: string) {
    return apiRequest<{
      session: {
        id: string;
        title?: string;
        status: string;
        startedAt: string;
        messages: Array<{ id: string; role: string; message: string; createdAt: string }>;
      };
    }>(`ai/chat/sessions/${sessionId}`, { method: "GET", token });
  },

  search(
    body: {
      query: string;
      category?: string;
      brand?: string;
      minPrice?: number;
      maxPrice?: number;
      inStock?: boolean;
      page?: number;
      limit?: number;
    },
    token?: string | null,
  ) {
    return apiRequest<AiSearchResponse>("ai/search", { method: "POST", body, token });
  },

  suggestions(q: string, limit = 8) {
    const params = new URLSearchParams({ q, limit: String(limit) });
    return apiRequest<{ query: string; suggestions: string[] }>(`ai/search/suggestions?${params}`, { method: "GET" });
  },

  popularSearches(limit = 10) {
    return apiRequest<{ searches: Array<{ query: string; count: number }> }>(`ai/search/popular?limit=${limit}`, {
      method: "GET",
    });
  },

  searchHistory(token: string) {
    return apiRequest<{ history: Array<{ id: string; query: string; resultCount: number; createdAt: string }> }>(
      "ai/search/history",
      { method: "GET", token },
    );
  },

  recordSearchClick(searchHistoryId: string, productId: string, token?: string | null) {
    return apiRequest("ai/search/click", { method: "POST", body: { searchHistoryId, productId }, token });
  },

  recommendations(params: { type?: RecommendationType; productId?: string; limit?: number }, token?: string | null) {
    const query = new URLSearchParams();
    if (params.type) query.set("type", params.type);
    if (params.productId) query.set("productId", params.productId);
    if (params.limit) query.set("limit", String(params.limit));
    const suffix = query.toString();
    return apiRequest<AiRecommendationsResponse>(`ai/recommendations${suffix ? `?${suffix}` : ""}`, {
      method: "GET",
      token,
    });
  },

  voiceSearch(
    body: { transcript: string; language?: string; audioAssetUrl?: string; confidence?: number },
    token?: string | null,
  ) {
    return apiRequest<AiVoiceSearchResponse>("ai/voice/search", { method: "POST", body, token });
  },

  async imageSearch(file: File, token?: string | null) {
    const url = `${getApiBaseUrl()}/ai/image/search`;
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message =
        typeof payload.message === "string"
          ? payload.message
          : Array.isArray(payload.message)
            ? payload.message.join(", ")
            : `Request failed with ${response.status}`;
      throw new ApiError(message, response.status, payload);
    }

    return ("data" in payload ? payload.data : payload) as AiImageSearchResponse;
  },

  compare(productIds: string[]) {
    return apiRequest<{
      products: unknown[];
      summary: string;
      dimensions: Array<{ id: string; name: string; aiMatch: number; rating: number; price: number; stock: number; category: string }>;
    }>("ai/compare", { method: "POST", body: { productIds } });
  },
};
