"use client";

import { Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  return (
    <form
      className="flex w-full items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        router.push(`/products?search=${encodeURIComponent(query)}`);
      }}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search robotics, audio, smart home..."
          className="pl-11"
          aria-label="Search products"
        />
      </div>
      <Button type="submit">Search</Button>
    </form>
  );
}

export function AiSearchBox({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState(defaultValue);

  return (
    <div className="glass-panel-strong rounded-[2rem] p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-primary">
        <Sparkles className="h-4 w-4" />
        AI product intelligence
      </div>
      <form
        className="flex flex-col gap-3 md:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          router.push(`/ai?q=${encodeURIComponent(prompt)}`);
        }}
      >
        <Input
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Describe what you are shopping for..."
          aria-label="AI shopping prompt"
        />
        <Button variant="gradient" type="submit">
          Open AI Studio
        </Button>
      </form>
    </div>
  );
}
