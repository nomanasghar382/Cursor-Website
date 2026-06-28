import type { Metadata } from "next";
import type { GrowthSeo } from "@/types/growth";
import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/utils";

export function buildMetadataFromGrowthSeo(seo: GrowthSeo): Metadata {
  const pageTitle = `${seo.title} · ${siteConfig.name}`;
  const canonical = absoluteUrl(seo.canonical);
  const image = absoluteUrl(String(seo.openGraph.image ?? siteConfig.ogImage));

  return {
    title: pageTitle,
    description: seo.description,
    metadataBase: new URL(siteConfig.url),
    alternates: { canonical },
    openGraph: {
      type: seo.openGraph.type === "article" ? "article" : "website",
      locale: "en_US",
      url: canonical,
      title: String(seo.openGraph.title ?? pageTitle),
      description: String(seo.openGraph.description ?? seo.description),
      siteName: siteConfig.name,
      images: [{ url: image, width: 1200, height: 630, alt: seo.title }],
    },
    twitter: {
      card: (seo.twitter.card as "summary_large_image") ?? "summary_large_image",
      title: String(seo.twitter.title ?? pageTitle),
      description: String(seo.twitter.description ?? seo.description),
      images: [absoluteUrl(String(seo.twitter.image ?? image))],
    },
    robots: { index: true, follow: true },
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  publishedAt?: string;
  authorName?: string;
  imageUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    image: input.imageUrl ? absoluteUrl(input.imageUrl) : undefined,
    datePublished: input.publishedAt,
    author: input.authorName ? { "@type": "Person", name: input.authorName } : undefined,
  };
}

export function faqJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
