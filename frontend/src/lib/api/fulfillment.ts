import { apiRequest } from "@/lib/api/client";
import type { FulfillmentAnalytics, InvoicePayload, OrderDetail, OrderTracking, ShippingCatalog } from "@/types/fulfillment";
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

export const fulfillmentApi = {
  shippingCatalog() {
    return apiRequest<ShippingCatalog>("fulfillment/shipping", { method: "GET" });
  },

  listOrders(token: string, params?: OrderListQuery) {
    return apiRequest<{ orders: OrderSummary[]; total: number; page: number; limit: number; hasMore: boolean }>(
      `fulfillment/orders${toQuery(params)}`,
      { method: "GET", token },
    );
  },

  trackOrder(token: string, orderId: string) {
    return apiRequest<{ tracking: OrderTracking }>(`fulfillment/orders/${orderId}/track`, { method: "GET", token });
  },

  getInvoice(token: string, orderId: string) {
    return apiRequest<{ invoice: InvoicePayload; receipt: Record<string, unknown> }>(`fulfillment/orders/${orderId}/invoice`, {
      method: "GET",
      token,
    });
  },

  requestRefund(token: string, orderId: string, reason: string) {
    return apiRequest(`fulfillment/orders/${orderId}/refund-request`, { method: "POST", token, body: { reason } });
  },

  confirmPayment(paymentIntentId: string, token?: string | null) {
    return apiRequest("fulfillment/payments/confirm", { method: "POST", token, body: { paymentIntentId } });
  },
};

export const fulfillmentAdminApi = {
  listOrders(token: string, params?: OrderListQuery) {
    return apiRequest<{ orders: OrderDetail[]; total: number; page: number; limit: number }>(
      `admin/fulfillment/orders${toQuery(params)}`,
      { method: "GET", token },
    );
  },

  getOrder(token: string, id: string) {
    return apiRequest<{ order: OrderDetail }>(`admin/fulfillment/orders/${id}`, { method: "GET", token });
  },

  updateStatus(token: string, id: string, status: string, note?: string) {
    return apiRequest(`admin/fulfillment/orders/${id}/status`, { method: "PATCH", token, body: { status, note } });
  },

  addNote(token: string, id: string, note: string) {
    return apiRequest(`admin/fulfillment/orders/${id}/notes`, { method: "POST", token, body: { note } });
  },

  refund(token: string, id: string, body?: { amount?: number; reason?: string }) {
    return apiRequest(`admin/fulfillment/orders/${id}/refund`, { method: "POST", token, body: body ?? {} });
  },

  listPayments(token: string, params?: OrderListQuery) {
    return apiRequest<{ payments: Array<Record<string, unknown>>; total: number }>(
      `admin/fulfillment/payments${toQuery(params)}`,
      { method: "GET", token },
    );
  },

  listShipments(token: string, params?: OrderListQuery) {
    return apiRequest<{ shipments: Array<Record<string, unknown>>; total: number }>(
      `admin/fulfillment/shipments${toQuery(params)}`,
      { method: "GET", token },
    );
  },

  updateShipment(token: string, id: string, body: { trackingNumber?: string; status?: string; message?: string }) {
    return apiRequest(`admin/fulfillment/shipments/${id}`, { method: "PATCH", token, body });
  },

  analytics(token: string, days = 30) {
    return apiRequest<FulfillmentAnalytics>(`admin/fulfillment/analytics?days=${days}`, { method: "GET", token });
  },
};
