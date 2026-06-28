"use client";

import { CatalogProductCard } from "@/components/catalog/catalog-product-card";
import { SectionHeading } from "@/components/home/section-heading";
import type { ProductCard } from "@/types/catalog";

export function ProductRelatedSections({
  similarProducts,
  recentlyViewed,
}: {
  similarProducts: ProductCard[];
  recentlyViewed: ProductCard[];
}) {
  return (
    <div className="space-y-12">
      {similarProducts.length > 0 ? (
        <section aria-labelledby="similar-products-heading">
          <SectionHeading
            id="similar-products-heading"
            eyebrow="Discover"
            title="Similar products"
            description="Explore comparable experiences curated by NOVAEX intelligence."
          />
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {similarProducts.map((product) => (
              <CatalogProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      {recentlyViewed.length > 0 ? (
        <section aria-labelledby="recently-viewed-pdp-heading">
          <SectionHeading
            id="recently-viewed-pdp-heading"
            eyebrow="Continue"
            title="Recently viewed"
            description="Quick access to products you explored earlier."
          />
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {recentlyViewed.map((product) => (
              <CatalogProductCard key={product.id} product={product} compact />
            ))}
          </div>
        </section>
      ) : null}

      {similarProducts.length > 1 ? (
        <section aria-labelledby="complete-the-look-heading">
          <SectionHeading
            id="complete-the-look-heading"
            eyebrow="Style"
            title="Complete the look"
            description="Pair your selection with complementary products."
          />
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {similarProducts.slice(0, 3).map((product) => (
              <CatalogProductCard key={`look-${product.id}`} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      {similarProducts.length > 2 ? (
        <section aria-labelledby="also-bought-heading">
          <SectionHeading
            id="also-bought-heading"
            eyebrow="Social proof"
            title="Customers also bought"
            description="Popular combinations from verified enterprise buyers."
          />
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {similarProducts.slice(1, 4).map((product) => (
              <CatalogProductCard key={`bought-${product.id}`} product={product} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
