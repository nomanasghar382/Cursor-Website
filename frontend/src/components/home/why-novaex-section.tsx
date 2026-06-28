import { Headphones, Leaf, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { SectionHeading } from "@/components/home/section-heading";
import { Reveal } from "@/components/motion/reveal";

const pillars = [
  {
    icon: Sparkles,
    title: "AI Powered Shopping",
    description: "NovaAI ranks every product by fit, confidence, and intent — not just popularity.",
  },
  {
    icon: Truck,
    title: "Lightning Fast Delivery",
    description: "Priority fulfillment lanes and real-time inventory intelligence across global hubs.",
  },
  {
    icon: Headphones,
    title: "Premium Support",
    description: "White-glove assistance for enterprise buyers, vendors, and high-value customers.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Zero-trust authentication, encrypted checkout, and enterprise audit visibility.",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    description: "Carbon-aware logistics and repairable product standards across premium lines.",
  },
];

export function WhyNovaexSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 md:px-6">
      <Reveal>
        <SectionHeading
          eyebrow="Why NOVAEX"
          title="Built for brands that refuse to feel ordinary"
          description="A commerce platform engineered with the polish of Apple, the velocity of Stripe, and the precision of Linear."
          align="center"
        />
      </Reveal>
      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        {pillars.map((pillar, index) => (
          <Reveal key={pillar.title} delay={index * 0.05}>
            <div className="glass-panel h-full rounded-[1.75rem] p-6 transition-transform hover:-translate-y-1">
              <div className="mb-4 inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
                <pillar.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold">{pillar.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{pillar.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
