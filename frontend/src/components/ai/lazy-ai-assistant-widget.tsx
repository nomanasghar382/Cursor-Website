"use client";

import dynamic from "next/dynamic";

export const LazyAiAssistantWidget = dynamic(
  () => import("@/components/ai/ai-assistant-widget").then((mod) => mod.AiAssistantWidget),
  { ssr: false },
);
