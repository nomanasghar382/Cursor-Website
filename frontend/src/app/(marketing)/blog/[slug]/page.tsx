import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/growth/seo-head";
import { growthApi } from "@/lib/api/growth";
import { articleJsonLd, buildMetadataFromGrowthSeo } from "@/lib/seo-growth";

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  try {
    const seo = await growthApi.blogSeo(slug);
    return buildMetadataFromGrowthSeo(seo);
  } catch {
    return buildMetadataFromGrowthSeo({
      title: "Article",
      description: "NOVAEX blog",
      canonical: `/blog/${slug}`,
      openGraph: {},
      twitter: {},
    });
  }
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;

  let blog;
  let seo;
  try {
    [{ blog }, seo] = await Promise.all([growthApi.blog(slug), growthApi.blogSeo(slug)]);
  } catch {
    notFound();
  }

  const schema = seo.schema ?? articleJsonLd({
    title: blog.title,
    description: blog.excerpt ?? "",
    path: `/blog/${blog.slug}`,
    publishedAt: blog.publishedAt ?? undefined,
    authorName: blog.authorName,
  });

  return (
    <>
      <JsonLd data={schema} />
      <article className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <div className="flex flex-wrap items-center gap-2">
          {blog.category ? <Badge variant="secondary">{blog.category.name}</Badge> : null}
          {blog.publishedAt ? (
            <span className="text-sm text-muted-foreground">{new Date(blog.publishedAt).toLocaleDateString()}</span>
          ) : null}
        </div>
        <h1 className="mt-4 font-display text-4xl font-semibold md:text-5xl">{blog.title}</h1>
        {blog.excerpt ? <p className="mt-4 text-lg text-muted-foreground">{blog.excerpt}</p> : null}
        <p className="mt-2 text-sm text-muted-foreground">By {blog.authorName ?? "NOVAEX Editorial"}</p>
        <div className="prose prose-invert mt-10 max-w-none whitespace-pre-wrap text-foreground/90">{blog.body}</div>
        {blog.tags && blog.tags.length > 0 ? (
          <div className="mt-10 flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </article>
    </>
  );
}
