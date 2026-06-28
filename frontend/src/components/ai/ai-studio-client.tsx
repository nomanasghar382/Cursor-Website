"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { AiRecommendationCarousel } from "@/components/ai/ai-recommendation-carousel";
import { AiSearchIntelligence } from "@/components/ai/ai-search-intelligence";
import { AiChatInterface, AiChatHeader } from "@/components/ai/ai-chat-interface";
import type { AiSearchResponse } from "@/types/ai";

type AiStudioClientProps = {
  initialQuery?: string;
};

export function AiStudioClient({ initialQuery }: AiStudioClientProps) {
  const [searchResults, setSearchResults] = useState<AiSearchResponse | null>(null);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="AI Studio"
        title="Personalized product intelligence"
        description="Describe your intent and let NOVAEX rank the catalog by fit, confidence, and experience quality."
        icon={Sparkles}
      />

      <AiSearchIntelligence initialQuery={initialQuery} onResults={setSearchResults} />

      {searchResults ? (
        <AiRecommendationCarousel
          title={`Top picks for “${searchResults.query}”`}
          reason={searchResults.explanation}
          products={searchResults.products}
        />
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-border/60 p-6">
          <div className="mb-4">
            <AiChatHeader />
          </div>
          <AiChatInterface />
        </div>
        <div className="rounded-[2rem] border border-border/60 p-6">
          <h2 className="mb-4 font-display text-2xl font-semibold">Commerce intelligence</h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>Semantic search with AI ranking and filter integration</li>
            <li>Personalized, cart-based, and purchase-history recommendations</li>
            <li>Voice and image search architecture with live API endpoints</li>
            <li>Conversation history and search analytics for signed-in shoppers</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
