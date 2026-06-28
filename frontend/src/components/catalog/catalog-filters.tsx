"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { CatalogFacets } from "@/types/catalog";
import { cn } from "@/lib/utils";

const ratingOptions = [4, 3, 2];
const colorOptions = ["Black", "White", "Silver", "Graphite", "Midnight"];
const sizeOptions = ["S", "M", "L", "XL", "One Size"];
const materialOptions = ["Aluminum", "Titanium", "Ceramic", "Composite", "Fabric"];

const aiFilterSuggestions = [
  "In-stock premium picks under $1500",
  "Trending robotics with 4+ stars",
  "Flash sale audio gear",
];

type CatalogFiltersProps = {
  facets: CatalogFacets;
  className?: string;
};

export function CatalogFilters({ facets, className }: CatalogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localMin, setLocalMin] = useState(String(searchParams.get("minPrice") ?? facets.minPrice));
  const [localMax, setLocalMax] = useState(String(searchParams.get("maxPrice") ?? facets.maxPrice));

  useEffect(() => {
    setLocalMin(searchParams.get("minPrice") ?? String(facets.minPrice));
    setLocalMax(searchParams.get("maxPrice") ?? String(facets.maxPrice));
  }, [searchParams, facets.minPrice, facets.maxPrice]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (!value) params.delete(key);
        else params.set(key, value);
      });
      params.delete("page");
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams],
  );

  const activeCategory = searchParams.get("category");
  const activeBrand = searchParams.get("brand");
  const activeRating = searchParams.get("minRating");
  const inStock = searchParams.get("inStock") === "true";
  const activeSection = searchParams.get("section");

  const filterPanel = (
    <div className="space-y-6">
      <section>
        <Label className="mb-3 block text-xs uppercase tracking-[0.18em] text-muted-foreground">Collections</Label>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Featured", value: "featured" },
            { label: "Trending", value: "trending" },
            { label: "New arrivals", value: "new" },
            { label: "Best sellers", value: "bestseller" },
            { label: "Flash sale", value: "flash-sale" },
          ].map((entry) => (
            <Button
              key={entry.value}
              size="sm"
              variant={activeSection === entry.value ? "gradient" : "outline"}
              onClick={() => updateParams({ section: activeSection === entry.value ? null : entry.value })}
            >
              {entry.label}
            </Button>
          ))}
        </div>
      </section>

      <Separator />

      <section>
        <Label className="mb-3 block text-xs uppercase tracking-[0.18em] text-muted-foreground">Categories</Label>
        <div className="flex flex-wrap gap-2">
          {facets.categories.map((category) => (
            <Button
              key={category.slug}
              size="sm"
              variant={activeCategory === category.slug ? "gradient" : "outline"}
              onClick={() => updateParams({ category: activeCategory === category.slug ? null : category.slug })}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </section>

      <section>
        <Label className="mb-3 block text-xs uppercase tracking-[0.18em] text-muted-foreground">Brands</Label>
        <div className="flex flex-wrap gap-2">
          {facets.brands.map((brand) => (
            <Button
              key={brand.slug}
              size="sm"
              variant={activeBrand === brand.slug ? "gradient" : "outline"}
              onClick={() => updateParams({ brand: activeBrand === brand.slug ? null : brand.slug })}
            >
              {brand.name}
            </Button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Price range</Label>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Min" value={localMin} onChange={setLocalMin} />
          <InputField label="Max" value={localMax} onChange={setLocalMax} />
        </div>
        <input
          type="range"
          min={facets.minPrice}
          max={facets.maxPrice}
          value={Number(localMax)}
          onChange={(event) => setLocalMax(event.target.value)}
          className="w-full accent-primary"
          aria-label="Price range slider"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => updateParams({ minPrice: localMin || null, maxPrice: localMax || null })}
        >
          Apply price
        </Button>
      </section>

      <section>
        <Label className="mb-3 block text-xs uppercase tracking-[0.18em] text-muted-foreground">Rating</Label>
        <div className="flex flex-wrap gap-2">
          {ratingOptions.map((rating) => (
            <Button
              key={rating}
              size="sm"
              variant={activeRating === String(rating) ? "gradient" : "outline"}
              onClick={() => updateParams({ minRating: activeRating === String(rating) ? null : String(rating) })}
            >
              {rating}+ stars
            </Button>
          ))}
        </div>
      </section>

      <section>
        <Label className="mb-3 block text-xs uppercase tracking-[0.18em] text-muted-foreground">Availability</Label>
        <Button
          size="sm"
          variant={inStock ? "gradient" : "outline"}
          onClick={() => updateParams({ inStock: inStock ? null : "true" })}
        >
          In stock only
        </Button>
      </section>

      <FilterChipGroup
        title="Color"
        paramKey="color"
        options={colorOptions}
        searchParams={searchParams}
        updateParams={updateParams}
      />
      <FilterChipGroup
        title="Size"
        paramKey="size"
        options={sizeOptions}
        searchParams={searchParams}
        updateParams={updateParams}
      />
      <FilterChipGroup
        title="Material"
        paramKey="material"
        options={materialOptions}
        searchParams={searchParams}
        updateParams={updateParams}
      />

      <section>
        <Label className="mb-3 block text-xs uppercase tracking-[0.18em] text-muted-foreground">Discount</Label>
        <Button
          size="sm"
          variant={searchParams.get("section") === "flash-sale" ? "gradient" : "outline"}
          onClick={() =>
            updateParams({ section: searchParams.get("section") === "flash-sale" ? null : "flash-sale" })
          }
        >
          On sale
        </Button>
      </section>

      <section className="rounded-[1.25rem] border border-primary/20 bg-primary/5 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          AI filter suggestions
        </div>
        <div className="space-y-2">
          {aiFilterSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="block w-full rounded-xl px-3 py-2 text-left text-sm transition hover:bg-background/70"
              onClick={() => updateParams({ search: suggestion, ai: "1" })}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </section>

      <Button
        variant="ghost"
        className="w-full"
        onClick={() => router.push("/products")}
      >
        <RotateCcw className="h-4 w-4" />
        Reset all filters
      </Button>
    </div>
  );

  return (
    <>
      <aside className={cn("hidden w-72 shrink-0 lg:block", className)}>
        <div className="sticky top-28 rounded-[1.5rem] border border-border/60 bg-card/40 p-5 backdrop-blur-xl">
          <h2 className="mb-4 font-display text-lg font-semibold">Filters</h2>
          {filterPanel}
        </div>
      </aside>

      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline" className="lg:hidden">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Smart filters</DrawerTitle>
          </DrawerHeader>
          <div className="max-h-[70vh] overflow-y-auto px-4 pb-8">{filterPanel}</div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-border bg-background px-3 py-2"
      />
    </label>
  );
}

function FilterChipGroup({
  title,
  paramKey,
  options,
  searchParams,
  updateParams,
}: {
  title: string;
  paramKey: string;
  options: string[];
  searchParams: ReturnType<typeof useSearchParams>;
  updateParams: (updates: Record<string, string | null>) => void;
}) {
  const active = searchParams.get(paramKey);
  return (
    <section>
      <Label className="mb-3 block text-xs uppercase tracking-[0.18em] text-muted-foreground">{title}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option}
            size="sm"
            variant={active === option ? "gradient" : "outline"}
            onClick={() => updateParams({ [paramKey]: active === option ? null : option })}
          >
            {option}
          </Button>
        ))}
      </div>
    </section>
  );
}
