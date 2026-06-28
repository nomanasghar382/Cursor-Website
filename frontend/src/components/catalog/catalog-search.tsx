"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Camera,
  Mic,
  MicOff,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCatalogSearchSuggestions } from "@/features/catalog/hooks";
import { useCatalogStore } from "@/stores/catalog-store";
import { cn } from "@/lib/utils";

const aiSuggestions = [
  "Show me premium robotics under $2000",
  "Best rated immersive audio for home office",
  "New arrivals in smart home with fast delivery",
];

export function CatalogSearch({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const [listening, setListening] = useState(false);
  const recentSearches = useCatalogStore((state) => state.recentSearches);
  const popularSearches = useCatalogStore((state) => state.popularSearches);
  const addRecentSearch = useCatalogStore((state) => state.addRecentSearch);
  const clearRecentSearches = useCatalogStore((state) => state.clearRecentSearches);

  const suggestionsQuery = useCatalogSearchSuggestions(query, focused);
  const apiSuggestions = useMemo(
    () => suggestionsQuery.data?.pages[0]?.products ?? [],
    [suggestionsQuery.data],
  );

  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  const navigateWithQuery = useCallback(
    (value: string, ai = false) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      addRecentSearch(trimmed);
      const params = new URLSearchParams(searchParams.toString());
      params.set("search", trimmed);
      if (ai) params.set("ai", "1");
      params.delete("page");
      router.push(`/products?${params.toString()}`);
      setFocused(false);
    },
    [addRecentSearch, router, searchParams],
  );

  const startVoiceSearch = () => {
    if (typeof window === "undefined") return;

    type RecognitionInstance = {
      lang: string;
      interimResults: boolean;
      onstart: (() => void) | null;
      onend: (() => void) | null;
      onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
      start: () => void;
    };

    const recognitionCtor = (window as Window & {
      SpeechRecognition?: new () => RecognitionInstance;
      webkitSpeechRecognition?: new () => RecognitionInstance;
    }).SpeechRecognition ?? (window as Window & { webkitSpeechRecognition?: new () => RecognitionInstance })
      .webkitSpeechRecognition;

    if (!recognitionCtor) return;

    const recognition = new recognitionCtor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) {
        setQuery(transcript);
        navigateWithQuery(transcript, true);
      }
    };
    recognition.start();
  };

  const dropdownVisible = focused && (query.length > 0 || recentSearches.length > 0);

  const suggestionGroups = useMemo(
    () => [
      { title: "Products", items: apiSuggestions.map((product) => ({ label: product.name, value: product.name, ai: false })) },
      { title: "Popular", items: popularSearches.map((entry) => ({ label: entry, value: entry, ai: false })) },
      { title: "Recent", items: recentSearches.map((entry) => ({ label: entry, value: entry, ai: false })) },
      { title: "AI prompts", items: aiSuggestions.map((entry) => ({ label: entry, value: entry, ai: true })) },
    ],
    [apiSuggestions, popularSearches, recentSearches],
  );

  return (
    <div className="relative w-full">
      <form
        className="flex w-full flex-col gap-3 lg:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          navigateWithQuery(query);
        }}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="Search products, brands, collections..."
            className="pl-11 pr-24"
            aria-label="Search products"
            aria-expanded={dropdownVisible}
            aria-controls="catalog-search-suggestions"
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={listening ? "Stop voice search" : "Start voice search"}
              onClick={startVoiceSearch}
            >
              {listening ? <MicOff className="h-4 w-4 text-rose-400" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Image search"
              onClick={() => router.push("/products?imageSearch=1")}
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button type="submit" variant="gradient">
          Search
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigateWithQuery(query || "premium curated products", true)}
        >
          <Sparkles className="h-4 w-4" />
          AI search
        </Button>
      </form>

      {dropdownVisible ? (
        <div
          id="catalog-search-suggestions"
          className="absolute z-30 mt-2 w-full overflow-hidden rounded-[1.25rem] border border-border/70 bg-background/95 shadow-[var(--shadow-soft)] backdrop-blur-xl"
          role="listbox"
        >
          {suggestionGroups.map((group) =>
            group.items.length > 0 ? (
              <div key={group.title} className="border-b border-border/50 p-3 last:border-b-0">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{group.title}</p>
                  {group.title === "Recent" ? (
                    <button type="button" className="text-xs text-primary" onClick={clearRecentSearches}>
                      Clear
                    </button>
                  ) : null}
                </div>
                <ul className="space-y-1">
                  {group.items.slice(0, 5).map((item) => (
                    <li key={`${group.title}-${item.label}`}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-muted/60",
                        )}
                        onMouseDown={() => navigateWithQuery(item.value, item.ai)}
                      >
                        {group.title === "AI prompts" ? <Sparkles className="h-3.5 w-3.5 text-primary" /> : null}
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null,
          )}
        </div>
      ) : null}
    </div>
  );
}
