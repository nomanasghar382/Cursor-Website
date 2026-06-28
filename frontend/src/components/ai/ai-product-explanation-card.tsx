"use client";

import { useQuery } from "@tanstack/react-query";
import { Sparkles, Wand2 } from "lucide-react";
import { AiRecommendationCarousel } from "@/components/ai/ai-recommendation-carousel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { aiApi } from "@/lib/api/ai";
import { useAuthStore } from "@/stores/auth-store";
import type { ProductDetail } from "@/types/catalog";
import type { RecommendationType } from "@/types/ai";

type AiProductExplanationCardProps = {
  product: ProductDetail;
};

export function AiProductExplanationCard({ product }: AiProductExplanationCardProps) {
  const token = useAuthStore((state) => state.accessToken);

  const similarQuery = useQuery({
    queryKey: ["ai-similar", product.id],
    queryFn: () => aiApi.recommendations({ type: "similar", productId: product.id, limit: 4 }, token),
  });

  const crossSellQuery = useQuery({
    queryKey: ["ai-cross-sell", product.id],
    queryFn: () => aiApi.recommendations({ type: "cross-sell", productId: product.id, limit: 4 }, token),
  });

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            AI product explanation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>{product.aiSummary}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">{product.aiMatch}% AI match</Badge>
            <Badge variant="secondary">{product.reviewCount} reviews</Badge>
            <Badge variant="outline">{product.stock} in stock</Badge>
          </div>
          <ul className="space-y-2">
            {product.aiHighlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-2">
                <Wand2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {highlight}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <RecommendationSection type="similar" productId={product.id} fallback={product.similarProducts} query={similarQuery} />
      <RecommendationSection type="cross-sell" productId={product.id} fallback={product.crossSell} query={crossSellQuery} />
    </div>
  );
}

function RecommendationSection({
  type,
  fallback,
  query,
}: {
  type: RecommendationType;
  productId: string;
  fallback: ProductDetail["similarProducts"];
  query: {
    isLoading: boolean;
    data?: { products: ProductDetail["similarProducts"]; reason?: string };
  };
}) {
  const titleMap: Record<string, string> = {
    similar: "Similar products",
    "cross-sell": "Cross-sell picks",
    upsell: "Upgrade options",
    "frequently-bought-together": "Frequently bought together",
  };

  if (query.isLoading) {
    return <Skeleton className="h-48 w-full rounded-[1.5rem]" />;
  }

  const products = query.data?.products ?? fallback;

  return (
    <AiRecommendationCarousel
      title={titleMap[type] ?? "AI recommendations"}
      reason={query.data?.reason}
      products={products}
      compact
    />
  );
}
