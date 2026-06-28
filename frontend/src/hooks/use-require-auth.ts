"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export function useRequireAuth(redirectTo = "/login?next=/account") {
  const router = useRouter();
  const token = useAuthStore((state) => state.accessToken);
  const hydrated = useAuthStore((state) => state.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) router.push(redirectTo);
  }, [hydrated, token, router, redirectTo]);

  return { token, hydrated, ready: hydrated && Boolean(token) };
}
