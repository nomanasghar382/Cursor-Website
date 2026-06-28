"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { SectionHeading } from "@/components/home/section-heading";
import { Reveal } from "@/components/motion/reveal";

const testimonials = [
  {
    quote:
      "NOVAEX feels less like a storefront and more like a product studio. Our conversion rate jumped 34% in the first quarter.",
    name: "Elena Marchetti",
    role: "Chief Digital Officer, Arcadia Robotics",
    rating: 5,
  },
  {
    quote:
      "The AI assistant understands enterprise procurement better than any marketplace we have used. Approvals and trust are built in.",
    name: "Marcus Chen",
    role: "VP Operations, Northwind Labs",
    rating: 5,
  },
  {
    quote:
      "From discovery to delivery, the experience is cinematic. Our team replaced three legacy tools with one NOVAEX deployment.",
    name: "Sofia Alvarez",
    role: "Head of Commerce, Helix Audio",
    rating: 5,
  },
];

const logos = ["Arcadia", "Northwind", "Helix", "Vertex", "Lumen", "Axiom"];

export function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 md:px-6">
      <Reveal>
        <SectionHeading
          eyebrow="Testimonials"
          title="Trusted by teams building the next generation of commerce"
          description="Operators, creators, and enterprise buyers rely on NOVAEX for premium experiences at scale."
          align="center"
        />
      </Reveal>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-6 opacity-70">
        {logos.map((logo) => (
          <div key={logo} className="rounded-full border border-border px-5 py-2 text-sm font-medium tracking-[0.18em] uppercase">
            {logo}
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <Reveal key={testimonial.name} delay={index * 0.08}>
            <motion.div whileHover={{ y: -6 }} className="glass-panel-strong h-full rounded-[1.75rem] p-6">
              <div className="mb-4 flex gap-1 text-amber-300">
                {Array.from({ length: testimonial.rating }).map((_, starIndex) => (
                  <Star key={starIndex} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-base leading-relaxed text-foreground/90">“{testimonial.quote}”</p>
              <div className="mt-6">
                <p className="font-medium">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
