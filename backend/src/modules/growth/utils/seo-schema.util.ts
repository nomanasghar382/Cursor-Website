export function buildProductSchema(product: {
  name: string;
  description: string;
  imageUrl?: string;
  price: number;
  currencyCode?: string;
  rating?: number;
  reviewCount?: number;
  sku?: string;
  brand?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.imageUrl,
    sku: product.sku,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currencyCode ?? "USD",
      availability: "https://schema.org/InStock",
      url: product.url,
    },
    ...(product.reviewCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating ?? 4.8,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };
}

export function buildArticleSchema(article: {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishedAt?: string;
  authorName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    url: article.url,
    image: article.imageUrl,
    datePublished: article.publishedAt,
    author: article.authorName ? { "@type": "Person", name: article.authorName } : undefined,
  };
}

export function buildFaqSchema(faqs: Array<{ question: string; answer: string }>) {
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

export function buildBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
