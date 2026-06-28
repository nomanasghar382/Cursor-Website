"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { Sparkles } from "lucide-react";
import { CatalogProductCard } from "@/components/catalog/catalog-product-card";
import type { ProductCard } from "@/types/catalog";
import { cn } from "@/lib/utils";

type AiRecommendationCarouselProps = {
  title?: string;
  products: ProductCard[];
  reason?: string;
  compact?: boolean;
  loading?: boolean;
};

export function AiRecommendationCarousel({
  title = "AI recommendations",
  products,
  reason,
  compact = false,
  loading = false,
}: AiRecommendationCarouselProps) {
  const [emblaRef] = useEmblaCarousel({ align: "start", loop: products.length > 2 }, products.length > 2 ? [Autoplay({ delay: 5000 })] : []);

  if (loading) {
    return (
      <div className="space-y-3">
        <Header title={title} reason={reason} />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-56 animate-pulse rounded-[1.5rem] bg-muted/40" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
        <Sparkles className="mx-auto mb-2 h-5 w-5 text-primary" />
        AI recommendations will appear as you browse, add to cart, and shop.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <Header title={title} reason={reason} />
      <div className={cn("overflow-hidden", compact ? "" : "")} ref={emblaRef}>
        <div className="flex gap-4">
          {products.map((product) => (
            <div key={product.id} className={cn("min-w-0", compact ? "flex-[0_0_88%] sm:flex-[0_0_55%]" : "flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_32%]")}>
              <CatalogProductCard product={product} compact />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Header({ title, reason }: { title: string; reason?: string }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-display text-xl font-semibold">{title}</h3>
      </div>
      {reason ? <p className="mt-1 text-sm text-muted-foreground">{reason}</p> : null}
    </div>
  );
}
