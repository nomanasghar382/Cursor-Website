"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { AiChatHeader, AiChatInterface } from "@/components/ai/ai-chat-interface";
import { Button } from "@/components/ui/button";
import { useAiStore } from "@/stores/ai-store";

export function AiAssistantWidget() {
  const widgetOpen = useAiStore((state) => state.widgetOpen);
  const setWidgetOpen = useAiStore((state) => state.setWidgetOpen);
  const toggleWidget = useAiStore((state) => state.toggleWidget);

  return (
    <>
      <Button
        variant="gradient"
        size="icon"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-[var(--shadow-glow)]"
        onClick={toggleWidget}
        aria-label={widgetOpen ? "Close AI assistant" : "Open AI assistant"}
      >
        {widgetOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </Button>

      <AnimatePresence>
        {widgetOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            className="fixed bottom-24 right-4 z-50 w-[min(100vw-2rem,24rem)] rounded-[2rem] border border-border/60 bg-background/95 p-5 shadow-2xl backdrop-blur-xl md:right-6"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <AiChatHeader />
              <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setWidgetOpen(false)} aria-label="Close panel">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <AiChatInterface compact />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
