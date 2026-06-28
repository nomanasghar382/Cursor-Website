"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ProductCardView } from "@/components/commerce/product-card";
import { SectionHeading } from "@/components/home/section-heading";
import { Reveal } from "@/components/motion/reveal";
import type { ProductCard } from "@/types/catalog";

export function PersonalizedRecommendationsSection({ products }: { products: ProductCard[] }) {
  const [emblaRef] = useEmblaCarousel({ align: "start", loop: true, dragFree: true }, [Autoplay({ delay: 4200 })]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 md:px-6">
      <Reveal>
        <SectionHeading
          eyebrow="For you"
          title="Personalized recommendations"
          description="Adaptive picks based on browsing signals, category affinity, and NovaAI confidence scoring."
        />
      </Reveal>
      <div className="mt-12 overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {products.map((product) => (
            <div key={product.id} className="min-w-0 flex-[0_0_88%] sm:flex-[0_0_48%] lg:flex-[0_0_32%]">
              <ProductCardView product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
