import { apiRequest } from "@/lib/api/client";
import type { VendorAiInsights, VendorDashboard, VendorOrder, VendorPayouts, VendorProduct, VendorStore } from "@/types/vendor";

type Query = { page?: number; limit?: number; search?: string; status?: string; storeId?: string };

export const vendorApi = {
  dashboard(token: string, storeId?: string) {
    const suffix = storeId ? `?storeId=${storeId}` : "";
    return apiRequest<VendorDashboard>(`vendor/dashboard${suffix}`, { method: "GET", token });
  },
  aiInsights(token: string, storeId?: string) {
    const suffix = storeId ? `?storeId=${storeId}` : "";
    return apiRequest<VendorAiInsights>(`vendor/dashboard/ai${suffix}`, { method: "GET", token });
  },
  store(token: string, storeId?: string) {
    const suffix = storeId ? `?storeId=${storeId}` : "";
    return apiRequest<{ store: VendorStore }>(`vendor/store${suffix}`, { method: "GET", token });
  },
  updateStore(token: string, body: Partial<VendorStore>, storeId?: string) {
    const suffix = storeId ? `?storeId=${storeId}` : "";
    return apiRequest<{ store: VendorStore }>(`vendor/store${suffix}`, { method: "PATCH", token, body });
  },
  products(token: string, query?: Query) {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));
    if (query?.search) params.set("search", query.search);
    if (query?.status) params.set("status", query.status);
    if (query?.storeId) params.set("storeId", query.storeId);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<{ products: VendorProduct[]; total: number }>(`vendor/products${suffix}`, { method: "GET", token });
  },
  orders(token: string, query?: Query) {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", String(query.page));
    if (query?.search) params.set("search", query.search);
    if (query?.status) params.set("status", query.status);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<{ orders: VendorOrder[]; total: number }>(`vendor/orders${suffix}`, { method: "GET", token });
  },
  order(token: string, id: string) {
    return apiRequest<{ order: VendorOrder & Record<string, unknown> }>(`vendor/orders/${id}`, { method: "GET", token });
  },
  updateOrderStatus(token: string, id: string, status: string) {
    return apiRequest(`vendor/orders/${id}/status`, { method: "PATCH", token, body: { status } });
  },
  customers(token: string, query?: Query) {
    const params = new URLSearchParams();
    if (query?.search) params.set("search", query.search);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<{ customers: Array<{ id: string; email: string; name: string; orderCount: number }> }>(
      `vendor/customers${suffix}`,
      { method: "GET", token },
    );
  },
  reviews(token: string) {
    return apiRequest<{ reviews: Array<{ id: string; rating: number; title?: string; body: string; productName: string; customer: string }> }>(
      "vendor/reviews",
      { method: "GET", token },
    );
  },
  payouts(token: string) {
    return apiRequest<VendorPayouts>("vendor/payouts", { method: "GET", token });
  },
  requestPayout(token: string) {
    return apiRequest<{ message: string }>("vendor/payouts/request", { method: "POST", token, body: {} });
  },
  analytics(token: string) {
    return apiRequest<{
      revenue: number;
      profit: number;
      orders: number;
      visitors: number;
      conversionRate: number;
      averageOrderValue: number;
      customerGrowth: number;
    }>("vendor/analytics", { method: "GET", token });
  },
  exportReport(token: string, reportType: string, format: "csv" | "json") {
    return apiRequest<{ format: string; content?: string; rows?: unknown[] }>("vendor/analytics/export", {
      method: "POST",
      token,
      body: { reportType, format },
    });
  },
  generateAi(token: string, body: { productName: string; category?: string; tone?: string }) {
    return apiRequest<{ description: string; seoTitle: string; seoDescription: string; keywords: string[] }>(
      "vendor/ai/generate",
      { method: "POST", token, body },
    );
  },
  inventory(token: string) {
    return apiRequest<{ inventory: Array<{ id: string; sku: string; productName: string; warehouse: string; available: number }> }>(
      "vendor/inventory",
      { method: "GET", token },
    );
  },
  catalogOptions(token: string) {
    return apiRequest<{ categories: Array<{ id: string; name: string }>; brands: Array<{ id: string; name: string }> }>(
      "vendor/catalog/options",
      { method: "GET", token },
    );
  },
};
