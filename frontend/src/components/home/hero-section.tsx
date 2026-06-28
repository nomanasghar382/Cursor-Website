"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown, Mic, Sparkles } from "lucide-react";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { Badge } from "@/components/ui/badge";
import type { ProductCard } from "@/types/catalog";
import { formatCurrency } from "@/lib/utils";
import { TiltCard } from "@/components/home/tilt-card";

const CinematicHeroScene = dynamic(
  () => import("@/components/home/cinematic-hero-scene").then((mod) => mod.CinematicHeroScene),
  { ssr: false },
);

export function HeroSection({ featuredProducts }: { featuredProducts: ProductCard[] }) {
  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <Suspense fallback={<div className="absolute inset-0 bg-background" />}>
        <CinematicHeroScene />
      </Suspense>

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-4 pb-24 pt-28 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            <Badge variant="accent" className="px-4 py-1.5 text-sm">
              NovaAI Commerce · Spring 2026 Collection
            </Badge>
            <div className="space-y-5">
              <h1 className="font-display text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl xl:text-8xl">
                The future of shopping is{" "}
                <span className="text-gradient">intelligent</span>, immersive, and instant.
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
                NOVAEX fuses cinematic discovery, adaptive AI recommendations, and enterprise-grade trust into one
                premium commerce experience.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <MagneticButton variant="gradient" size="lg" asChild>
                <Link href="/products">Shop the collection</Link>
              </MagneticButton>
              <MagneticButton variant="glass" size="lg" asChild>
                <Link href="/ai">
                  <Sparkles className="h-4 w-4" />
                  Ask NovaAI
                </Link>
              </MagneticButton>
            </div>
            <div className="inline-flex items-center gap-3 rounded-full border border-border/80 bg-background/50 px-4 py-2 text-sm text-muted-foreground backdrop-blur-xl">
              <Mic className="h-4 w-4 text-primary" />
              Voice, image, and intent-based shopping — available now
            </div>
          </motion.div>

          <div className="relative hidden lg:block">
            <div className="absolute -left-8 top-8 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            <div className="space-y-4">
              {featuredProducts.slice(0, 3).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.12, duration: 0.7 }}
                  className={index === 1 ? "ml-10" : index === 2 ? "ml-4" : ""}
                >
                  <TiltCard className="glass-panel-strong rounded-[1.75rem] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{product.category}</p>
                        <p className="font-display text-xl font-semibold">{product.name}</p>
                        <p className="mt-1 text-sm text-primary">{product.aiMatch}% AI match</p>
                      </div>
                      <p className="font-display text-2xl font-semibold">{formatCurrency(product.price)}</p>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="text-xs uppercase tracking-[0.24em]">Scroll to explore</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
            <ArrowDown className="h-5 w-5" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
