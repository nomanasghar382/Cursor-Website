"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCatalogStore } from "@/stores/catalog-store";
import { productsApi } from "@/lib/api/products";
import { ProductAiPanel } from "@/components/product/product-ai-panel";
import { ProductBuyBox } from "@/components/product/product-buy-box";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductQa } from "@/components/product/product-qa";
import { ProductRelatedSections } from "@/components/product/product-related";
import { ProductReviews } from "@/components/product/product-reviews";
import { ProductStickyCta } from "@/components/product/product-sticky-cta";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProductCard, ProductDetail } from "@/types/catalog";

export function ProductDetailClient({
  product,
  recentlyViewed,
}: {
  product: ProductDetail;
  recentlyViewed: ProductCard[];
}) {
  const addRecentlyViewed = useCatalogStore((state) => state.addRecentlyViewed);
  const recentlyViewedIds = useCatalogStore((state) => state.recentlyViewed);

  const recentlyViewedQuery = useQuery({
    queryKey: ["recently-viewed-pdp", recentlyViewedIds, product.id],
    enabled: recentlyViewedIds.length > 1,
    queryFn: async () => {
      const ids = recentlyViewedIds.filter((id) => id !== product.id).slice(0, 4);
      const entries = await Promise.all(
        ids.map(async (id) => {
          try {
            const { product: entry } = await productsApi.getById(id);
            return entry;
          } catch {
            return null;
          }
        }),
      );
      return entries.filter((entry) => entry !== null);
    },
  });

  useEffect(() => {
    addRecentlyViewed(product.id);
  }, [addRecentlyViewed, product.id]);

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <ProductGallery product={product} />
        <ProductBuyBox product={product} />
      </div>

      <Tabs defaultValue="ai" className="space-y-6">
        <TabsList className="flex w-full flex-wrap">
          <TabsTrigger value="ai">AI experience</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="qa">Q&A</TabsTrigger>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
        </TabsList>
        <TabsContent value="ai">
          <ProductAiPanel product={product} />
        </TabsContent>
        <TabsContent value="reviews">
          <ProductReviews product={product} />
        </TabsContent>
        <TabsContent value="qa">
          <ProductQa product={product} />
        </TabsContent>
        <TabsContent value="specs">
          <div className="grid gap-3 rounded-[1.5rem] border border-border/60 p-6 md:grid-cols-2">
            {product.specifications.map((spec) => (
              <div key={`${spec.key}-${spec.value}`} className="flex justify-between gap-4 border-b border-border/40 py-2 text-sm">
                <span className="text-muted-foreground">{spec.key}</span>
                <span className="font-medium">
                  {spec.value}
                  {spec.unit ? ` ${spec.unit}` : ""}
                </span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <ProductRelatedSections
        similarProducts={product.similarProducts}
        recentlyViewed={recentlyViewedQuery.data ?? recentlyViewed}
      />
      <ProductStickyCta product={product} />
    </>
  );
}
