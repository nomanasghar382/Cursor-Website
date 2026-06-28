"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useCommerceStore } from "@/stores/commerce-store";

type HomeStore = {
  wishlist: string[];
  cart: Record<string, number>;
  compareList: string[];
  toggleWishlist: (productId: string) => void;
  addToCart: (productId: string, quantity?: number) => void;
  toggleCompare: (productId: string) => void;
  cartCount: () => number;
};

export const useHomeStore = create<HomeStore>()(
  persist(
    (set, get) => ({
      wishlist: [],
      cart: {},
      compareList: [],
      toggleWishlist: (productId) => {
        void useCommerceStore.getState().toggleWishlist({ productId });
        const lists = useCommerceStore.getState().wishlists;
        const ids = lists.flatMap((list) => list.items.map((item) => item.productId));
        set({ wishlist: ids });
      },
      addToCart: (productId, quantity = 1) => {
        set((state) => ({
          cart: {
            ...state.cart,
            [productId]: (state.cart[productId] ?? 0) + quantity,
          },
        }));
      },
      toggleCompare: (productId) => {
        useCommerceStore.getState().toggleCompare(productId);
        set({ compareList: useCommerceStore.getState().compareList });
      },
      cartCount: () => useCommerceStore.getState().cartCount(),
    }),
    { name: "novaex-home-commerce" },
  ),
);
