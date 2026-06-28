import { productsApi } from "@/lib/api/products";
import type { ProductQuery } from "@/types/catalog";

export async function getProducts(params: ProductQuery = {}) {
  return productsApi.list(params);
}
