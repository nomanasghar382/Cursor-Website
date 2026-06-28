"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ProductCardView } from "@/components/commerce/product-card";
import type { ProductCard } from "@/types/catalog";

export function ProductCarousel({ products }: { products: ProductCard[] }) {
  const [emblaRef] = useEmblaCarousel({ align: "start", loop: true }, [Autoplay({ delay: 4500 })]);

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex gap-6">
        {products.map((product) => (
          <div key={product.id} className="min-w-0 flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_32%]">
            <ProductCardView product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
