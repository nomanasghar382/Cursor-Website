"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Camera, Mic, Send, Sparkles } from "lucide-react";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/home/section-heading";
import { Reveal } from "@/components/motion/reveal";
import type { ProductCard } from "@/types/catalog";
import { formatCurrency } from "@/lib/utils";

const previewMessages = [
  { role: "user", text: "I need a premium home office upgrade under $2,000." },
  {
    role: "assistant",
    text: "I found 3 high-confidence matches with immersive audio and ambient lighting bundles.",
  },
];

export function AiAssistantSection({ recommendations }: { recommendations: ProductCard[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 md:px-6">
      <Reveal>
        <SectionHeading
          eyebrow="NovaAI Assistant"
          title="A shopping concierge that understands intent"
          description="Voice, image, and natural language search converge into one premium assistant built for high-consideration purchases."
        />
      </Reveal>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal className="glass-panel-strong rounded-[2rem] p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/15 p-3 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-xl font-semibold">NovaAI Concierge</p>
                <p className="text-sm text-muted-foreground">Live · Personalized for your session</p>
              </div>
            </div>
            <Badge variant="success">97% confidence</Badge>
          </div>

          <div className="space-y-4 rounded-[1.5rem] border border-border/70 bg-background/50 p-4">
            {previewMessages.map((message) => (
              <motion.div
                key={message.text}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={message.role === "user" ? "ml-auto max-w-[85%] rounded-2xl bg-secondary px-4 py-3 text-sm" : "max-w-[90%] rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm"}
              >
                {message.text}
              </motion.div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <Input placeholder="Ask NovaAI anything about products, bundles, or delivery..." aria-label="AI assistant prompt" />
            <div className="flex gap-2">
              <Button variant="glass" size="icon" aria-label="Voice search">
                <Mic className="h-4 w-4" />
              </Button>
              <Button variant="glass" size="icon" aria-label="Image search">
                <Camera className="h-4 w-4" />
              </Button>
              <MagneticButton variant="gradient" asChild>
                <Link href="/ai">
                  <Send className="h-4 w-4" />
                  Launch
                </Link>
              </MagneticButton>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">Smart recommendations</p>
          {recommendations.map((product) => (
            <div key={product.id} className="glass-panel rounded-[1.5rem] p-5 transition-transform hover:-translate-y-1">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-semibold">{formatCurrency(product.price)}</p>
                  <p className="text-xs text-primary">{product.aiMatch}% match</p>
                </div>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
