import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "revveal_session";
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

export type SessionUser = {
  userId: string;
  email: string;
  firstName: string;
  surname: string;
};

const DEV_FALLBACK_SECRET = "revveal-dev-auth-secret-min-32-chars!";

function resolveAuthSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim();
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "development") return DEV_FALLBACK_SECRET;
  throw new Error(
    "AUTH_SECRET must be set and at least 32 characters. Add it to your .env file."
  );
}

function getSecret(): Uint8Array {
  return new TextEncoder().encode(resolveAuthSecret());
}

export function assertAuthSecretConfigured(): void {
  resolveAuthSecret();
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    userId: user.userId,
    email: user.email,
    firstName: user.firstName,
    surname: user.surname,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SEC}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const userId = payload.userId;
    const email = payload.email;
    const firstName = payload.firstName;
    const surname = payload.surname;
    if (
      typeof userId !== "string" ||
      typeof email !== "string" ||
      typeof firstName !== "string" ||
      typeof surname !== "string"
    ) {
      return null;
    }
    return { userId, email, firstName, surname };
  } catch {
    return null;
  }
}

export async function getSessionFromCookies(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function sessionCookieOptions(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  };
}

export function clearSessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}
