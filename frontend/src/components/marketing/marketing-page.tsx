import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

type MarketingPageProps = {
  title: string;
  description: string;
  path: string;
  children: React.ReactNode;
};

export function MarketingPage({ title, description, path, children }: MarketingPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <p className="text-sm uppercase tracking-[0.18em] text-primary">NOVAEX</p>
      <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">{title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{description}</p>
      <div className="prose prose-invert mt-10 max-w-none space-y-4 text-muted-foreground">{children}</div>
      <div className="mt-10">
        <Button asChild variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}

export function marketingPageMetadata(title: string, path: string, description: string) {
  return buildMetadata({ title, description, path });
}
