"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas";
import { useAuthStore } from "@/stores/auth-store";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState("");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await authApi.login({
        ...values,
        ...(mfaRequired ? { mfaCode } : {}),
      });
      if (result.mfaRequired) {
        setMfaRequired(true);
        toast.message("Enter your authenticator code to continue.");
        return;
      }
      setSession({
        accessToken: result.accessToken,
        user: result.user,
      });
      toast.success("Welcome back to NOVAEX.");
      router.push(searchParams.get("next") ?? "/account");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" disabled={mfaRequired} {...form.register("email")} />
        {form.formState.errors.email ? <p className="text-sm text-destructive">{form.formState.errors.email.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="current-password" disabled={mfaRequired} {...form.register("password")} />
        {form.formState.errors.password ? (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        ) : null}
      </div>
      {mfaRequired ? (
        <div className="space-y-2">
          <Label htmlFor="mfaCode">Authenticator code</Label>
          <Input id="mfaCode" inputMode="numeric" value={mfaCode} onChange={(event) => setMfaCode(event.target.value)} />
        </div>
      ) : null}
      <div className="flex items-center justify-between text-sm">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" {...form.register("rememberMe")} disabled={mfaRequired} />
          Remember me
        </label>
        <Link href="/forgot-password" className="text-primary hover:underline">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" variant="gradient" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Signing in..." : mfaRequired ? "Verify & sign in" : "Sign in"}
      </Button>
    </form>
  );
}
