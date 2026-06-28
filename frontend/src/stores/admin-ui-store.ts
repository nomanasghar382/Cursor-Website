"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type AdminUiState = {
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
};

export const useAdminUiStore = create<AdminUiState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
    }),
    { name: "novaex-admin-ui", partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }) },
  ),
);
