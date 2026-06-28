"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api/auth";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas";
import { useAuthStore } from "@/stores/auth-store";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await authApi.adminLogin(values);
      if (result.mfaRequired) {
        toast.message("Multi-factor authentication required.");
        return;
      }
      setSession({ accessToken: result.accessToken, user: result.user });
      toast.success("Welcome to NOVAEX Admin.");
      router.push(searchParams.get("next") ?? "/admin");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in.");
    }
  });

  return (
    <form className="mx-auto w-full max-w-md space-y-5 rounded-[2rem] border border-border/60 bg-card/50 p-8" onSubmit={onSubmit}>
      <div className="space-y-2 text-center">
        <h1 className="font-display text-3xl font-semibold">Admin sign in</h1>
        <p className="text-sm text-muted-foreground">Secure access for super-admin and operations teams.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="admin-email">Email</Label>
        <Input id="admin-email" type="email" autoComplete="email" {...form.register("email")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="admin-password">Password</Label>
        <Input id="admin-password" type="password" autoComplete="current-password" {...form.register("password")} />
      </div>
      <Button variant="gradient" className="w-full" type="submit">
        Sign in to admin
      </Button>
    </form>
  );
}
