import { Suspense } from "react";
import { ShoppingBag } from "lucide-react";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { PageHeader } from "@/components/common/page-header";
import { CatalogGridSkeleton } from "@/components/catalog/catalog-skeleton";
import { CatalogPageClient } from "@/components/catalog/catalog-page";
import { getProducts } from "@/features/catalog/services";
import { buildMetadata } from "@/lib/seo";
import type { ProductQuery } from "@/types/catalog";

export const metadata = buildMetadata({
  title: "Products",
  description: "Browse the NOVAEX premium product catalog with AI-powered filters, search, and recommendations.",
  path: "/products",
});

type ProductsPageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    brand?: string;
    sort?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    inStock?: string;
    section?: string;
    scroll?: string;
  }>;
};

function buildQuery(params: Awaited<ProductsPageProps["searchParams"]>): ProductQuery {
  return {
    search: params.search,
    category: params.category,
    brand: params.brand,
    sort: (params.sort as ProductQuery["sort"]) ?? "ai-recommended",
    page: params.page ? Number(params.page) : 1,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    minRating: params.minRating ? Number(params.minRating) : undefined,
    inStock: params.inStock === "true" ? true : undefined,
    section: params.section as ProductQuery["section"],
    limit: 24,
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const query = buildQuery(params);

  const [catalog, featured, trending, newArrivals, bestSellers, flashSale, recommended] = await Promise.all([
    getProducts(query).catch(() => ({
      products: [],
      count: 0,
      total: 0,
      page: 1,
      limit: 24,
      hasMore: false,
      facets: { categories: [], brands: [], minPrice: 0, maxPrice: 0 },
    })),
    getProducts({ section: "featured", limit: 8, sort: "ai-recommended" }).catch(() => null),
    getProducts({ section: "trending", limit: 8, sort: "trending" }).catch(() => null),
    getProducts({ section: "new", limit: 8, sort: "newest" }).catch(() => null),
    getProducts({ section: "bestseller", limit: 8 }).catch(() => null),
    getProducts({ section: "flash-sale", limit: 8, sort: "discount" }).catch(() => null),
    getProducts({ sort: "ai-recommended", limit: 8 }).catch(() => null),
  ]);

  return (
    <div className="space-y-10">
      <Breadcrumb items={[{ label: "Products" }]} />
      <PageHeader
        eyebrow="Catalog"
        title="Premium products, ranked by intelligence"
        description="Every listing is scored by NOVAEX AI for fit, availability, and experience quality."
        icon={ShoppingBag}
      />
      <Suspense fallback={<CatalogGridSkeleton />}>
        <CatalogPageClient
          initialData={catalog}
          facets={catalog.facets}
          sectionProducts={{
            featured: featured?.products ?? [],
            trending: trending?.products ?? [],
            newArrivals: newArrivals?.products ?? [],
            bestSellers: bestSellers?.products ?? [],
            flashSale: flashSale?.products ?? [],
            recommended: recommended?.products ?? [],
            recentlyViewed: [],
          }}
        />
      </Suspense>
    </div>
  );
}
