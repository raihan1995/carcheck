import { NextResponse } from "next/server";

import { sendPasswordResetEmail } from "@/lib/auth/email";
import { createPasswordResetToken, findUserByEmail, normalizeEmail } from "@/lib/auth/users";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = normalizeEmail(body.email ?? "");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (user) {
      const token = await createPasswordResetToken(user.id);
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
      const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
      await sendPasswordResetEmail(user.email, resetUrl);
    }

    // Always return success to avoid email enumeration.
    return NextResponse.json({
      ok: true,
      message: "If an account exists for that email, we sent password reset instructions.",
    });
  } catch (err) {
    console.error("[auth/forgot-password]", err);
    return NextResponse.json({ error: "Could not process request." }, { status: 500 });
  }
}
