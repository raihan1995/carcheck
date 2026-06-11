import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { validatePassword } from "@/lib/auth/password";
import { assertAuthSecretConfigured, createSessionToken, sessionCookieOptions } from "@/lib/auth/session";
import { createUser, findUserByEmail, normalizeEmail, normalizeName } from "@/lib/auth/users";

export const runtime = "nodejs";

type RegisterBody = {
  firstName?: string;
  surname?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterBody;
    const firstName = normalizeName(body.firstName ?? "");
    const surname = normalizeName(body.surname ?? "");
    const email = normalizeEmail(body.email ?? "");
    const password = body.password ?? "";
    const confirmPassword = body.confirmPassword ?? "";

    const fieldErrors: Record<string, string> = {};

    if (!firstName) fieldErrors.firstName = "First name is required.";
    if (!surname) fieldErrors.surname = "Surname is required.";

    if (!email) fieldErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fieldErrors.email = "Enter a valid email address.";
    }

    const passwordError = validatePassword(password);
    if (passwordError) fieldErrors.password = passwordError;

    if (password !== confirmPassword) {
      fieldErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json({ error: "Validation failed.", fieldErrors }, { status: 400 });
    }

    assertAuthSecretConfigured();

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists.", fieldErrors: { email: "Email already in use." } },
        { status: 409 }
      );
    }

    const user = await createUser({ firstName, surname, email, password });
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      firstName: user.first_name,
      surname: user.surname,
    });

    const cookieStore = await cookies();
    cookieStore.set(sessionCookieOptions(token));

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        surname: user.surname,
      },
    });
  } catch (err) {
    console.error("[auth/register]", err);
    const message = err instanceof Error ? err.message : "Registration failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
