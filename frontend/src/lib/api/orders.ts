import { apiRequest } from "@/lib/api/client";
import type { OrderSummary } from "@/types/commerce";

export const ordersApi = {
  list(token: string) {
    return apiRequest<{ orders: OrderSummary[] }>("orders", { method: "GET", token });
  },
  getById(token: string, id: string) {
    return apiRequest<{ order: OrderSummary }>(`orders/${id}`, { method: "GET", token });
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
  reorder(token: string, orderId: string) {
    return apiRequest<{ message: string }>(`orders/${orderId}/reorder`, { method: "POST", token });
  },
  getInvoice(token: string, orderId: string) {
    return apiRequest<{ invoice: Record<string, unknown> }>(`orders/${orderId}/invoice`, { method: "GET", token });
  },
  review(token: string, orderId: string, itemId: string, body: { rating: number; title?: string; body: string }) {
    return apiRequest(`orders/${orderId}/items/${itemId}/review`, { method: "POST", token, body });
  },
};
