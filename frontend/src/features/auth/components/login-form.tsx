"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api/auth";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas";
import { useAuthStore } from "@/stores/auth-store";

export function LoginForm() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await authApi.login(values);
      if (result.mfaRequired) {
        toast.message("Multi-factor authentication required.");
        return;
      }
      setSession({
        accessToken: result.accessToken,
        user: result.user,
      });
      toast.success("Welcome back to NOVAEX.");
      router.push("/account");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in.");
    }
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
        {form.formState.errors.email ? <p className="text-sm text-destructive">{form.formState.errors.email.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
        {form.formState.errors.password ? (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        ) : null}
      </div>
      <div className="flex items-center justify-between text-sm">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" {...form.register("rememberMe")} />
          Remember me
        </label>
        <Link href="/forgot-password" className="text-primary hover:underline">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" variant="gradient" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
