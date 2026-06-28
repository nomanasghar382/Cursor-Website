"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2, Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AiRecommendationCarousel } from "@/components/ai/ai-recommendation-carousel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { aiApi } from "@/lib/api/ai";
import { cn } from "@/lib/utils";
import { useAiStore } from "@/stores/ai-store";
import { useAuthStore } from "@/stores/auth-store";
import type { AiChatMessage } from "@/types/ai";
import type { ProductCard } from "@/types/catalog";

export function AiChatInterface({ compact = false }: { compact?: boolean }) {
  const token = useAuthStore((state) => state.accessToken);
  const sessionId = useAiStore((state) => state.sessionId);
  const setSessionId = useAiStore((state) => state.setSessionId);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      role: "ASSISTANT",
      message: "Hi — I can search products, compare picks, recommend items, and guide your order journey.",
    },
  ]);
  const [lastProducts, setLastProducts] = useState<ProductCard[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const chatMutation = useMutation({
    mutationFn: (message: string) => aiApi.chat({ message, sessionId: sessionId ?? undefined }, token),
    onSuccess: (response) => {
      if (response.sessionId) setSessionId(response.sessionId);
      setMessages((current) => [
        ...current,
        { role: "ASSISTANT", message: response.message },
      ]);
      setLastProducts(response.products);
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatMutation.isPending]);

  return (
    <div className={cn("flex h-full flex-col", compact ? "gap-3" : "gap-4")}>
      <div className={cn("flex-1 space-y-3 overflow-y-auto pr-1", compact ? "max-h-72" : "max-h-[28rem]")}>
        {messages.map((entry, index) => (
          <div
            key={`${entry.role}-${index}`}
            className={cn(
              "rounded-2xl px-4 py-3 text-sm leading-relaxed",
              entry.role === "USER" ? "ml-8 bg-primary text-primary-foreground" : "mr-8 border border-border/60 bg-background/80",
            )}
          >
            {entry.message}
          </div>
        ))}
        {chatMutation.isPending ? (
          <div className="mr-8 flex items-center gap-2 rounded-2xl border border-border/60 px-4 py-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Thinking...
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      {lastProducts.length > 0 ? (
        <AiRecommendationCarousel title="Suggested products" products={lastProducts} compact />
      ) : null}

      <form
        className="flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const message = input.trim();
          if (!message || chatMutation.isPending) return;
          setMessages((current) => [...current, { role: "USER", message }]);
          setInput("");
          chatMutation.mutate(message);
        }}
      >
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about products, compare items, or get guidance..."
          aria-label="AI assistant message"
        />
        <Button type="submit" size="icon" disabled={chatMutation.isPending || !input.trim()} aria-label="Send message">
          {chatMutation.isPending ? <Loader2 className="animate-spin" /> : <Send />}
        </Button>
      </form>

      {chatMutation.isError ? (
        <p className="text-sm text-destructive">Unable to reach the AI assistant. Please try again.</p>
      ) : null}
    </div>
  );
}

export function AiChatHeader() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <Sparkles className="h-5 w-5" />
      </div>
      <div>
        <p className="font-medium">NOVAEX Assistant</p>
        <p className="text-xs text-muted-foreground">Semantic search · recommendations · order help</p>
      </div>
    </div>
  );
}
