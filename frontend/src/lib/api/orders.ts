import { apiRequest } from "@/lib/api/client";
import type { OrderSummary } from "@/types/commerce";

export type OrderListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

function toQuery(params: OrderListQuery = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  const suffix = query.toString();
  return suffix ? `?${suffix}` : "";
}

export const ordersApi = {
  list(token: string, params?: OrderListQuery) {
    return apiRequest<{ orders: OrderSummary[]; total: number; page: number; limit: number; hasMore: boolean }>(
      `orders${toQuery(params)}`,
      { method: "GET", token },
    );
  },
  getById(token: string, id: string) {
    return apiRequest<{ order: OrderSummary }>(`orders/${id}`, { method: "GET", token });
  },
  track(token: string, id: string) {
    return apiRequest<{ tracking: OrderSummary }>(`orders/${id}/track`, { method: "GET", token });
  },
  retryPayment(token: string, orderId: string) {
    return apiRequest<{ payment: { id: string; clientSecret: string | null; status: string } }>(
      `orders/${orderId}/retry-payment`,
      { method: "POST", token },
    );
  },
  cancel(token: string, orderId: string) {
    return apiRequest(`orders/${orderId}/cancel`, { method: "POST", token });
  },
  requestReturn(token: string, orderId: string, reason: string) {
    return apiRequest(`orders/${orderId}/return`, { method: "POST", token, body: { reason } });
  },
  requestRefund(token: string, orderId: string, reason: string) {
    return apiRequest(`orders/${orderId}/refund-request`, { method: "POST", token, body: { reason } });
  },
  reorder(token: string, orderId: string) {
    return apiRequest<{ message: string }>(`orders/${orderId}/reorder`, { method: "POST", token });
  },
  getInvoice(token: string, orderId: string) {
    return apiRequest<{ invoice: Record<string, unknown>; receipt: Record<string, unknown> }>(`orders/${orderId}/invoice`, {
      method: "GET",
      token,
    });
  },
  review(token: string, orderId: string, itemId: string, body: { rating: number; title?: string; body: string }) {
    return apiRequest(`orders/${orderId}/items/${itemId}/review`, { method: "POST", token, body });
  },
};
