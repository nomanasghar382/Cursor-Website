"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { NewsletterSignup } from "@/components/growth/newsletter-signup";
import { SectionHeading } from "@/components/home/section-heading";
import { Reveal } from "@/components/motion/reveal";

export function NewsletterSection() {
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
              <NewsletterSignup source="homepage" />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
