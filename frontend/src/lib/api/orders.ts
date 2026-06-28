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
};
