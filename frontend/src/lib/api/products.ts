import { apiRequest } from "@/lib/api/client";
import type { ProductListResponse, ProductQuery } from "@/types/catalog";

function toQueryString(params: ProductQuery) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.sort) query.set("sort", params.sort);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  const suffix = query.toString();
  return suffix ? `?${suffix}` : "";
}

export const productsApi = {
  list(params: ProductQuery = {}) {
    return apiRequest<ProductListResponse>(`products${toQueryString(params)}`, { method: "GET" });
  },
};
