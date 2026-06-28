"use client";

import { MessageCircleQuestion } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { ProductDetail } from "@/types/catalog";

export function ProductQa({ product }: { product: ProductDetail }) {
  if (product.questions.length === 0) return null;

  return (
    <section className="rounded-[1.5rem] border border-border/60 p-6" aria-labelledby="qa-heading">
      <div className="mb-4 flex items-center gap-2">
        <MessageCircleQuestion className="h-5 w-5 text-primary" />
        <h2 id="qa-heading" className="font-display text-2xl font-semibold">
          Questions & answers
        </h2>
      </div>
      <Accordion type="single" collapsible>
        {product.questions.map((entry) => (
          <AccordionItem key={entry.id} value={entry.id}>
            <AccordionTrigger>{entry.question}</AccordionTrigger>
            <AccordionContent className="space-y-2 text-sm text-muted-foreground">
              <p>{entry.answer ?? "Our product specialists are preparing an answer."}</p>
              <p className="text-xs">
                Asked by {entry.author} · {new Date(entry.createdAt).toLocaleDateString()}
              </p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
