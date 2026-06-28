import type { ProductDetail } from "@/types/catalog";
import { absoluteUrl } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export function productJsonLd(product: ProductDetail) {
  const image = product.imageUrl ?? product.images[0]?.url ?? absoluteUrl("/og/novaex-default.jpg");
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.length > 0 ? product.images.map((entry) => entry.url) : [image],
    sku: product.variants[0]?.sku,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/products/${product.id}`),
      priceCurrency: product.currencyCode,
      price: product.price,
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          }
        : undefined,
  };
}

export function breadcrumbJsonLd(items: { name: string; href?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.href ? absoluteUrl(item.href) : undefined,
    })),
  };
}

export function reviewJsonLd(product: ProductDetail) {
  if (product.reviews.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    review: product.reviews.slice(0, 10).map((review) => ({
      "@type": "Review",
      author: { "@type": "Person", name: review.author },
      datePublished: review.createdAt,
      reviewBody: review.body,
      name: review.title,
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
      },
    })),
  };
}

export function faqJsonLd(product: ProductDetail) {
  const answered = product.questions.filter((entry) => entry.answer);
  if (answered.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: answered.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };
}

export function productOpenGraph(product: ProductDetail) {
  const image = product.imageUrl ?? product.images[0]?.url ?? siteConfig.ogImage;
  return {
    title: `${product.name} · ${siteConfig.name}`,
    description: product.description,
    path: `/products/${product.id}`,
    image,
  };
}
