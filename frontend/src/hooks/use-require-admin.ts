"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

const ADMIN_ROLES = new Set(["super-admin", "admin", "vendor-admin"]);

export function useRequireAdmin(redirectTo = "/admin/login?next=/admin") {
  const router = useRouter();
  const token = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const hasAdminRole = user?.roles?.some((role) => ADMIN_ROLES.has(role)) ?? false;

  useEffect(() => {
    if (!hydrated) return;
    if (!token || !hasAdminRole) router.push(redirectTo);
  }, [hydrated, token, hasAdminRole, router, redirectTo]);

  return { token, user, hydrated, ready: hydrated && Boolean(token) && hasAdminRole };
}

export function hasAdminAccess(user: { roles?: string[] } | null) {
  return user?.roles?.some((role) => ADMIN_ROLES.has(role)) ?? false;
}
