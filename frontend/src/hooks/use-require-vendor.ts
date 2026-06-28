"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

const VENDOR_ROLES = new Set(["vendor-admin", "seller", "seller-admin", "super-admin"]);

export function useRequireVendor(redirectTo = "/vendor/login?next=/vendor") {
  const router = useRouter();
  const token = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const hasVendorRole = user?.roles?.some((role) => VENDOR_ROLES.has(role)) ?? false;

  useEffect(() => {
    if (!hydrated) return;
    if (!token || !hasVendorRole) router.push(redirectTo);
  }, [hydrated, token, hasVendorRole, router, redirectTo]);

  return { token, user, hydrated, ready: hydrated && Boolean(token) && hasVendorRole };
}
