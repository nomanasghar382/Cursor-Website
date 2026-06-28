"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

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
      toggleWishlist: (productId) =>
        set((state) => ({
          wishlist: state.wishlist.includes(productId)
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId],
        })),
      addToCart: (productId, quantity = 1) =>
        set((state) => ({
          cart: {
            ...state.cart,
            [productId]: (state.cart[productId] ?? 0) + quantity,
          },
        })),
      toggleCompare: (productId) =>
        set((state) => ({
          compareList: state.compareList.includes(productId)
            ? state.compareList.filter((id) => id !== productId)
            : [...state.compareList, productId].slice(-3),
        })),
      cartCount: () => Object.values(get().cart).reduce((sum, qty) => sum + qty, 0),
    }),
    { name: "novaex-home-commerce" },
  ),
);
