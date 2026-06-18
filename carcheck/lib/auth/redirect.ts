export function safeRedirectPath(
  path: string | null | undefined,
  fallback = "/dashboard/reports"
): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return fallback;
  return path;
}

export function buildAuthCallbackUrl(
  origin: string,
  nextPath: string | null | undefined
): string {
  const next = safeRedirectPath(nextPath);
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}
