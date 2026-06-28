import { AnimatedCounter } from "@/components/home/animated-counter";
import { SectionHeading } from "@/components/home/section-heading";
import { Reveal } from "@/components/motion/reveal";

const stats = [
  { label: "Happy customers", value: 2400000, suffix: "+" },
  { label: "Orders fulfilled", value: 8900000, suffix: "+" },
  { label: "Premium vendors", value: 4200, suffix: "+" },
  { label: "Countries served", value: 68, suffix: "" },
];

export function StatisticsSection() {
  return (
    <section className="border-y border-border/70 bg-card/20 py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Scale"
            title="Commerce infrastructure trusted worldwide"
            description="NOVAEX powers premium buying experiences for operators who demand performance, security, and design excellence."
            align="center"
          />
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.06}>
              <div className="glass-panel rounded-[1.75rem] p-8 text-center">
                <p className="font-display text-4xl font-semibold md:text-5xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-3 text-sm uppercase tracking-[0.18em] text-muted-foreground">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
