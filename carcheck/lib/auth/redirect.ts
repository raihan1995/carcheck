export function safeRedirectPath(
  path: string | null | undefined,
  fallback = "/dashboard/reports"
): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return fallback;
  return path;
}

/** Canonical app origin for auth redirects (set NEXT_PUBLIC_APP_URL on Vercel). */
export function getAuthOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) return configured;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export function buildAuthCallbackUrl(
  nextPath: string | null | undefined,
  origin?: string
): string {
  const base = origin ?? getAuthOrigin();
  const next = safeRedirectPath(nextPath);
  return `${base}/auth/callback?next=${encodeURIComponent(next)}`;
}
