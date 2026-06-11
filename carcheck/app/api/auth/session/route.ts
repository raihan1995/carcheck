import { NextResponse } from "next/server";

import { getSessionFromCookies } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({ user: session });
  } catch {
    return NextResponse.json({ user: null });
  }
}
