"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useCommerceStore } from "@/stores/commerce-store";

export function CommerceBootstrap() {
  const token = useAuthStore((state) => state.accessToken);
  const hydrated = useAuthStore((state) => state.hydrated);
  const syncGuestCart = useCommerceStore((state) => state.syncGuestCart);
  const hydrateWishlists = useCommerceStore((state) => state.hydrateWishlists);

  useEffect(() => {
    if (!hydrated || !token) return;
    void syncGuestCart(token);
    void hydrateWishlists(token);
  }, [hydrated, token, syncGuestCart, hydrateWishlists]);

  return null;
}
