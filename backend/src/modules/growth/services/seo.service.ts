import { Injectable, NotFoundException } from "@nestjs/common";
import { GrowthRepository } from "../repositories/growth.repository";
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildProductSchema,
} from "../utils/seo-schema.util";
import { SeoMetadataDto } from "../dto/growth.dto";

@Injectable()
export class SeoService {
  constructor(private readonly growthRepository: GrowthRepository) {}

  async getPageSeo(slug: string) {
    const page = await this.growthRepository.getCmsPageBySlug(slug, true);
    if (!page) throw new NotFoundException("Page not found.");
    const metadata = (page.metadata ?? {}) as Record<string, unknown>;
    return this.buildSeoResponse({
      title: page.seoTitle ?? page.title,
      description: page.seoDescription ?? "",
      canonical: `/pages/${page.slug}`,
      type: "website",
      ...metadata,
    });
  }

  async getBlogSeo(slug: string) {
    const blog = await this.growthRepository.getBlogBySlug(slug, true);
    if (!blog) throw new NotFoundException("Blog not found.");
    const metadata = (blog.metadata ?? {}) as { seoTitle?: string; seoDescription?: string };
    const schema = buildArticleSchema({
      title: metadata.seoTitle ?? blog.title,
      description: metadata.seoDescription ?? blog.excerpt ?? "",
      url: `/blog/${blog.slug}`,
      publishedAt: blog.publishedAt?.toISOString(),
      authorName: blog.author?.profile
        ? `${blog.author.profile.firstName ?? ""} ${blog.author.profile.lastName ?? ""}`.trim()
        : undefined,
    });
    return this.buildSeoResponse({
      title: metadata.seoTitle ?? blog.title,
      description: metadata.seoDescription ?? blog.excerpt ?? "",
      canonical: `/blog/${blog.slug}`,
      type: "article",
      schema,
    });
  }

  async getProductSeo(slug: string) {
    const product = await this.growthRepository.findProductBySlug(slug);
    if (!product) throw new NotFoundException("Product not found.");
    const translation = product.translations[0];
    const meta = (product.metadata ?? {}) as Record<string, unknown>;
    const variant = product.variants[0];
    const reviewCount = product.reviews.length;
    const schema = buildProductSchema({
      name: translation?.name ?? product.name,
      description: translation?.description ?? product.description,
      imageUrl: product.images[0]?.url,
      price: variant ? Number(variant.price) : Number(product.basePrice),
      currencyCode: variant?.currencyCode ?? product.currencyCode,
      rating: reviewCount ? product.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : undefined,
      reviewCount,
      url: `/products/${product.slug}`,
    });
    return this.buildSeoResponse({
      title: translation?.name ?? product.name,
      description: translation?.description ?? product.description,
      canonical: `/products/${product.slug}`,
      type: "product",
      image: product.images[0]?.url,
      schema,
      ...meta,
    });
  }

  async getCategorySeo(slug: string) {
    const category = await this.growthRepository.findCategoryBySlug(slug);
    if (!category) throw new NotFoundException("Category not found.");
    const translation = category.translations[0];
    const meta = (category.metadata ?? {}) as Record<string, unknown>;
    return this.buildSeoResponse({
      title: translation?.name ?? category.name,
      description: translation?.description ?? "",
      canonical: `/categories/${category.slug}`,
      type: "website",
      ...meta,
    });
  }

  async getFaqSchema() {
    const faqs = await this.growthRepository.listFaqs(true);
    return buildFaqSchema(faqs.map((f) => ({ question: f.question, answer: f.answer })));
  }

  async getSitemapEntries() {
    const [pages, blogs, landing, products] = await this.growthRepository.getSitemapEntries();
    return {
      pages: pages.map((p) => ({ slug: p.slug, updatedAt: p.updatedAt.toISOString(), path: `/pages/${p.slug}` })),
      blogs: blogs.map((b) => ({
        slug: b.slug,
        updatedAt: (b.publishedAt ?? b.updatedAt).toISOString(),
        path: `/blog/${b.slug}`,
      })),
      landingPages: landing.map((l) => ({ slug: l.slug, updatedAt: l.updatedAt.toISOString(), path: `/campaigns/${l.slug}` })),
      products: products.map((p) => ({ slug: p.slug, updatedAt: p.updatedAt.toISOString(), path: `/products/${p.slug}` })),
    };
  }

  getRobotsConfig() {
    return {
      rules: [
        {
          userAgent: "*",
          allow: ["/", "/products", "/categories", "/blog", "/pages", "/campaigns"],
          disallow: ["/admin", "/account", "/checkout", "/api"],
        },
      ],
      sitemap: "/sitemap.xml",
    };
  }

  async getSeoAnalytics() {
    const [pageResult, blogResult, sitemap] = await Promise.all([
      this.growthRepository.listCmsPages({ page: 1, limit: 1000 }),
      this.growthRepository.listBlogs({ page: 1, limit: 1000 }),
      this.getSitemapEntries(),
    ]);
    const publishedPages = pageResult.items.filter((p) => p.status === "PUBLISHED").length;
    const publishedBlogs = blogResult.items.filter((b) => b.status === "PUBLISHED").length;
    const productCount = sitemap.products.length;
    const totalEntries =
      sitemap.pages.length + sitemap.blogs.length + sitemap.landingPages.length + sitemap.products.length;
    return {
      publishedPages,
      publishedBlogs,
      indexedProducts: productCount,
      totalSitemapEntries: totalEntries,
      coverageScore: Math.min(
        100,
        Math.round(((publishedPages + publishedBlogs + productCount) / Math.max(1, totalEntries)) * 100),
      ),
    };
  }

  private buildSeoResponse(input: SeoMetadataDto & { schema?: unknown }) {
    const title = input.title ?? "NOVAEX";
    const description = input.description ?? "";
    const canonical = input.canonical ?? "/";
    const image = input.image ?? "/og-default.jpg";
    return {
      title,
      description,
      canonical,
      openGraph: {
        title: input.ogTitle ?? title,
        description: input.ogDescription ?? description,
        image: input.ogImage ?? image,
        type: input.type ?? "website",
        url: canonical,
      },
      twitter: {
        card: input.twitterCard ?? "summary_large_image",
        title: input.twitterTitle ?? title,
        description: input.twitterDescription ?? description,
        image: input.twitterImage ?? image,
      },
      schema: input.schema ?? null,
      breadcrumbs: buildBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: title, url: canonical },
      ]),
    };
  }
}
