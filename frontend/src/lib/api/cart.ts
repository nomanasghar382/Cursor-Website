import { apiRequest } from "@/lib/api/client";
import type { CartView, GuestCartItem } from "@/types/commerce";

export const cartApi = {
  get(token: string) {
    return apiRequest<{ cart: CartView }>("cart", { method: "GET", token });
  },
  addItem(token: string, variantId: string, quantity = 1) {
    return apiRequest<{ cart: CartView }>("cart/items", { method: "POST", token, body: { variantId, quantity } });
  },
  updateItem(token: string, variantId: string, quantity: number) {
    return apiRequest<{ cart: CartView }>(`cart/items/${variantId}`, { method: "PATCH", token, body: { quantity } });
  },
  removeItem(token: string, variantId: string) {
    return apiRequest<{ cart: CartView }>(`cart/items/${variantId}`, { method: "DELETE", token });
  },
  sync(token: string, items: GuestCartItem[]) {
    return apiRequest<{ cart: CartView }>("cart/sync", { method: "POST", token, body: { items } });
  },
  saveForLater(token: string, variantId: string) {
    return apiRequest<{ cart: CartView }>("cart/save-for-later", { method: "POST", token, body: { variantId } });
  },
  moveSavedToCart(token: string, variantId: string) {
    return apiRequest<{ cart: CartView }>(`cart/saved/${variantId}/move-to-cart`, { method: "POST", token });
  },
  clear(token: string) {
    return apiRequest<{ cart: CartView }>("cart", { method: "DELETE", token });
  },
};
