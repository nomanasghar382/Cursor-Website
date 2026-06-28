import { BlogCard } from "@/components/growth/blog-card";
import { growthApi } from "@/lib/api/growth";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Blog",
  description: "Insights on AI commerce, product launches, and enterprise growth from NOVAEX.",
  path: "/blog",
});

export default async function BlogIndexPage() {
  const { blogs } = await growthApi.blogs({ limit: 24 }).catch(() => ({ blogs: [], total: 0 }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <div className="max-w-2xl">
        <p className="text-sm uppercase tracking-[0.18em] text-primary">NOVAEX Journal</p>
        <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">Commerce intelligence & growth stories</h1>
        <p className="mt-4 text-muted-foreground">
          Product launches, AI commerce strategy, and customer engagement playbooks.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {blogs.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
      {blogs.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">New articles are on the way.</p>
      ) : null}
    </div>
  );
}
