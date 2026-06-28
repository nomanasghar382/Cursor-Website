import { ProductCardView } from "@/components/commerce/product-card";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { SearchBar } from "@/components/search/search-bar";
import { getProducts } from "@/features/catalog/services";
import { buildMetadata } from "@/lib/seo";
import { ShoppingBag } from "lucide-react";

export const metadata = buildMetadata({ title: "Products", path: "/products" });

type ProductsPageProps = {
  searchParams: Promise<{ search?: string; category?: string; sort?: string }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const catalog = await getProducts(params).catch(() => ({ products: [], count: 0 }));

  return (
    <div className="space-y-10">
      <Breadcrumb items={[{ label: "Products" }]} />
      <PageHeader
        eyebrow="Catalog"
        title="Premium products, ranked by intelligence"
        description="Every listing is scored by NOVAEX AI for fit, availability, and experience quality."
        icon={ShoppingBag}
      >
        <div className="w-full max-w-xl">
          <SearchBar defaultValue={params.search ?? ""} />
        </div>
      </PageHeader>
      {catalog.products.length === 0 ? (
        <EmptyState
          title="No products matched your search"
          description="Try another category or broaden your search terms to discover more of the NOVAEX catalog."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {catalog.products.map((product) => (
            <ProductCardView key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
