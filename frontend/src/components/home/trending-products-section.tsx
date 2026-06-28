import { SectionHeading } from "@/components/home/section-heading";
import { TrendingProductCard } from "@/components/home/trending-product-card";
import { Reveal } from "@/components/motion/reveal";
import type { ProductCard } from "@/types/catalog";

export function TrendingProductsSection({ products }: { products: ProductCard[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 md:px-6">
      <Reveal>
        <SectionHeading
          eyebrow="Trending now"
          title="Products the market is moving toward"
          description="Live catalog intelligence from the NOVAEX backend, ranked by AI confidence, rating quality, and inventory readiness."
        />
      </Reveal>
      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product, index) => (
          <Reveal key={product.id} delay={index * 0.05}>
            <TrendingProductCard product={product} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
