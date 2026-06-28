import { notFound } from "next/navigation";
import { LandingPageRenderer } from "@/components/growth/landing-page-renderer";
import { JsonLd } from "@/components/growth/seo-head";
import { growthApi } from "@/lib/api/growth";
import { buildMetadata } from "@/lib/seo";

type CampaignPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CampaignPageProps) {
  const { slug } = await params;
  try {
    const { landingPage } = await growthApi.landingPage(slug);
    return buildMetadata({
      title: landingPage.name,
      description: landingPage.cmsPage?.seoDescription ?? landingPage.name,
      path: `/campaigns/${slug}`,
    });
  } catch {
    return buildMetadata({ title: "Campaign", path: `/campaigns/${slug}`, noIndex: true });
  }
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const { slug } = await params;

  let landingPage;
  try {
    ({ landingPage } = await growthApi.landingPage(slug));
  } catch {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: landingPage.name,
          url: `/campaigns/${landingPage.slug}`,
        }}
      />
      <LandingPageRenderer page={landingPage} />
    </>
  );
}
