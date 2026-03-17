import Script from "next/script";

/**
 * Umami analytics (https://umami.is/). Privacy-friendly, no cookies.
 * Set NEXT_PUBLIC_UMAMI_WEBSITE_ID in .env (get it from https://cloud.umami.is/settings/websites).
 * Optional: NEXT_PUBLIC_UMAMI_SCRIPT_URL for self-hosted (defaults to cloud.umami.is).
 */
export function UmamiAnalytics() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const scriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || "https://cloud.umami.is/script.js";

  if (!websiteId) return null;

  return (
    <Script
      src={scriptUrl}
      data-website-id={websiteId}
      strategy="afterInteractive"
    />
  );
}
