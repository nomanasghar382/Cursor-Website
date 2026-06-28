import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { GrowthPaginationDto, UpsertBlogDto, UpsertCmsPageDto, UpsertFaqDto, UpsertLandingPageDto } from "../dto/growth.dto";
import { GrowthRepository } from "../repositories/growth.repository";

@Injectable()
export class CmsService {
  constructor(private readonly growthRepository: GrowthRepository) {}

  listPages(query: GrowthPaginationDto, publishedOnly = false) {
    return this.growthRepository.listCmsPages(query, publishedOnly).then((result) => ({
      pages: result.items.map((page) => this.mapPage(page)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    }));
  }

  getPageBySlug(slug: string) {
    return this.growthRepository.getCmsPageBySlug(slug, true).then((page) => {
      if (!page) throw new NotFoundException("Page not found.");
      return { page: this.mapPage(page) };
    });
  }

  getPageAdmin(id: string) {
    return this.growthRepository.getCmsPageById(id).then((page) => {
      if (!page) throw new NotFoundException("Page not found.");
      return { page: this.mapPage(page) };
    });
  }

  createPage(dto: UpsertCmsPageDto) {
    const metadata = {
      sections: (dto.sections ?? []) as Prisma.InputJsonValue,
      scheduledAt: dto.scheduledAt,
    } satisfies Prisma.InputJsonObject;

    return this.growthRepository
      .createCmsPage({
        slug: dto.slug,
        title: dto.title,
        content: dto.body,
        status: dto.status ?? "DRAFT",
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        metadata,
      })
      .then((page) => ({ page: this.mapPage(page) }));
  }

  updatePage(id: string, dto: Partial<UpsertCmsPageDto>) {
    const existing = this.growthRepository.getCmsPageById(id);
    return existing.then(async (page) => {
      if (!page) throw new NotFoundException("Page not found.");
      const metadata = (page.metadata ?? {}) as Record<string, unknown>;
      const updated = await this.growthRepository.updateCmsPage(id, {
        ...(dto.slug ? { slug: dto.slug } : {}),
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.body ? { content: dto.body } : {}),
        ...(dto.status ? { status: dto.status as never } : {}),
        ...(dto.seoTitle ? { seoTitle: dto.seoTitle } : {}),
        ...(dto.seoDescription ? { seoDescription: dto.seoDescription } : {}),
        metadata: {
          ...metadata,
          ...(dto.sections ? { sections: dto.sections as Prisma.InputJsonValue } : {}),
          ...(dto.scheduledAt ? { scheduledAt: dto.scheduledAt } : {}),
        } as Prisma.InputJsonValue,
      });
      return { page: this.mapPage(updated) };
    });
  }

  deletePage(id: string) {
    return this.growthRepository.softDeleteCmsPage(id).then(() => ({ deleted: true }));
  }

  listBlogs(query: GrowthPaginationDto, publishedOnly = false) {
    return this.growthRepository.listBlogs(query, publishedOnly).then((result) => ({
      blogs: result.items.map((blog) => this.mapBlog(blog)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    }));
  }

  getBlogBySlug(slug: string) {
    return this.growthRepository.getBlogBySlug(slug, true).then((blog) => {
      if (!blog) throw new NotFoundException("Blog post not found.");
      return { blog: this.mapBlog(blog, true) };
    });
  }

  createBlog(dto: UpsertBlogDto, authorUserId: string) {
    return this.resolveCategoryId(dto.categoryId).then((categoryId) =>
      this.growthRepository
        .createBlog({
          title: dto.title,
          slug: dto.slug,
          excerpt: dto.excerpt,
          content: dto.body,
          status: dto.status ?? "DRAFT",
          publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : dto.status === "PUBLISHED" ? new Date() : null,
          metadata: { tags: dto.tags ?? [], seoTitle: dto.seoTitle, seoDescription: dto.seoDescription },
          author: { connect: { id: authorUserId } },
          category: { connect: { id: categoryId } },
        })
        .then((blog) => ({ blog: this.mapBlog(blog) })),
    );
  }

  updateBlog(id: string, dto: Partial<UpsertBlogDto>) {
    return this.growthRepository.getBlogById(id).then(async (blog) => {
      if (!blog) throw new NotFoundException("Blog post not found.");
      const metadata = (blog.metadata ?? {}) as Record<string, unknown>;
      const updated = await this.growthRepository.updateBlog(id, {
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.slug ? { slug: dto.slug } : {}),
        ...(dto.excerpt ? { excerpt: dto.excerpt } : {}),
        ...(dto.body ? { content: dto.body } : {}),
        ...(dto.status ? { status: dto.status as never } : {}),
        ...(dto.status === "PUBLISHED" ? { publishedAt: new Date() } : {}),
        metadata: {
          ...metadata,
          ...(dto.tags ? { tags: dto.tags } : {}),
          ...(dto.seoTitle ? { seoTitle: dto.seoTitle } : {}),
          ...(dto.seoDescription ? { seoDescription: dto.seoDescription } : {}),
        },
      });
      return { blog: this.mapBlog(updated) };
    });
  }

