"use client";

import { create } from "zustand";

type UiState = {
  commandPaletteOpen: boolean;
  mobileNavOpen: boolean;
  searchOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  commandPaletteOpen: false,
  mobileNavOpen: false,
  searchOpen: false,
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
}));
