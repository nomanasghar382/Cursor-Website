"use client";

import { Sparkles, Wand2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CatalogProductCard } from "@/components/catalog/catalog-product-card";
import type { ProductCard, ProductDetail } from "@/types/catalog";

export function ProductAiPanel({ product }: { product: ProductDetail }) {
  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            AI shopping assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>{product.aiSummary}</p>
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

      <Accordion type="single" collapsible className="rounded-[1.5rem] border border-border/60 px-4">
        <AccordionItem value="comparison">
          <AccordionTrigger>AI comparison insight</AccordionTrigger>
          <AccordionContent>
            Compared with alternatives in {product.category}, {product.name} leads on AI confidence ({product.aiMatch}%),
            verified review depth, and fulfillment readiness.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="alternatives">
          <AccordionTrigger>AI recommended alternatives</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {product.aiAlternatives.map((item) => (
                <CatalogProductCard key={item.id} product={item} compact />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <ProductRail title="Frequently bought together" products={product.frequentlyBoughtTogether} />
      <ProductRail title="AI cross-sell" products={product.crossSell} badge="Cross-sell" />
      <ProductRail title="AI upsell" products={product.upsell} badge="Upgrade" />
    </div>
  );
}

function ProductRail({
  title,
  products,
  badge,
}: {
  title: string;
  products: ProductCard[];
  badge?: string;
}) {
  if (products.length === 0) return null;
  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <h3 className="font-display text-xl font-semibold">{title}</h3>
        {badge ? <Badge variant="accent">{badge}</Badge> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <CatalogProductCard key={product.id} product={product} compact />
        ))}
      </div>
    </section>
  );
}
