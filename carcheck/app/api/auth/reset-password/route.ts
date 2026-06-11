import { NextResponse } from "next/server";

import { validatePassword } from "@/lib/auth/password";
import { consumePasswordResetToken, updateUserPassword } from "@/lib/auth/users";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string;
      password?: string;
      confirmPassword?: string;
    };

    const token = body.token?.trim() ?? "";
    const password = body.password ?? "";
    const confirmPassword = body.confirmPassword ?? "";

    const fieldErrors: Record<string, string> = {};

    if (!token) fieldErrors.token = "Reset link is invalid or expired.";

    const passwordError = validatePassword(password);
    if (passwordError) fieldErrors.password = passwordError;

    if (password !== confirmPassword) {
      fieldErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json({ error: "Validation failed.", fieldErrors }, { status: 400 });
    }

    const user = await consumePasswordResetToken(token);
    if (!user) {
      return NextResponse.json(
        { error: "Reset link is invalid or expired.", fieldErrors: { token: "Reset link is invalid or expired." } },
        { status: 400 }
      );
    }

    await updateUserPassword(user.id, password);

    return NextResponse.json({ ok: true, message: "Password updated. You can log in now." });
  } catch (err) {
    console.error("[auth/reset-password]", err);
    return NextResponse.json({ error: "Could not reset password." }, { status: 500 });
  }
}
