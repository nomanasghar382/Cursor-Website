"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { growthApi } from "@/lib/api/growth";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
});

type Values = z.infer<typeof schema>;

export function NewsletterSignup({
  source = "website",
  compact = false,
}: {
  source?: string;
  compact?: boolean;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await growthApi.subscribeNewsletter(values.email, source);
      toast.success("You're subscribed to NOVAEX updates.");
      form.reset();
    } catch {
      toast.error("Unable to subscribe right now. Please try again.");
    }
  });

  return (
    <form className={compact ? "flex flex-col gap-3 sm:flex-row" : "space-y-3"} onSubmit={onSubmit}>
      <div className="relative flex-1">
        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input type="email" placeholder="you@company.com" className="pl-11" aria-label="Newsletter email" {...form.register("email")} />
      </div>
      <Button variant="gradient" type="submit" disabled={form.formState.isSubmitting}>
        Subscribe
      </Button>
      {form.formState.errors.email ? <p className="text-sm text-destructive">{form.formState.errors.email.message}</p> : null}
    </form>
  );
}
