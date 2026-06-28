"use client";

import { create } from "zustand";

type AiState = {
  widgetOpen: boolean;
  sessionId: string | null;
  setWidgetOpen: (open: boolean) => void;
  toggleWidget: () => void;
  setSessionId: (sessionId: string | null) => void;
};

export const useAiStore = create<AiState>((set) => ({
  widgetOpen: false,
  sessionId: null,
  setWidgetOpen: (open) => set({ widgetOpen: open }),
  toggleWidget: () => set((state) => ({ widgetOpen: !state.widgetOpen })),
  setSessionId: (sessionId) => set({ sessionId }),
}));
