import { Breadcrumb } from "@/components/common/breadcrumb";
import { AiPageClient } from "@/components/account/ai-page-client";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "AI Preferences",
  description: "Tune your AI shopping assistant and personalized recommendations.",
  path: "/account/ai",
});

export default function AiPreferencesPage() {
  return (
    <div className="space-y-10">
      <Breadcrumb items={[{ label: "Account", href: "/account" }, { label: "AI Preferences" }]} />
      <AiPageClient />
    </div>
  );
}
