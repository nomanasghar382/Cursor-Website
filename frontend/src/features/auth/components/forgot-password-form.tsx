"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export function ForgotPasswordForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await authApi.forgotPassword(values.email);
      toast.success(result.message);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
      </div>
      <Button type="submit" variant="gradient" className="w-full" disabled={form.formState.isSubmitting}>
        Send reset link
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
