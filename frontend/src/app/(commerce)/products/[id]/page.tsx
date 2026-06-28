import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles, Star } from "lucide-react";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/features/catalog/services";
import { buildMetadata } from "@/lib/seo";
import { formatCurrency, cn } from "@/lib/utils";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const catalog = await getProducts().catch(() => ({ products: [], count: 0 }));
  const product = catalog.products.find((entry) => entry.id === id);
  if (!product) {
    return buildMetadata({ title: "Product not found", path: `/products/${id}`, noIndex: true });
  }
  return buildMetadata({ title: product.name, description: product.description, path: `/products/${id}` });
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const catalog = await getProducts().catch(() => ({ products: [], count: 0 }));
  const product = catalog.products.find((entry) => entry.id === id);
  if (!product) notFound();

  return (
    <div className="space-y-10">
      <Breadcrumb items={[{ label: "Products", href: "/products" }, { label: product.name }]} />
      <Button variant="ghost" asChild>
        <Link href="/products">
          <ArrowLeft className="h-4 w-4" />
          Back to catalog
        </Link>
      </Button>
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className={cn("min-h-[420px] rounded-[2rem] bg-gradient-to-br p-10", product.gradient)}>
          <Badge variant="accent">{product.badge}</Badge>
        </div>
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.24em] text-primary">{product.category}</p>
            <h1 className="font-display text-5xl font-semibold">{product.name}</h1>
            <p className="text-lg text-muted-foreground">{product.description}</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2">
              <Star className="h-4 w-4 text-amber-300" />
              {product.rating} rating
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {product.aiMatch}% AI match
            </div>
          </div>
          <p className="font-display text-4xl font-semibold">{formatCurrency(product.price)}</p>
          <Button variant="gradient" size="lg">
            Add to cart
          </Button>
        </div>
      </div>
    </div>
  );
}
