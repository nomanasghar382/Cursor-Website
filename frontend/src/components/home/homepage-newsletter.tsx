"use client";

import { usePathname } from "next/navigation";
import { NewsletterSignup } from "@/components/growth/newsletter-signup";

export function HomepageNewsletter() {
  const pathname = usePathname();

  if (pathname !== "/") return null;

  return (
    <div className="glass-panel rounded-[1.75rem] p-6 md:p-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-primary">Stay in the loop</p>
          <h3 className="mt-2 font-display text-2xl font-semibold">Premium drops. Zero noise.</h3>
        </div>
        <NewsletterSignup source="homepage-banner" compact />
      </div>
    </div>
  );
}
