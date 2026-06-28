"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Grid3X3, LayoutList, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCatalogStore } from "@/stores/catalog-store";
import type { CatalogSort } from "@/types/catalog";
import { cn } from "@/lib/utils";

const sortOptions: { label: string; value: CatalogSort }[] = [
  { label: "AI recommended", value: "ai-recommended" },
  { label: "Newest", value: "newest" },
  { label: "Popularity", value: "trending" },
  { label: "Best rating", value: "rating" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Discount", value: "discount" },
  { label: "Trending", value: "trending" },
];

export function CatalogToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewMode = useCatalogStore((state) => state.viewMode);
  const setViewMode = useCatalogStore((state) => state.setViewMode);
  const scrollMode = searchParams.get("scroll") !== "pagination";
  const activeSort = (searchParams.get("sort") as CatalogSort | null) ?? "ai-recommended";

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 rounded-[1.5rem] border border-border/60 bg-card/30 p-4 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <label className="text-sm text-muted-foreground" htmlFor="catalog-sort">
          Sort by
        </label>
        <select
          id="catalog-sort"
          value={activeSort}
          onChange={(event) => updateParam("sort", event.target.value)}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          aria-label="Sort products"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={scrollMode ? "gradient" : "outline"}
          onClick={() => updateParam("scroll", scrollMode ? "pagination" : null)}
        >
          {scrollMode ? "Infinite scroll" : "Pagination"}
        </Button>
        <div className="inline-flex rounded-xl border border-border p-1" role="group" aria-label="View mode">
          <Button
            size="sm"
            variant={viewMode === "grid" ? "gradient" : "ghost"}
            onClick={() => setViewMode("grid")}
            aria-pressed={viewMode === "grid"}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === "list" ? "gradient" : "ghost"}
            onClick={() => setViewMode("list")}
            aria-pressed={viewMode === "list"}
          >
            <LayoutList className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ActiveFilterPills() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pills = [
    ["search", searchParams.get("search")],
    ["category", searchParams.get("category")],
    ["brand", searchParams.get("brand")],
    ["section", searchParams.get("section")],
    ["minRating", searchParams.get("minRating") ? `${searchParams.get("minRating")}+ stars` : null],
    ["inStock", searchParams.get("inStock") === "true" ? "In stock" : null],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  if (pills.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {pills.map(([key, label]) => (
        <button
          key={key}
          type="button"
          className={cn(
            "rounded-full border border-border px-3 py-1 text-xs transition hover:border-primary/40 hover:text-primary",
          )}
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete(key);
            router.push(`/products?${params.toString()}`);
          }}
        >
          {label} ×
        </button>
      ))}
    </div>
  );
}
