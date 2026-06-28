"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api/products";
import type { ProductListResponse, ProductQuery } from "@/types/catalog";

export function useCatalogInfiniteQuery(
  baseQuery: ProductQuery,
  enabled = true,
  initialData?: ProductListResponse,
) {
  return useInfiniteQuery({
    queryKey: ["catalog", baseQuery],
    enabled,
    initialPageParam: baseQuery.page ?? 1,
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [initialData.page],
        }
      : undefined,
    queryFn: ({ pageParam }) =>
      productsApi.list({
        ...baseQuery,
        page: pageParam,
        limit: baseQuery.limit ?? 24,
      }),
    getNextPageParam: (lastPage: ProductListResponse) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
  });
}

export function useCatalogSearchSuggestions(query: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ["catalog-suggestions", query],
    enabled: enabled && query.trim().length >= 2,
    initialPageParam: 1,
    queryFn: () => productsApi.list({ search: query, limit: 6 }),
    getNextPageParam: () => undefined,
  });
}
