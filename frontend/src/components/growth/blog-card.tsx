import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { BlogPost } from "@/types/growth";

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="glass-panel group block rounded-[1.75rem] p-6 transition hover:border-primary/30">
      <div className="flex flex-wrap items-center gap-2">
        {post.category ? <Badge variant="secondary">{post.category.name}</Badge> : null}
        {post.publishedAt ? (
          <span className="text-xs text-muted-foreground">{new Date(post.publishedAt).toLocaleDateString()}</span>
        ) : null}
      </div>
      <h2 className="mt-4 font-display text-2xl font-semibold group-hover:text-primary">{post.title}</h2>
      {post.excerpt ? <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p> : null}
      {post.tags && post.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      ) : null}
    </Link>
  );
}
