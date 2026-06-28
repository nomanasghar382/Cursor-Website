import { apiRequest } from "@/lib/api/client";
import type {
  AdminAiInsights,
  AdminCustomer,
  AdminDashboard,
  AdminOrder,
  AdminProduct,
  AdminVendor,
} from "@/types/admin";

type Query = { page?: number; limit?: number; search?: string; status?: string };

export const adminApi = {
  dashboard(token: string) {
    return apiRequest<AdminDashboard>("admin/dashboard", { method: "GET", token });
  },
  aiInsights(token: string) {
    return apiRequest<AdminAiInsights>("admin/dashboard/ai", { method: "GET", token });
  },
  products(token: string, query?: Query) {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));
    if (query?.search) params.set("search", query.search);
    if (query?.status) params.set("status", query.status);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<{ products: AdminProduct[]; total: number; page: number; limit: number }>(
      `admin/catalog/products${suffix}`,
      { method: "GET", token },
    );
  },
  product(token: string, id: string) {
    return apiRequest<{ product: AdminProduct }>(`admin/catalog/products/${id}`, { method: "GET", token });
  },
  orders(token: string, query?: Query) {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));
    if (query?.search) params.set("search", query.search);
    if (query?.status) params.set("status", query.status);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<{ orders: AdminOrder[]; total: number; page: number; limit: number }>(`admin/orders${suffix}`, {
      method: "GET",
      token,
    });
  },
  order(token: string, id: string) {
    return apiRequest<{ order: AdminOrder & Record<string, unknown> }>(`admin/orders/${id}`, { method: "GET", token });
  },
  updateOrderStatus(token: string, id: string, status: string) {
    return apiRequest(`admin/orders/${id}/status`, { method: "PATCH", token, body: { status } });
  },
  customers(token: string, query?: Query) {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));
    if (query?.search) params.set("search", query.search);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<{ customers: AdminCustomer[]; total: number; page: number; limit: number }>(
      `admin/customers${suffix}`,
      { method: "GET", token },
    );
  },
  customer(token: string, id: string) {
    return apiRequest<{ customer: AdminCustomer & Record<string, unknown> }>(`admin/customers/${id}`, {
      method: "GET",
      token,
    });
  },
  vendors(token: string, query?: Query) {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));
    if (query?.search) params.set("search", query.search);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<{ vendors: AdminVendor[]; total: number; page: number; limit: number }>(`admin/vendors${suffix}`, {
      method: "GET",
      token,
    });
  },
  coupons(token: string, query?: Query) {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", String(query.page));
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<{ coupons: unknown[]; total: number }>(`admin/growth/coupons${suffix}`, { method: "GET", token });
  },
  giftCards(token: string, query?: Query) {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", String(query.page));
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<{ giftCards: unknown[]; total: number }>(`admin/growth/gift-cards${suffix}`, {
      method: "GET",
      token,
    });
  },
  cmsPages(token: string) {
    return apiRequest<{ pages: unknown[]; total: number }>("admin/growth/cms/pages", { method: "GET", token });
  },
  blogs(token: string) {
    return apiRequest<{ blogs: unknown[]; total: number }>("admin/growth/blogs", { method: "GET", token });
  },
  roles(token: string) {
    return apiRequest<{ roles: unknown[] }>("admin/platform/roles", { method: "GET", token });
  },
  permissions(token: string) {
    return apiRequest<{ permissions: unknown[] }>("admin/platform/permissions", { method: "GET", token });
  },
  auditLogs(token: string, query?: Query) {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", String(query.page));
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<{ logs: unknown[]; total: number }>(`admin/platform/audit-logs${suffix}`, { method: "GET", token });
  },
  featureFlags(token: string) {
    return apiRequest<{ flags: Array<{ key: string; enabled: boolean; description?: string }> }>(
      "admin/platform/feature-flags",
      { method: "GET", token },
    );
  },
  settings(token: string) {
    return apiRequest<{ settings: Array<{ key: string; value: unknown }> }>("admin/platform/settings", {
      method: "GET",
      token,
    });
  },
  inventory(token: string) {
    return apiRequest<{ inventory: unknown[]; total: number }>("admin/catalog/inventory", { method: "GET", token });
  },
  exportReport(token: string, reportType: string, format: "csv" | "json" | "pdf") {
    return apiRequest<{ format: string; content?: string; rows?: unknown[] }>("admin/platform/reports/export", {
      method: "POST",
      token,
      body: { reportType, format },
    });
  },
};
