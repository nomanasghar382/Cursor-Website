import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { AiSearchBox } from "@/components/search/search-bar";
import { ProductCarousel } from "@/components/commerce/product-carousel";
import { getProducts } from "@/features/catalog/services";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "AI Studio", path: "/ai" });

type AiPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AiStudioPage({ searchParams }: AiPageProps) {
  const params = await searchParams;
  const catalog = await getProducts({ search: params.q, limit: 6 }).catch(() => ({ products: [], count: 0 }));

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="AI Studio"
        title="Personalized product intelligence"
        description="Describe your intent and let NOVAEX rank the catalog by fit, confidence, and experience quality."
        icon={Sparkles}
      />
      <AiSearchBox />
      {params.q ? (
        <section className="space-y-6">
          <h2 className="font-display text-3xl font-semibold">Recommendations for “{params.q}”</h2>
          <ProductCarousel products={catalog.products} />
        </section>
      ) : null}
    </div>
  );
}
