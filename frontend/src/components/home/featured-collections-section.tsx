import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { SectionHeading } from "@/components/home/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

const collections = [
  {
    title: "Executive Workspace",
    subtitle: "Immersive focus. Adaptive lighting. Premium acoustics.",
    href: "/products?category=immersive-audio",
    gradient: "from-slate-900 via-indigo-950 to-cyan-900",
    cta: "Shop workspace",
  },
  {
    title: "Future Home Studio",
    subtitle: "Connected environments designed for creators and families.",
    href: "/products?category=smart-home",
    gradient: "from-emerald-950 via-teal-900 to-cyan-900",
    cta: "Explore smart home",
  },
  {
    title: "Velocity Wearables",
    subtitle: "Performance tech with biometric intelligence and style.",
    href: "/products?category=wearables",
    gradient: "from-fuchsia-950 via-rose-900 to-orange-900",
    cta: "Discover wearables",
  },
];

export function FeaturedCollectionsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 md:px-6">
      <Reveal>
        <SectionHeading
          eyebrow="Featured collections"
          title="Luxury campaigns curated by NovaAI"
          description="Seasonal collections with cinematic overlays, premium storytelling, and conversion-optimized journeys."
        />
      </Reveal>
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {collections.map((collection, index) => (
          <Reveal key={collection.title} delay={index * 0.08}>
            <Link href={collection.href} className="group relative block overflow-hidden rounded-[2rem]">
              <div className={cn("min-h-[360px] bg-gradient-to-br p-8 transition-transform duration-500 group-hover:scale-[1.02]", collection.gradient)}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_40%)] opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="space-y-3">
                    <p className="text-sm uppercase tracking-[0.24em] text-white/70">Collection</p>
                    <h3 className="font-display text-3xl font-semibold text-white">{collection.title}</h3>
                    <p className="max-w-xs text-sm text-white/75">{collection.subtitle}</p>
                  </div>
                  <MagneticButton variant="glass" className="w-fit text-white" asChild>
                    <Link href={collection.href}>
                      {collection.cta}
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </MagneticButton>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
