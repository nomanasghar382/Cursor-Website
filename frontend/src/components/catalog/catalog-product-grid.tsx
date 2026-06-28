"use client";

import { useEffect, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CatalogProductCard } from "@/components/catalog/catalog-product-card";
import { CatalogProductListItem } from "@/components/catalog/catalog-product-list-item";
import { CatalogProductSkeleton } from "@/components/catalog/catalog-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { Pagination } from "@/components/common/pagination";
import { Button } from "@/components/ui/button";
import type { CatalogViewMode, ProductCard } from "@/types/catalog";

type CatalogProductGridProps = {
  products: ProductCard[];
  viewMode: CatalogViewMode;
  search?: string;
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  useInfiniteScroll?: boolean;
  onPageChange?: (page: number) => void;
  onLoadMore?: () => void;
};

export function CatalogProductGrid({
  products,
  viewMode,
  search,
  total,
  page,
  limit,
  hasMore,
  isLoading,
  isFetchingNextPage,
  useInfiniteScroll = false,
  onPageChange,
  onLoadMore,
}: CatalogProductGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const shouldVirtualize = products.length > 36;

  const rowVirtualizer = useVirtualizer({
    count: shouldVirtualize ? Math.ceil(products.length / (viewMode === "grid" ? 3 : 1)) : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (viewMode === "grid" ? 420 : 180),
    overscan: 4,
  });

  const totalPages = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    if (!useInfiniteScroll || !onLoadMore) return;
    const node = parentRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      { rootMargin: "240px" },
    );

    const sentinel = node.querySelector("[data-infinite-sentinel]");
    if (sentinel) observer.observe(sentinel);
    return () => observer.disconnect();
  }, [useInfiniteScroll, onLoadMore, hasMore, isFetchingNextPage, products.length]);

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>
          {Array.from({ length: 6 }).map((_, index) => (
            <CatalogProductSkeleton key={index} viewMode={viewMode} />
          ))}
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <EmptyState
          title="No products matched your filters"
          description="Adjust filters, try AI search, or browse featured collections to discover more."
        />
      );
    }

    if (shouldVirtualize && viewMode === "grid") {
      const columns = 3;
      return (
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const start = virtualRow.index * columns;
            const rowProducts = products.slice(start, start + columns);
            return (
              <div
                key={virtualRow.key}
                className="absolute left-0 top-0 grid w-full gap-6 md:grid-cols-2 xl:grid-cols-3"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                {rowProducts.map((product) => (
                  <CatalogProductCard key={product.id} product={product} search={search} />
                ))}
              </div>
            );
          })}
        </div>
      );
    }

    if (viewMode === "list") {
      return (
        <div className="space-y-4">
          {products.map((product) => (
            <CatalogProductListItem key={product.id} product={product} search={search} />
          ))}
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <CatalogProductCard key={product.id} product={product} search={search} />
        ))}
      </div>
    );
  }, [isLoading, products, viewMode, search, shouldVirtualize, rowVirtualizer]);

  return (
    <div ref={parentRef} className="space-y-8">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {products.length} of {total} products
        </p>
      </div>
      {content}
      {useInfiniteScroll ? (
        <div className="flex flex-col items-center gap-4 py-6" data-infinite-sentinel>
          {isFetchingNextPage ? <CatalogProductSkeleton viewMode={viewMode} /> : null}
          {hasMore && !isFetchingNextPage ? (
            <Button variant="outline" onClick={onLoadMore}>
              Load more products
            </Button>
          ) : null}
        </div>
      ) : onPageChange ? (
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      ) : null}
    </div>
  );
}
