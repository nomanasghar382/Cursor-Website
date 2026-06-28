"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/home/section-heading";
import { Reveal } from "@/components/motion/reveal";

const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

type NewsletterValues = z.infer<typeof newsletterSchema>;

export function NewsletterSection() {
  const form = useForm<NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    toast.success(`You're on the list, ${values.email}.`);
    form.reset();
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 md:px-6">
      <Reveal>
        <div className="glass-panel-strong relative overflow-hidden rounded-[2rem] p-8 md:p-12">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-12 left-10 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Newsletter"
                title="Stay ahead of the next wave in AI commerce"
                description="Product launches, collection drops, and enterprise insights — curated weekly."
              />
            </div>
            <div className="space-y-6">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto flex h-28 w-28 items-center justify-center rounded-[2rem] border border-primary/20 bg-primary/10 text-primary lg:mx-0"
              >
                <Sparkles className="h-10 w-10" />
              </motion.div>
              <form className="flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
                <div className="relative flex-1">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    className="pl-11"
                    aria-label="Email address"
                    {...form.register("email")}
                  />
                </div>
                <Button variant="gradient" type="submit" disabled={form.formState.isSubmitting}>
                  Subscribe
                </Button>
              </form>
              {form.formState.errors.email ? (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              ) : null}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
