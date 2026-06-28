import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { Button } from "@/components/ui/button";
import { ProductDetailClient } from "@/components/product/product-detail-client";
import { getProductById } from "@/features/catalog/services";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, faqJsonLd, productJsonLd, productOpenGraph, reviewJsonLd } from "@/lib/seo-product";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { id } = await params;
  try {
    const { product } = await getProductById(id);
    const og = productOpenGraph(product);
    return buildMetadata(og);
  } catch {
    return buildMetadata({ title: "Product not found", path: `/products/${id}`, noIndex: true });
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;

  let product;
  try {
    ({ product } = await getProductById(id));
  } catch {
    notFound();
  }

  const schemas = [
    productJsonLd(product),
    breadcrumbJsonLd([
      { name: "Products", href: "/products" },
      { name: product.name },
    ]),
    reviewJsonLd(product),
    faqJsonLd(product),
  ].filter(Boolean);

  return (
    <div className="space-y-10">
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <Breadcrumb items={[{ label: "Products", href: "/products" }, { label: product.name }]} />
      <Button variant="ghost" asChild>
        <Link href="/products">
          <ArrowLeft className="h-4 w-4" />
          Back to catalog
        </Link>
      </Button>
      <ProductDetailClient product={product} recentlyViewed={[]} />
    </div>
  );
}
