import { notFound } from "next/navigation";
import { JsonLd } from "@/components/growth/seo-head";
import { growthApi } from "@/lib/api/growth";
import { buildMetadataFromGrowthSeo } from "@/lib/seo-growth";

type CmsPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CmsPageProps) {
  const { slug } = await params;
  try {
    const seo = await growthApi.pageSeo(slug);
    return buildMetadataFromGrowthSeo(seo);
  } catch {
    return buildMetadataFromGrowthSeo({
      title: "Page",
      description: "NOVAEX",
      canonical: `/pages/${slug}`,
      openGraph: {},
      twitter: {},
    });
  }
}

export default async function CmsPageView({ params }: CmsPageProps) {
  const { slug } = await params;

  let page;
  let seo;
  try {
    [{ page }, seo] = await Promise.all([growthApi.page(slug), growthApi.pageSeo(slug)]);
  } catch {
    notFound();
  }

  return (
    <>
      <JsonLd data={seo.schema ?? seo.breadcrumbs} />
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <h1 className="font-display text-4xl font-semibold md:text-5xl">{page.title}</h1>
        <div className="prose prose-invert mt-8 max-w-none whitespace-pre-wrap text-muted-foreground">{page.body}</div>
      </div>
    </>
  );
}
