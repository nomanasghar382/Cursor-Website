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
import { registerSchema, type RegisterFormValues } from "@/features/auth/schemas";

export function RegisterForm() {
  const router = useRouter();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", phone: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await authApi.register(values);
      toast.success("Account created. Verify your email to activate access.");
      router.push("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create account.");
    }
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" autoComplete="given-name" {...form.register("firstName")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" autoComplete="family-name" {...form.register("lastName")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} />
      </div>
      <Button type="submit" variant="gradient" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Creating account..." : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
