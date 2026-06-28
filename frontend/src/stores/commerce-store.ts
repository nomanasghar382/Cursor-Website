"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartApi } from "@/lib/api/cart";
import { wishlistApi } from "@/lib/api/wishlist";
import type { CartView, GuestCartItem, WishlistView } from "@/types/commerce";

type RemovedCartItem = CartView["items"][number] & { removedAt: number };

type CommerceStore = {
  guestCart: GuestCartItem[];
  cart: CartView | null;
  wishlists: WishlistView[];
  wishlistNotes: Record<string, string>;
  compareList: string[];
  recentlyRemoved: RemovedCartItem | null;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  hydrateCart: (token: string) => Promise<void>;
  syncGuestCart: (token: string) => Promise<void>;
  addToCart: (input: { token?: string | null; variantId: string; productId: string; quantity?: number }) => Promise<void>;
  updateCartQuantity: (token: string | null, variantId: string, quantity: number) => Promise<void>;
  removeFromCart: (token: string | null, variantId: string) => Promise<void>;
  undoRemove: (token: string | null) => Promise<void>;
  saveForLater: (token: string, variantId: string) => Promise<void>;
  moveSavedToCart: (token: string, variantId: string) => Promise<void>;
  hydrateWishlists: (token: string) => Promise<void>;
  toggleWishlist: (input: { token?: string | null; productId: string; variantId?: string }) => Promise<void>;
  setWishlistNote: (itemId: string, note: string) => void;
  toggleCompare: (productId: string) => void;
  cartCount: () => number;
};

export const useCommerceStore = create<CommerceStore>()(
  persist(
    (set, get) => ({
      guestCart: [],
      cart: null,
      wishlists: [],
      wishlistNotes: {},
      compareList: [],
      recentlyRemoved: null,
      drawerOpen: false,
      setDrawerOpen: (open) => set({ drawerOpen: open }),
      cartCount: () => {
        const cart = get().cart;
        if (cart) return cart.itemCount;
        return get().guestCart.reduce((sum, item) => sum + item.quantity, 0);
      },
      hydrateCart: async (token) => {
        const { cart } = await cartApi.get(token);
        set({ cart });
      },
      syncGuestCart: async (token) => {
        const guestItems = get().guestCart;
        if (guestItems.length === 0) {
          await get().hydrateCart(token);
          return;
        }
        const { cart } = await cartApi.sync(token, guestItems);
        set({ cart, guestCart: [] });
      },
      addToCart: async ({ token, variantId, productId, quantity = 1 }) => {
        if (token) {
          const { cart } = await cartApi.addItem(token, variantId, quantity);
          set({ cart, drawerOpen: true });
          return;
        }
        set((state) => {
          const existing = state.guestCart.find((item) => item.variantId === variantId);
          const guestCart = existing
            ? state.guestCart.map((item) =>
                item.variantId === variantId ? { ...item, quantity: item.quantity + quantity } : item,
              )
            : [...state.guestCart, { variantId, productId, quantity }];
          return { guestCart, drawerOpen: true };
        });
      },
      updateCartQuantity: async (token, variantId, quantity) => {
        if (token) {
          const { cart } = await cartApi.updateItem(token, variantId, quantity);
          set({ cart });
          return;
        }
        set((state) => ({
          guestCart: state.guestCart.map((item) => (item.variantId === variantId ? { ...item, quantity } : item)),
        }));
      },
      removeFromCart: async (token, variantId) => {
        if (token) {
          const current = get().cart?.items.find((item) => item.variantId === variantId);
          const { cart } = await cartApi.removeItem(token, variantId);
          set({
            cart,
            recentlyRemoved: current ? { ...current, removedAt: Date.now() } : null,
          });
          return;
        }
        set((state) => ({
          guestCart: state.guestCart.filter((item) => item.variantId !== variantId),
        }));
      },
      undoRemove: async (token) => {
        const removed = get().recentlyRemoved;
        if (!removed) return;
        await get().addToCart({
          token,
          variantId: removed.variantId,
          productId: removed.productId,
          quantity: removed.quantity,
        });
        set({ recentlyRemoved: null });
      },
      saveForLater: async (token, variantId) => {
        const { cart } = await cartApi.saveForLater(token, variantId);
        set({ cart });
      },
      moveSavedToCart: async (token, variantId) => {
        const { cart } = await cartApi.moveSavedToCart(token, variantId);
        set({ cart });
      },
      hydrateWishlists: async (token) => {
        const { wishlists } = await wishlistApi.list(token);
        set({ wishlists });
      },
      toggleWishlist: async ({ token, productId, variantId }) => {
        if (token) {
          const existing = get().wishlists.flatMap((list) => list.items).find((item) => item.productId === productId);
          if (existing) {
            const { wishlist } = await wishlistApi.removeItem(token, existing.id);
            set((state) => ({
              wishlists: state.wishlists.map((entry) => (entry.id === wishlist.id ? wishlist : entry)),
            }));
          } else {
            const { wishlist } = await wishlistApi.addItem(token, { productId, variantId });
            set((state) => ({
              wishlists: state.wishlists.some((entry) => entry.id === wishlist.id)
                ? state.wishlists.map((entry) => (entry.id === wishlist.id ? wishlist : entry))
                : [wishlist, ...state.wishlists],
            }));
          }
          return;
        }
        set((state) => {
          const inGuest = state.wishlists[0]?.items.some((item) => item.productId === productId);
          if (inGuest) {
            return {
              wishlists: state.wishlists.map((list, index) =>
                index === 0
                  ? { ...list, items: list.items.filter((item) => item.productId !== productId), itemCount: list.itemCount - 1 }
                  : list,
              ),
            };
          }
          const guestList = state.wishlists[0] ?? {
            id: "guest",
            name: "Saved items",
            isDefault: true,
            itemCount: 0,
            analytics: { views: 0, shares: 0 },
            items: [],
          };
          return {
            wishlists: [
              {
                ...guestList,
                items: [
                  {
                    id: `guest-${productId}`,
                    productId,
                    variantId,
                    name: "Saved product",
                    slug: productId,
                    category: "Catalog",
                    price: 0,
                    stock: 1,
                    inStock: true,
                    priceDropAlert: true,
                    backInStockAlert: true,
                    gradient: "from-slate-300 via-slate-500 to-slate-700",
                  },
                  ...guestList.items,
                ],
                itemCount: guestList.itemCount + 1,
              },
              ...state.wishlists.slice(1),
            ],
          };
        });
      },
      setWishlistNote: (itemId, note) =>
        set((state) => ({
          wishlistNotes: { ...state.wishlistNotes, [itemId]: note },
        })),
      toggleCompare: (productId) =>
        set((state) => ({
          compareList: state.compareList.includes(productId)
            ? state.compareList.filter((id) => id !== productId)
            : [...state.compareList, productId].slice(-3),
        })),
    }),
    {
      name: "novaex-commerce",
      partialize: (state) => ({
        guestCart: state.guestCart,
        wishlistNotes: state.wishlistNotes,
        compareList: state.compareList,
      }),
    },
  ),
);
