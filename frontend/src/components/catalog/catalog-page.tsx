"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { CatalogProductGrid } from "@/components/catalog/catalog-product-grid";
import { CatalogSearch } from "@/components/catalog/catalog-search";
import { CatalogSections, RecentlyViewedSection } from "@/components/catalog/catalog-sections";
import { ActiveFilterPills, CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { useCatalogInfiniteQuery } from "@/features/catalog/hooks";
import { productsApi } from "@/lib/api/products";
import { useCatalogStore } from "@/stores/catalog-store";
import type { CatalogFacets, ProductCard, ProductListResponse, ProductQuery } from "@/types/catalog";

type CatalogPageClientProps = {
  initialData: ProductListResponse;
  sectionProducts: {
    featured: ProductCard[];
    trending: ProductCard[];
    newArrivals: ProductCard[];
    bestSellers: ProductCard[];
    flashSale: ProductCard[];
    recommended: ProductCard[];
    recentlyViewed: ProductCard[];
  };
  facets: CatalogFacets;
};

function parseQuery(searchParams: URLSearchParams): ProductQuery {
  return {
    search: searchParams.get("search") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    brand: searchParams.get("brand") ?? undefined,
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    minRating: searchParams.get("minRating") ? Number(searchParams.get("minRating")) : undefined,
    inStock: searchParams.get("inStock") === "true" ? true : undefined,
    section: (searchParams.get("section") as ProductQuery["section"]) ?? undefined,
    sort: (searchParams.get("sort") as ProductQuery["sort"]) ?? "ai-recommended",
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    limit: 24,
  };
}

export function CatalogPageClient({ initialData, sectionProducts, facets }: CatalogPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewMode = useCatalogStore((state) => state.viewMode);
  const query = useMemo(() => parseQuery(searchParams), [searchParams]);
  const useInfiniteScroll = searchParams.get("scroll") !== "pagination";
  const hasActiveFilters = Boolean(
    query.search ||
      query.category ||
      query.brand ||
      query.section ||
      query.minPrice ||
      query.maxPrice ||
      query.minRating ||
      query.inStock,
  );

  const infiniteQuery = useCatalogInfiniteQuery(query, useInfiniteScroll, initialData);
  const paginatedData = useInfiniteScroll ? undefined : initialData;
  const recentlyViewedIds = useCatalogStore((state) => state.recentlyViewed);

  const recentlyViewedQuery = useQuery({
    queryKey: ["recently-viewed", recentlyViewedIds],
    enabled: recentlyViewedIds.length > 0,
    queryFn: async () => {
      const entries = await Promise.all(
        recentlyViewedIds.slice(0, 8).map(async (id) => {
          try {
            const { product } = await productsApi.getById(id);
            return product;
          } catch {
            return null;
          }
        }),
      );
      return entries.filter((entry) => entry !== null);
    },
  });

  const products = useInfiniteScroll
    ? infiniteQuery.data?.pages.flatMap((page) => page.products) ?? initialData.products
    : paginatedData?.products ?? initialData.products;

  const total = useInfiniteScroll
    ? infiniteQuery.data?.pages[0]?.total ?? initialData.total
    : paginatedData?.total ?? initialData.total;

  const page = query.page ?? 1;
  const hasMore = useInfiniteScroll
    ? Boolean(infiniteQuery.hasNextPage)
    : page * (query.limit ?? 24) < total;

  const sections = [
    {
      id: "featured",
      title: "Featured products",
      description: "Handpicked flagship experiences with elite AI confidence scores.",
      section: "featured",
      products: sectionProducts.featured,
    },
    {
      id: "trending",
      title: "Trending now",
      description: "What enterprise buyers and enthusiasts are exploring this week.",
      section: "trending",
      products: sectionProducts.trending,
    },
    {
      id: "new",
      title: "New arrivals",
      description: "Fresh launches across robotics, audio, wearables, and smart home.",
      section: "new",
      products: sectionProducts.newArrivals,
    },
    {
      id: "bestseller",
      title: "Best sellers",
      description: "Top-performing products validated by verified purchase velocity.",
      section: "bestseller",
      products: sectionProducts.bestSellers,
    },
    {
      id: "flash-sale",
      title: "Flash sale",
      description: "Limited-time offers with premium savings across the catalog.",
      section: "flash-sale",
      products: sectionProducts.flashSale,
    },
    {
      id: "recommended",
      title: "Recommended for you",
      description: "Adaptive picks based on browsing intelligence and catalog signals.",
      section: "featured",
      products: sectionProducts.recommended,
    },
  ];

  return (
    <div className="space-y-10">
      <CatalogSearch defaultValue={query.search ?? ""} />
      <ActiveFilterPills />

      {!hasActiveFilters ? (
        <>
          <CatalogSections sections={sections} />
          <RecentlyViewedSection products={recentlyViewedQuery.data ?? sectionProducts.recentlyViewed} />
        </>
      ) : null}

      <div className="flex flex-col gap-8 lg:flex-row">
        <CatalogFilters facets={facets} />
        <div className="min-w-0 flex-1 space-y-6">
          <CatalogToolbar />
          <CatalogProductGrid
            products={products}
            viewMode={viewMode}
            search={query.search}
            total={total}
            page={page}
            limit={query.limit ?? 24}
            hasMore={hasMore}
            isLoading={useInfiniteScroll && infiniteQuery.isLoading}
            isFetchingNextPage={infiniteQuery.isFetchingNextPage}
            useInfiniteScroll={useInfiniteScroll}
            onLoadMore={() => infiniteQuery.fetchNextPage()}
            onPageChange={
              useInfiniteScroll
                ? undefined
                : (nextPage) => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("page", String(nextPage));
                    router.push(`/products?${params.toString()}`);
                  }
            }
          />
        </div>
      </div>
    </div>
  );
}
