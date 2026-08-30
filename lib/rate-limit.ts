import "server-only";
import { headers } from "next/headers";

/* حدّ معدّل في الذاكرة فقط — لا يُكتب أيّ عنوان IP إلى قرص أو سجلّ (ذوق البيت) */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function take(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  b.count += 1;
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
  }
  return b.count <= max;
}

export async function clientKey(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim() : "local";
}
