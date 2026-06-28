import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { growthApi } from "@/lib/api/growth";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/products", "/blog", "/ai", "/login", "/register", "/account", "/enterprise"];
  const staticEntries = staticRoutes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? ("daily" as const) : ("weekly" as const),
    priority: route === "" ? 1 : 0.7,
  }));

  try {
    const dynamic = await growthApi.sitemap();
    const dynamicEntries = [...dynamic.pages, ...dynamic.blogs, ...dynamic.landingPages, ...dynamic.products].map(
      (entry) => ({
        url: `${siteConfig.url}${entry.path}`,
        lastModified: new Date(entry.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }),
    );
    return [...staticEntries, ...dynamicEntries];
  } catch {
    return staticEntries;
  }
}
