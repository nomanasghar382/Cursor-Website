"use client";

import { AiProductExplanationCard } from "@/components/ai/ai-product-explanation-card";
import type { ProductDetail } from "@/types/catalog";

export function ProductAiPanel({ product }: { product: ProductDetail }) {
  return <AiProductExplanationCard product={product} />;
}
