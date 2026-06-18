import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin: requestOrigin } = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const origin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : requestOrigin;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // #region agent log
  fetch("http://127.0.0.1:7262/ingest/fbf9e753-63c7-4ffb-88d0-2b22eec917a8", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "5b635c" },
    body: JSON.stringify({
      sessionId: "5b635c",
      hypothesisId: "E",
      location: "auth/callback/route.ts:GET",
      message: "Auth callback hit",
      data: {
        requestOrigin,
        resolvedOrigin: origin,
        forwardedHost,
        hasCode: !!code,
        next,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback`);
}
