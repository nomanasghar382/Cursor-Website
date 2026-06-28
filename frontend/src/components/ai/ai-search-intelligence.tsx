"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock, Search, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { AiVoiceSearchButton } from "@/components/ai/ai-voice-search-button";
import { AiImageSearchUpload } from "@/components/ai/ai-image-search-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { aiApi } from "@/lib/api/ai";
import { useAuthStore } from "@/stores/auth-store";
import type { AiSearchResponse } from "@/types/ai";
import type { ProductCard } from "@/types/catalog";

type AiSearchIntelligenceProps = {
  initialQuery?: string;
  onResults?: (response: AiSearchResponse) => void;
  onQuerySelect?: (query: string) => void;
};

export function AiSearchIntelligence({ initialQuery = "", onResults, onQuerySelect }: AiSearchIntelligenceProps) {
  const token = useAuthStore((state) => state.accessToken);
  const [query, setQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [suggestionTerm, setSuggestionTerm] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
    setActiveQuery(initialQuery);
    setSuggestionTerm(initialQuery);
  }, [initialQuery]);

  const searchQuery = useQuery({
    queryKey: ["ai-search", activeQuery],
    enabled: activeQuery.trim().length > 0,
    queryFn: () => aiApi.search({ query: activeQuery, limit: 12 }, token),
  });

  useEffect(() => {
    if (searchQuery.data) onResults?.(searchQuery.data);
  }, [searchQuery.data, onResults]);

  const suggestionsQuery = useQuery({
    queryKey: ["ai-suggestions", suggestionTerm],
    enabled: suggestionTerm.trim().length > 1,
    queryFn: () => aiApi.suggestions(suggestionTerm),
  });

  const popularQuery = useQuery({
    queryKey: ["ai-popular-searches"],
    queryFn: () => aiApi.popularSearches(6),
  });

  const historyQuery = useQuery({
    queryKey: ["ai-search-history", token],
    enabled: Boolean(token),
    queryFn: () => aiApi.searchHistory(token!),
  });

  return (
    <div className="space-y-6">
      <div className="glass-panel-strong rounded-[2rem] p-4 md:p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          Smart search intelligence
        </div>

        <form
          className="flex flex-col gap-3 lg:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            setActiveQuery(query.trim());
            setSuggestionTerm(query.trim());
          }}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSuggestionTerm(event.target.value);
              }}
              placeholder="Describe what you want in natural language..."
              className="pl-11"
              aria-label="AI semantic search"
            />
          </div>
          <div className="flex gap-2">
            <AiVoiceSearchButton
              onTranscript={(transcript) => {
                setQuery(transcript);
                setActiveQuery(transcript);
              }}
            />
            <AiImageSearchUpload />
            <Button type="submit" variant="gradient" disabled={!query.trim() || searchQuery.isFetching}>
              Search
            </Button>
          </div>
        </form>

        {suggestionsQuery.data?.suggestions.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {suggestionsQuery.data.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                onClick={() => {
                  setQuery(suggestion);
                  setActiveQuery(suggestion);
                  onQuerySelect?.(suggestion);
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InsightPanel title="Popular searches" icon={TrendingUp} loading={popularQuery.isLoading}>
          {popularQuery.data?.searches.length ? (
            <div className="flex flex-wrap gap-2">
              {popularQuery.data.searches.map((entry) => (
                <Badge
                  key={entry.query}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => {
                    setQuery(entry.query);
                    setActiveQuery(entry.query);
                  }}
                >
                  {entry.query} · {entry.count}
                </Badge>
              ))}
            </div>
          ) : (
            <EmptyHint text="Popular searches appear as shoppers explore the catalog." />
          )}
        </InsightPanel>

        <InsightPanel title="Your search history" icon={Clock} loading={historyQuery.isLoading}>
          {historyQuery.data?.history.length ? (
            <div className="space-y-2">
              {historyQuery.data.history.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl border border-border/50 px-3 py-2 text-left text-sm hover:border-primary/30"
                  onClick={() => {
                    setQuery(entry.query);
                    setActiveQuery(entry.query);
                  }}
                >
                  <span>{entry.query}</span>
                  <span className="text-xs text-muted-foreground">{entry.resultCount} results</span>
                </button>
              ))}
            </div>
          ) : (
            <EmptyHint text={token ? "No search history yet." : "Sign in to save search history."} />
          )}
        </InsightPanel>
      </div>

      {searchQuery.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-40 rounded-[1.5rem]" />
          ))}
        </div>
      ) : null}

      {searchQuery.data ? (
        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
            {searchQuery.data.explanation}
          </div>
          <SearchResultsGrid
            products={searchQuery.data.products}
            searchHistoryId={searchQuery.data.searchHistoryId}
          />
        </div>
      ) : null}

      {searchQuery.isError ? <p className="text-sm text-destructive">Search failed. Please try again.</p> : null}
    </div>
  );
}

function InsightPanel({
  title,
  icon: Icon,
  loading,
  children,
}: {
  title: string;
  icon: typeof Search;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.5rem] border border-border/60 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </div>
      {loading ? <Skeleton className="h-16 w-full rounded-xl" /> : children}
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground">{text}</p>;
}

function SearchResultsGrid({
  products,
  searchHistoryId,
}: {
  products: Array<ProductCard & { relevanceScore?: number; matchReasons?: string[] }>;
  searchHistoryId: string;
}) {
  const token = useAuthStore((state) => state.accessToken);

  if (products.length === 0) {
    return <EmptyHint text="No products matched this query. Try broader keywords or remove filters." />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <a
          key={product.id}
          href={`/products/${product.id}`}
          className="rounded-[1.5rem] border border-border/60 p-4 transition hover:border-primary/30"
          onClick={() => {
            void aiApi.recordSearchClick(searchHistoryId, product.id, token);
          }}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="font-medium">{product.name}</p>
            <Badge variant="accent">{product.aiMatch}%</Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
          <p className="mt-3 text-sm font-medium">${product.price.toFixed(2)}</p>
          {product.matchReasons?.length ? (
            <p className="mt-2 text-xs text-muted-foreground">{product.matchReasons[0]}</p>
          ) : null}
        </a>
      ))}
    </div>
  );
}
