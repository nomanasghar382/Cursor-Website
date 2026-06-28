/**
 * Public base URL for hosted platforms (Render, Railway, etc.).
 * Used when APP_BASE_URL / BETTER_AUTH_URL are not set explicitly.
 */
export function platformExternalUrl(): string | undefined {
  const renderUrl = process.env.RENDER_EXTERNAL_URL;
  if (renderUrl && renderUrl.length > 0) {
    return renderUrl;
  }

  const railwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN;
  if (railwayDomain && railwayDomain.length > 0) {
    return railwayDomain.startsWith("http://") || railwayDomain.startsWith("https://")
      ? railwayDomain
      : `https://${railwayDomain}`;
  }

  return undefined;
}
