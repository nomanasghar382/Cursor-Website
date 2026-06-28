"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Truck } from "lucide-react";

const announcements = [
  {
    id: "shipping",
    icon: Truck,
    text: "Complimentary express shipping on orders over $499 — delivered in 48 hours.",
  },
  {
    id: "ai",
    icon: Sparkles,
    text: "NovaAI Shopping Assistant is live — personalized picks with 97% match confidence.",
  },
  {
    id: "enterprise",
    icon: Sparkles,
    text: "Enterprise vendors now receive dedicated AI merchandising and fulfillment insights.",
  },
];

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % announcements.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const current = announcements[index];
  const Icon = current.icon;

  return (
    <div className="relative overflow-hidden border-b border-primary/20 bg-primary/10">
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-center px-4 text-center text-xs font-medium text-primary md:text-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-2"
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{current.text}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
