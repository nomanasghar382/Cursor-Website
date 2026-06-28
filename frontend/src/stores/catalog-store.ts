"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CatalogViewMode } from "@/types/catalog";

type CatalogStore = {
  viewMode: CatalogViewMode;
  recentSearches: string[];
  recentlyViewed: string[];
  popularSearches: string[];
  setViewMode: (mode: CatalogViewMode) => void;
  addRecentSearch: (query: string) => void;
  addRecentlyViewed: (productId: string) => void;
  clearRecentSearches: () => void;
};

const defaultPopular = [
  "robotics assistant",
  "immersive audio",
  "smart home hub",
  "wearable fitness",
  "limited edition",
];

export const useCatalogStore = create<CatalogStore>()(
  persist(
    (set) => ({
      viewMode: "grid",
      recentSearches: [],
      recentlyViewed: [],
      popularSearches: defaultPopular,
      setViewMode: (mode) => set({ viewMode: mode }),
      addRecentSearch: (query) =>
        set((state) => {
          const trimmed = query.trim();
          if (!trimmed) return state;
          const next = [trimmed, ...state.recentSearches.filter((entry) => entry !== trimmed)].slice(0, 8);
          return { recentSearches: next };
        }),
      addRecentlyViewed: (productId) =>
        set((state) => ({
          recentlyViewed: [productId, ...state.recentlyViewed.filter((id) => id !== productId)].slice(0, 12),
        })),
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    { name: "novaex-catalog" },
  ),
);
