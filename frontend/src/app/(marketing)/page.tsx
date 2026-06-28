import { Suspense } from "react";
import { HeroSection } from "@/components/home/hero-section";
import { AiAssistantSection } from "@/components/home/ai-assistant-section";
import { FeaturedCategoriesSection } from "@/components/home/featured-categories-section";
import { TrendingProductsSection } from "@/components/home/trending-products-section";
import { FeaturedCollectionsSection } from "@/components/home/featured-collections-section";
import { WhyNovaexSection } from "@/components/home/why-novaex-section";
import { PersonalizedRecommendationsSection } from "@/components/home/personalized-recommendations-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { StatisticsSection } from "@/components/home/statistics-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { Skeleton } from "@/components/ui/skeleton";
import { getProducts } from "@/features/catalog/services";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "AI-native commerce",
  description:
    "Discover robotics, smart home, wearables, and immersive audio with cinematic discovery, NovaAI recommendations, and enterprise-grade trust.",
  path: "/",
});

function HomePageSkeleton() {
  return (
    <div className="space-y-8 px-4 py-24 md:px-6">
      <Skeleton className="h-[70vh] w-full rounded-[2rem]" />
      <Skeleton className="h-80 w-full rounded-[2rem]" />
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-96 rounded-[2rem]" />
        <Skeleton className="h-96 rounded-[2rem]" />
        <Skeleton className="h-96 rounded-[2rem]" />
      </div>
    </div>
  );
}

async function HomePageContent() {
  const catalog = await getProducts({ limit: 12 }).catch(() => ({ products: [], count: 0 }));
  const products = catalog.products;
  const heroProducts = products.slice(0, 3);
  const trendingProducts = products.slice(0, 6);
  const aiProducts = products.slice(0, 3);
  const recommendedProducts = [...products].sort((a, b) => b.aiMatch - a.aiMatch).slice(0, 8);

  return (
    <>
      <HeroSection featuredProducts={heroProducts} />
      <AiAssistantSection recommendations={aiProducts} />
      <FeaturedCategoriesSection />
      <TrendingProductsSection products={trendingProducts} />
      <FeaturedCollectionsSection />
      <WhyNovaexSection />
      <PersonalizedRecommendationsSection products={recommendedProducts} />
      <TestimonialsSection />
      <StatisticsSection />
      <NewsletterSection />
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageContent />
    </Suspense>
  );
}
