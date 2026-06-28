"use client";

import { usePathname } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
});

type Values = z.infer<typeof schema>;

export function HomepageNewsletter() {
  const pathname = usePathname();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  if (pathname !== "/") return null;

  const onSubmit = form.handleSubmit(async (values) => {
    toast.success(`Subscribed ${values.email} to NOVAEX updates.`);
    form.reset();
  });

  return (
    <div className="glass-panel rounded-[1.75rem] p-6 md:p-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-primary">Stay in the loop</p>
          <h3 className="mt-2 font-display text-2xl font-semibold">Premium drops. Zero noise.</h3>
        </div>
        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
          <div className="relative flex-1">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="email" placeholder="you@company.com" className="pl-11" aria-label="Newsletter email" {...form.register("email")} />
          </div>
          <Button variant="gradient" type="submit">
            Join newsletter
          </Button>
        </form>
      </div>
    </div>
  );
}
