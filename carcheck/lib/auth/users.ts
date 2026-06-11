import { randomBytes, randomUUID, createHash } from "crypto";

import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";

export type DbUser = {
  id: string;
  first_name: string;
  surname: string;
  email: string;
  password_hash: string;
  created_at: string;
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeName(name: string): string {
  return name.trim();
}

export async function findUserById(id: string): Promise<DbUser | null> {
  const db = await getDb();
  const result = await db.execute({
    sql: "SELECT id, first_name, surname, email, password_hash, created_at FROM users WHERE id = ? LIMIT 1",
    args: [id],
  });
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: String(row.id),
    first_name: String(row.first_name),
    surname: String(row.surname),
    email: String(row.email),
    password_hash: String(row.password_hash),
    created_at: String(row.created_at),
  };
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const db = await getDb();
  const normalized = normalizeEmail(email);
  const result = await db.execute({
    sql: "SELECT id, first_name, surname, email, password_hash, created_at FROM users WHERE email = ? LIMIT 1",
    args: [normalized],
  });
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: String(row.id),
    first_name: String(row.first_name),
    surname: String(row.surname),
    email: String(row.email),
    password_hash: String(row.password_hash),
    created_at: String(row.created_at),
  };
}

export async function createUser(input: {
  firstName: string;
  surname: string;
  email: string;
  password: string;
}): Promise<DbUser> {
  const db = await getDb();
  const id = randomUUID();
  const passwordHash = await hashPassword(input.password);
  const email = normalizeEmail(input.email);
  const firstName = normalizeName(input.firstName);
  const surname = normalizeName(input.surname);

  await db.execute({
    sql: `INSERT INTO users (id, first_name, surname, email, password_hash)
          VALUES (?, ?, ?, ?, ?)`,
    args: [id, firstName, surname, email, passwordHash],
  });

  return {
    id,
    first_name: firstName,
    surname: surname,
    email,
    password_hash: passwordHash,
    created_at: new Date().toISOString(),
  };
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  const db = await getDb();
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const id = randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  await db.execute({
    sql: `INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at)
          VALUES (?, ?, ?, ?)`,
    args: [id, userId, tokenHash, expiresAt],
  });

  return rawToken;
}

export async function consumePasswordResetToken(
  rawToken: string
): Promise<DbUser | null> {
  const db = await getDb();
  const tokenHash = hashToken(rawToken);
  const now = new Date().toISOString();

  const result = await db.execute({
    sql: `SELECT t.id AS token_id, u.id, u.first_name, u.surname, u.email, u.password_hash, u.created_at
          FROM password_reset_tokens t
          JOIN users u ON u.id = t.user_id
          WHERE t.token_hash = ? AND t.used_at IS NULL AND t.expires_at > ?
          LIMIT 1`,
    args: [tokenHash, now],
  });

  const row = result.rows[0];
  if (!row) return null;

  await db.execute({
    sql: "UPDATE password_reset_tokens SET used_at = ? WHERE id = ?",
    args: [now, String(row.token_id)],
  });

  return {
    id: String(row.id),
    first_name: String(row.first_name),
    surname: String(row.surname),
    email: String(row.email),
    password_hash: String(row.password_hash),
    created_at: String(row.created_at),
  };
}

export async function updateUserPassword(userId: string, password: string): Promise<void> {
  const db = await getDb();
  const passwordHash = await hashPassword(password);
  await db.execute({
    sql: "UPDATE users SET password_hash = ? WHERE id = ?",
    args: [passwordHash, userId],
  });
}