  deleteBlog(id: string) {
    return this.growthRepository.softDeleteBlog(id).then(() => ({ deleted: true }));
  }

  listCategories() {
    return this.growthRepository.listBlogCategories().then((categories) => ({ categories }));
  }

  listFaqs(activeOnly = false) {
    return this.growthRepository.listFaqs(activeOnly).then((faqs) => ({ faqs }));
  }

  createFaq(dto: UpsertFaqDto) {
    return this.growthRepository.createFaq(dto).then((faq) => ({ faq }));
  }

  updateFaq(id: string, dto: Partial<UpsertFaqDto>) {
    return this.growthRepository.updateFaq(id, dto).then((faq) => ({ faq }));
  }

  deleteFaq(id: string) {
    return this.growthRepository.softDeleteFaq(id).then(() => ({ deleted: true }));
  }

  listLandingPages(query: GrowthPaginationDto, publishedOnly = false) {
    return this.growthRepository.listLandingPages(query, publishedOnly).then((result) => ({
      landingPages: result.items.map((page) => this.mapLandingPage(page)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    }));
  }

  getLandingPageBySlug(slug: string) {
    return this.growthRepository.getLandingPageBySlug(slug, true).then((page) => {
      if (!page) throw new NotFoundException("Landing page not found.");
      return { landingPage: this.mapLandingPage(page) };
    });
  }

  createLandingPage(dto: UpsertLandingPageDto) {
    return this.growthRepository
      .createLandingPage({
        name: dto.name,
        slug: dto.slug,
        status: dto.status ?? "DRAFT",
        metadata: { sections: (dto.sections ?? []) as Prisma.InputJsonValue },
        ...(dto.cmsPageId ? { cmsPage: { connect: { id: dto.cmsPageId } } } : {}),
      })
      .then((page) => ({ landingPage: this.mapLandingPage(page) }));
  }

  updateLandingPage(id: string, dto: Partial<UpsertLandingPageDto>) {
    return this.growthRepository.updateLandingPage(id, {
      ...(dto.name ? { name: dto.name } : {}),
      ...(dto.slug ? { slug: dto.slug } : {}),
      ...(dto.status ? { status: dto.status as never } : {}),
      ...(dto.sections ? { metadata: { sections: dto.sections as Prisma.InputJsonValue } } : {}),
      ...(dto.cmsPageId ? { cmsPage: { connect: { id: dto.cmsPageId } } } : {}),
    }).then((page) => ({ landingPage: this.mapLandingPage(page) }));
  }

  approveContent(type: "page" | "blog" | "landing", id: string, action: "approve" | "reject") {
    const status = action === "approve" ? "PUBLISHED" : "DRAFT";
    if (type === "page") return this.updatePage(id, { status: status as never });
    if (type === "blog") return this.updateBlog(id, { status: status as never });
    return this.growthRepository.updateLandingPage(id, { status: status as never }).then((page) => ({
      landingPage: this.mapLandingPage(page),
    }));
  }

  getMediaLibrary() {
    return Promise.all([
      this.growthRepository.listBanners(),
      this.growthRepository.listHeroSections(),
    ]).then(([banners, heroes]) => ({
      media: [
        ...banners.map((b) => ({ id: b.id, type: "banner", title: b.title, url: b.imageUrl, createdAt: b.createdAt.toISOString() })),
        ...heroes.filter((h) => h.mediaUrl).map((h) => ({ id: h.id, type: "hero", title: h.title, url: h.mediaUrl!, createdAt: h.createdAt.toISOString() })),
      ],
    }));
  }

  private async resolveCategoryId(categoryId?: string) {
    if (categoryId) return categoryId;
    const category = await this.growthRepository.getDefaultBlogCategory();
    if (!category) throw new NotFoundException("Blog category is required.");
    return category.id;
  }

  private mapPage(page: {
    id: string;
    slug: string;
    title: string;
    content: string;
    status: string;
    seoTitle: string | null;
    seoDescription: string | null;
    createdAt: Date;
    updatedAt: Date;
    metadata: unknown;
  }) {
    const metadata = (page.metadata ?? {}) as { sections?: unknown[]; scheduledAt?: string };
    return {
      id: page.id,
      slug: page.slug,
      title: page.title,
      body: page.content,
      status: page.status,
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription,
      sections: metadata.sections ?? [],
      scheduledAt: metadata.scheduledAt,
      createdAt: page.createdAt.toISOString(),
      updatedAt: page.updatedAt.toISOString(),
    };
  }

  private mapBlog(
    blog: {
      id: string;
      slug: string;
      title: string;
      excerpt: string | null;
      content: string;
      status: string;
      publishedAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
      metadata: unknown;
      category?: { id: string; name: string; slug: string };
      author?: { profile?: { firstName?: string | null; lastName?: string | null } | null };
    },
    includeBody = false,
  ) {
    const metadata = (blog.metadata ?? {}) as { tags?: string[]; seoTitle?: string; seoDescription?: string };
    return {
      id: blog.id,
      slug: blog.slug,
      title: blog.title,
      excerpt: blog.excerpt,
      ...(includeBody ? { body: blog.content } : {}),
      status: blog.status,
      tags: metadata.tags ?? [],
      seoTitle: metadata.seoTitle,
      seoDescription: metadata.seoDescription,
      category: blog.category,
      authorName: blog.author?.profile
        ? `${blog.author.profile.firstName ?? ""} ${blog.author.profile.lastName ?? ""}`.trim()
        : "NOVAEX Editorial",
      publishedAt: blog.publishedAt?.toISOString(),
      createdAt: blog.createdAt.toISOString(),
      updatedAt: blog.updatedAt.toISOString(),
    };
  }

  private mapLandingPage(page: {
    id: string;
    name: string;
    slug: string;
    status: string;
    metadata: unknown;
    cmsPage?: { id: string; title: string; content: string; seoTitle: string | null; seoDescription: string | null } | null;
    heroSections?: Array<{ id: string; title: string; subtitle: string | null; mediaUrl: string | null; ctaLabel: string | null; ctaUrl: string | null }>;
    banners?: Array<{ id: string; title: string; imageUrl: string; targetUrl: string | null; placement: string }>;
  }) {
    const metadata = (page.metadata ?? {}) as { sections?: unknown[] };
    return {
      id: page.id,
      name: page.name,
      slug: page.slug,
      status: page.status,
      sections: metadata.sections ?? [],
      cmsPage: page.cmsPage
        ? {
            id: page.cmsPage.id,
            title: page.cmsPage.title,
            body: page.cmsPage.content,
            seoTitle: page.cmsPage.seoTitle,
            seoDescription: page.cmsPage.seoDescription,
          }
        : null,
      heroSections: page.heroSections ?? [],
      banners: page.banners ?? [],
    };
  }
}
