import type { LandingPage } from "@/types/growth";
import { PromotionBanner } from "@/components/growth/promotion-banner";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Section = Record<string, unknown>;

function HeroBlock({ section }: { section: Section }) {
  const title = String(section.title ?? "");
  const subtitle = section.subtitle ? String(section.subtitle) : undefined;
  const ctaLabel = section.ctaLabel ? String(section.ctaLabel) : undefined;
  const ctaUrl = section.ctaUrl ? String(section.ctaUrl) : undefined;
  const mediaUrl = section.mediaUrl ? String(section.mediaUrl) : undefined;

  return (
    <section className="glass-panel overflow-hidden rounded-[2rem] p-8 md:p-12">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="font-display text-3xl font-semibold md:text-4xl">{title}</h2>
          {subtitle ? <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p> : null}
          {ctaLabel && ctaUrl ? (
            <Button asChild variant="gradient" className="mt-6">
              <Link href={ctaUrl}>{ctaLabel}</Link>
            </Button>
          ) : null}
        </div>
        {mediaUrl ? (
          <div className="overflow-hidden rounded-[1.5rem] border border-border/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mediaUrl} alt={title} className="h-full w-full object-cover" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function TextBlock({ section }: { section: Section }) {
  return (
    <section className="glass-panel rounded-[2rem] p-8 md:p-10">
      {section.title ? <h2 className="font-display text-2xl font-semibold">{String(section.title)}</h2> : null}
      {section.body ? <p className="mt-4 whitespace-pre-wrap text-muted-foreground">{String(section.body)}</p> : null}
    </section>
  );
}

function FaqBlock({ section }: { section: Section }) {
  const items = Array.isArray(section.items) ? (section.items as Array<{ question: string; answer: string }>) : [];
  return (
    <section className="space-y-4">
      {section.title ? <h2 className="font-display text-2xl font-semibold">{String(section.title)}</h2> : null}
      {items.map((item) => (
        <details key={item.question} className="glass-panel rounded-2xl p-5">
          <summary className="cursor-pointer font-medium">{item.question}</summary>
          <p className="mt-3 text-sm text-muted-foreground">{item.answer}</p>
        </details>
      ))}
    </section>
  );
}

export function LandingPageRenderer({ page }: { page: LandingPage }) {
  const sections = (page.sections ?? []) as Section[];

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-16 md:px-6">
      {page.heroSections?.map((hero) => (
        <HeroBlock
          key={hero.id}
          section={{
            title: hero.title,
            subtitle: hero.subtitle,
            mediaUrl: hero.mediaUrl,
            ctaLabel: hero.ctaLabel,
            ctaUrl: hero.ctaUrl,
          }}
        />
      ))}

      {page.banners?.map((banner) => (
        <PromotionBanner key={banner.id} title={banner.title} imageUrl={banner.imageUrl} targetUrl={banner.targetUrl} />
      ))}

      {page.cmsPage ? (
        <section className="glass-panel rounded-[2rem] p-8 md:p-10">
          <h1 className="font-display text-4xl font-semibold">{page.cmsPage.title}</h1>
          <div className="prose prose-invert mt-6 max-w-none whitespace-pre-wrap text-muted-foreground">{page.cmsPage.body}</div>
        </section>
      ) : null}

      {sections.map((section, index) => {
        const type = String(section.type ?? "text");
        if (type === "hero") return <HeroBlock key={index} section={section} />;
        if (type === "faq") return <FaqBlock key={index} section={section} />;
        return <TextBlock key={index} section={section} />;
      })}
    </div>
  );
}
