export function isAllowedCorsOrigin(origin: string | undefined, allowedOrigins: string[]): boolean {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  try {
    const hostname = new URL(origin).hostname;
    if (hostname.endsWith(".vercel.app") || hostname === "vercel.app") {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export function mergeWebOrigins(origins: string[], frontendUrl?: string): string[] {
  const merged = [...origins];
  if (frontendUrl && !merged.includes(frontendUrl)) {
    merged.push(frontendUrl);
  }
  return merged;
}
