import Link from "next/link";
import { Bot, Headphones, Home, Watch } from "lucide-react";
import { CategoryCard } from "@/components/commerce/category-card";
import { SectionHeading } from "@/components/home/section-heading";
import { Reveal } from "@/components/motion/reveal";

const categories = [
  {
    title: "Robotics",
    description: "Precision assistants, autonomous companions, and pro-grade automation.",
    href: "/products?category=robotics",
    icon: Bot,
    gradient: "from-cyan-400 via-blue-500 to-violet-600",
  },
  {
    title: "Smart Home",
    description: "Adaptive environments with seamless device orchestration.",
    href: "/products?category=smart-home",
    icon: Home,
    gradient: "from-emerald-300 via-teal-500 to-cyan-600",
  },
  {
    title: "Wearables",
    description: "Performance wearables with biometric intelligence built in.",
    href: "/products?category=wearables",
    icon: Watch,
    gradient: "from-fuchsia-400 via-rose-500 to-orange-500",
  },
  {
    title: "Immersive Audio",
    description: "Spatial sound systems engineered for focus and entertainment.",
    href: "/products?category=immersive-audio",
    icon: Headphones,
    gradient: "from-indigo-400 via-purple-500 to-pink-500",
  },
];

export function FeaturedCategoriesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 md:px-6">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Featured categories"
            title="Explore the lanes shaping modern living"
            description="Each category is curated by NovaAI using conversion quality, sentiment signals, and inventory confidence."
          />
          <Link href="/products" className="text-sm font-medium text-primary hover:underline">
            Browse full catalog
          </Link>
        </div>
      </Reveal>
      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((category, index) => (
          <Reveal key={category.title} delay={index * 0.06}>
            <CategoryCard {...category} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
