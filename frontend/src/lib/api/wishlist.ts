import { apiRequest } from "@/lib/api/client";
import type { WishlistView } from "@/types/commerce";

export const wishlistApi = {
  list(token: string) {
    return apiRequest<{ wishlists: WishlistView[] }>("wishlists", { method: "GET", token });
  },
  create(token: string, name: string) {
    return apiRequest<{ wishlist: WishlistView }>("wishlists", { method: "POST", token, body: { name } });
  },
  addItem(token: string, payload: { productId: string; variantId?: string; wishlistId?: string; note?: string }) {
    return apiRequest<{ wishlist: WishlistView }>("wishlists/items", { method: "POST", token, body: payload });
  },
  removeItem(token: string, itemId: string) {
    return apiRequest<{ wishlist: WishlistView }>(`wishlists/items/${itemId}`, { method: "DELETE", token });
  },
  share(token: string, wishlistId: string) {
    return apiRequest<{ shareUrl: string; token: string }>(`wishlists/${wishlistId}/share`, { method: "POST", token });
  },
  getShared(token: string) {
    return apiRequest<{ wishlist: WishlistView }>(`wishlists/shared/${token}`, { method: "GET" });
  },
};
