import Link from "next/link";
import { Bot, Headphones, Home, Sparkles, Watch } from "lucide-react";
import { HeroSceneCanvas } from "@/components/three/hero-scene-lazy";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { Reveal } from "@/components/motion/reveal";
import { CategoryCard } from "@/components/commerce/category-card";
import { ProductCarousel } from "@/components/commerce/product-carousel";
import { AiSearchBox, SearchBar } from "@/components/search/search-bar";
import { getProducts } from "@/features/catalog/services";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "AI-native commerce",
  description: "Discover robotics, smart home, wearables, and immersive audio with enterprise-grade AI recommendations.",
  path: "/",
});

const categories = [
  {
    title: "Robotics",
    description: "Autonomous assistants engineered for precision and delight.",
    href: "/products?category=robotics",
    icon: Bot,
    gradient: "from-cyan-400 via-blue-500 to-violet-600",
  },
  {
    title: "Smart Home",
    description: "Ambient intelligence that adapts to every room and routine.",
    href: "/products?category=smart-home",
    icon: Home,
    gradient: "from-emerald-300 via-teal-500 to-cyan-600",
  },
  {
    title: "Wearables",
    description: "Premium devices with adaptive AI and seamless continuity.",
    href: "/products?category=wearables",
    icon: Watch,
    gradient: "from-fuchsia-400 via-rose-500 to-orange-500",
  },
  {
    title: "Immersive Audio",
    description: "Spatial soundscapes designed for focus, travel, and play.",
    href: "/products?category=immersive-audio",
    icon: Headphones,
    gradient: "from-indigo-400 via-purple-500 to-pink-500",
  },
];

export default async function HomePage() {
  const catalog = await getProducts({ limit: 8 }).catch(() => ({ products: [], count: 0 }));

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 md:px-6">
      <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            Enterprise AI commerce foundation
          </div>
          <div className="space-y-5">
            <h1 className="font-display text-5xl font-semibold tracking-tight md:text-7xl">
              Commerce that feels <span className="text-gradient">alive</span>.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
              NOVAEX combines cinematic product discovery, zero-trust authentication, and adaptive AI recommendations in one premium platform.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <MagneticButton variant="gradient" size="lg" asChild>
              <Link href="/products">Explore catalog</Link>
            </MagneticButton>
            <MagneticButton variant="glass" size="lg" asChild>
              <Link href="/ai">Launch AI studio</Link>
            </MagneticButton>
          </div>
          <SearchBar />
        </Reveal>
        <Reveal delay={0.1}>
          <HeroSceneCanvas />
        </Reveal>
      </section>

      <section className="mt-24 space-y-8">
        <Reveal>
          <AiSearchBox />
        </Reveal>
      </section>

      <section className="mt-24 space-y-8">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-primary">Categories</p>
              <h2 className="font-display text-4xl font-semibold">Curated intelligence lanes</h2>
            </div>
            <Link href="/products" className="text-sm text-primary hover:underline">
              View all products
            </Link>
          </div>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category, index) => (
            <Reveal key={category.title} delay={index * 0.05}>
              <CategoryCard {...category} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-24 space-y-8">
        <Reveal>
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-primary">Featured</p>
            <h2 className="font-display text-4xl font-semibold">Products with highest AI confidence</h2>
          </div>
        </Reveal>
        <ProductCarousel products={catalog.products} />
      </section>
    </div>
  );
}
