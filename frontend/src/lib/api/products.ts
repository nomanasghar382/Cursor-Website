import { apiRequest } from "@/lib/api/client";
import type { ProductDetailResponse, ProductListResponse, ProductQuery } from "@/types/catalog";

function toQueryString(params: ProductQuery) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.brand) query.set("brand", params.brand);
  if (params.minPrice !== undefined) query.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) query.set("maxPrice", String(params.maxPrice));
  if (params.minRating !== undefined) query.set("minRating", String(params.minRating));
  if (params.inStock) query.set("inStock", "true");
  if (params.section) query.set("section", params.section);
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
  getById(id: string) {
    return apiRequest<ProductDetailResponse>(`products/${id}`, { method: "GET" });
  },
};
