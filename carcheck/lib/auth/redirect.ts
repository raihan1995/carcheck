export function safeRedirectPath(
  path: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!path || !path.startsWith("/") || /[\\\u0000-\u0020]/.test(path))
    return fallback;
  try {
    const base = "https://revveal.invalid";
    const target = new URL(path, base);
    if (target.origin !== base) return fallback;
    return target.pathname + target.search + target.hash;
  } catch {
    return fallback;
  }
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
  origin?: string,
): string {
  const base = origin ?? getAuthOrigin();
  const next = safeRedirectPath(nextPath);
  return `${base}/auth/callback?next=${encodeURIComponent(next)}`;
}
