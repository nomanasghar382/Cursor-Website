"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

export function AnimatedBackground() {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return <div className="pointer-events-none absolute inset-0 grid-overlay opacity-30" aria-hidden />;
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 grid-overlay opacity-30" />
      <motion.div
        className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 24, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-16 top-40 h-80 w-80 rounded-full bg-accent/20 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
