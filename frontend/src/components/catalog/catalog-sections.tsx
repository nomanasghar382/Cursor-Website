"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CatalogProductCard } from "@/components/catalog/catalog-product-card";
import { SectionHeading } from "@/components/home/section-heading";
import { Button } from "@/components/ui/button";
import type { ProductCard } from "@/types/catalog";

type SectionConfig = {
  id: string;
  title: string;
  description: string;
  section: string;
  products: ProductCard[];
};

export function CatalogSections({ sections }: { sections: SectionConfig[] }) {
  return (
    <div className="space-y-12">
      {sections.map((section) =>
        section.products.length > 0 ? (
          <section key={section.id} aria-labelledby={`section-${section.id}`}>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                id={`section-${section.id}`}
                eyebrow="Curated"
                title={section.title}
                description={section.description}
              />
              <Button asChild variant="ghost">
                <Link href={`/products?section=${section.section}`}>
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {section.products.map((product) => (
                <div key={product.id} className="min-w-[280px] max-w-[320px] shrink-0">
                  <CatalogProductCard product={product} compact />
                </div>
              ))}
            </div>
          </section>
        ) : null,
      )}
    </div>
  );
}

export function RecentlyViewedSection({
  products,
}: {
  products: ProductCard[];
}) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="recently-viewed-heading">
      <SectionHeading
        id="recently-viewed-heading"
        eyebrow="Your journey"
        title="Recently viewed"
        description="Continue exploring products you opened during this session."
      />
      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <CatalogProductCard key={product.id} product={product} compact />
        ))}
      </div>
    </section>
  );
}
