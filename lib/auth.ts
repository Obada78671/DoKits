import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { hash as argonHash, verify as argonVerify } from "@node-rs/argon2";
import { db } from "@/lib/db";

const COOKIE = "dk_session";
const SESSION_DAYS = 30;

/* معايير OWASP لـ argon2id */
const ARGON_OPTS = { memoryCost: 19456, timeCost: 2, parallelism: 1 };

export function hashPassword(password: string): Promise<string> {
  return argonHash(password, ARGON_OPTS);
}

export function verifyPassword(hashStr: string, password: string): Promise<boolean> {
  return argonVerify(hashStr, password).catch(() => false);
}

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export type SessionUser = { id: number; username: string; email: string; role: string };

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("base64url");
  const expires = Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400;
  db().prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(sha256(token), userId, expires);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
}

/* تُخزَّن الجلسة ببصمة sha256 — سرقة القاعدة لا تعطي رموزاً صالحة */
export const getUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const row = db()
    .prepare(`
      SELECT u.id, u.username, u.email, u.role, s.token_hash, s.expires_at, s.last_used_at
      FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ?
    `)
    .get(sha256(token)) as (SessionUser & { token_hash: string; expires_at: number; last_used_at: number }) | undefined;
  if (!row) return null;
  const now = Math.floor(Date.now() / 1000);
  if (row.expires_at < now) {
    db().prepare("DELETE FROM sessions WHERE token_hash = ?").run(row.token_hash);
    return null;
  }
  if (now - row.last_used_at > 3600) {
    db().prepare("UPDATE sessions SET last_used_at = ? WHERE token_hash = ?").run(now, row.token_hash);
  }
  return { id: row.id, username: row.username, email: row.email, role: row.role };
});

export async function destroyCurrentSession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) db().prepare("DELETE FROM sessions WHERE token_hash = ?").run(sha256(token));
  store.delete(COOKIE);
}

export async function destroyAllSessions(userId: number) {
  db().prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
  (await cookies()).delete(COOKIE);
}

export function countSessions(userId: number): number {
  return (db().prepare("SELECT COUNT(*) c FROM sessions WHERE user_id = ? AND expires_at > unixepoch()").get(userId) as { c: number }).c;
}
