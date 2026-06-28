import { buildMetadata } from "@/lib/seo";
import { AiStudioClient } from "@/components/ai/ai-studio-client";

export const metadata = buildMetadata({ title: "AI Studio", path: "/ai" });

type AiPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AiStudioPage({ searchParams }: AiPageProps) {
  const params = await searchParams;

  return <AiStudioClient initialQuery={params.q} />;
}
