import { apiRequest } from "@/lib/api/client";
import type { CustomerAddress, CustomerPreferences, CustomerSettings, DashboardData } from "@/types/dashboard";

export const customerApi = {
  dashboard(token: string) {
    return apiRequest<DashboardData>("customer/dashboard", { method: "GET", token });
  },
  addresses(token: string) {
    return apiRequest<{ addresses: CustomerAddress[] }>("customer/addresses", { method: "GET", token });
  },
  createAddress(token: string, body: Omit<CustomerAddress, "id">) {
    return apiRequest("customer/addresses", { method: "POST", token, body });
  },
  updateAddress(token: string, id: string, body: Partial<CustomerAddress>) {
    return apiRequest(`customer/addresses/${id}`, { method: "PATCH", token, body });
  },
  deleteAddress(token: string, id: string) {
    return apiRequest(`customer/addresses/${id}`, { method: "DELETE", token });
  },
  setDefaultAddress(token: string, id: string) {
    return apiRequest(`customer/addresses/${id}/default`, { method: "POST", token });
  },
  notifications(token: string) {
    return apiRequest<{ notifications: DashboardData["notifications"]; unreadCount: number }>("customer/notifications", {
      method: "GET",
      token,
    });
  },
  markNotificationRead(token: string, id: string) {
    return apiRequest<{ notifications: DashboardData["notifications"]; unreadCount: number }>(
      `customer/notifications/${id}/read`,
      { method: "PATCH", token },
    );
  },
  preferences(token: string) {
    return apiRequest<{ preferences: CustomerPreferences }>("customer/preferences", { method: "GET", token });
  },
  updatePreferences(token: string, body: Partial<CustomerPreferences>) {
    return apiRequest<{ preferences: CustomerPreferences }>("customer/preferences", { method: "PATCH", token, body });
  },
  settings(token: string) {
    return apiRequest<{ settings: CustomerSettings }>("customer/settings", { method: "GET", token });
  },
  updateSettings(token: string, body: Partial<CustomerSettings>) {
    return apiRequest<{ settings: CustomerSettings }>("customer/settings", { method: "PATCH", token, body });
  },
  payments(token: string) {
    return apiRequest<{
      savedMethods: unknown[];
      architecture: string[];
      transactions: Array<{
        id: string;
        orderNumber: string;
        gateway: string;
        status: string;
        amount: number;
        createdAt: string;
      }>;
      invoices: Array<{ id: string; invoiceNumber: string; orderNumber: string; issuedAt?: string }>;
      billingHistory: Array<{ id: string; label: string; amount: number; status: string; date: string }>;
    }>("customer/payments", { method: "GET", token });
  },
  deleteAccount(token: string) {
    return apiRequest<{ deleted: boolean }>("customer/account", { method: "DELETE", token });
  },
};
