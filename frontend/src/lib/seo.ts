import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/utils";

type BuildMetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
};

export function buildMetadata({
  title,
  description = siteConfig.description,
  path = "",
  image = siteConfig.ogImage,
  noIndex = false,
}: BuildMetadataInput = {}): Metadata {
  const pageTitle = title ? `${title} · ${siteConfig.name}` : `${siteConfig.name} · ${siteConfig.tagline}`;
  const canonical = absoluteUrl(path);

  return {
    title: pageTitle,
    description,
    metadataBase: new URL(siteConfig.url),
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonical,
      title: pageTitle,
      description,
      siteName: siteConfig.name,
      images: [{ url: absoluteUrl(image), width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [absoluteUrl(image)],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.legalName,
    url: siteConfig.url,
    logo: absoluteUrl("/brand/novaex-mark.svg"),
    sameAs: [siteConfig.links.twitter, siteConfig.links.github],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: siteConfig.contact.support,
      },
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
