"use client";

/**
 * طبقةُ تخزينٍ موحّدة — الأدواتُ لا تلمس localStorage مباشرةً.
 *
 * السببُ عمليّ: يومَ نضيف خدمةً خلفيّةً للمسودّات لا نعدّل أداةً واحدة، بل
 * نبدّل المحوِّل. وكلُّ عمليّةٍ غيرُ متزامنةٍ من اليوم كي لا تتغيّر التواقيعُ لاحقاً.
 */

export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  keys(prefix?: string): Promise<string[]>;
}

const NS = "dokits:";

/** المتصفّح — قد يرمي في نافذةٍ خاصّةٍ أو مع حظر تخزين المواقع */
export class LocalAdapter implements StorageAdapter {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = localStorage.getItem(NS + key);
      return raw === null ? null : (JSON.parse(raw) as T);
    } catch { return null; }
  }
  async set<T>(key: string, value: T): Promise<void> {
    try { localStorage.setItem(NS + key, JSON.stringify(value)); } catch { /* ممتلئٌ أو محظور */ }
  }
  async remove(key: string): Promise<void> {
    try { localStorage.removeItem(NS + key); } catch { /* لا شيء */ }
  }
  async keys(prefix = ""): Promise<string[]> {
    try {
      return Object.keys(localStorage)
        .filter((k) => k.startsWith(NS + prefix))
        .map((k) => k.slice(NS.length));
    } catch { return []; }
  }
}

/** بديلٌ صامتٌ حين يُمنع التخزين — الواجهةُ تبقى تعمل بلا حفظ */
export class MemoryAdapter implements StorageAdapter {
  private m = new Map<string, unknown>();
  async get<T>(key: string) { return (this.m.get(key) as T) ?? null; }
  async set<T>(key: string, value: T) { this.m.set(key, value); }
  async remove(key: string) { this.m.delete(key); }
  async keys(prefix = "") { return [...this.m.keys()].filter((k) => k.startsWith(prefix)); }
}

let adapter: StorageAdapter | null = null;

export function storage(): StorageAdapter {
  if (adapter) return adapter;
  const usable = (() => {
    try {
      const k = NS + "__probe";
      localStorage.setItem(k, "1");
      localStorage.removeItem(k);
      return true;
    } catch { return false; }
  })();
  adapter = usable ? new LocalAdapter() : new MemoryAdapter();
  return adapter;
}

/** لاستبدال المحوِّل مستقبلاً بواجهةِ خادم */
export function setStorageAdapter(a: StorageAdapter) { adapter = a; }

/* ————— مفاتيحُ المنصّة ————— */

export const KEYS = {
  favorites: "favorites",
  recent: "recent",
  draft: (slug: string) => `draft:${slug}`,
} as const;

export type RecentEntry = { slug: string; at: number };

const RECENT_MAX = 12;

export async function getLocalFavorites(): Promise<string[]> {
  return (await storage().get<string[]>(KEYS.favorites)) ?? [];
}

export async function toggleLocalFavorite(slug: string): Promise<string[]> {
  const cur = await getLocalFavorites();
  const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug];
  await storage().set(KEYS.favorites, next);
  return next;
}

export async function getRecent(): Promise<RecentEntry[]> {
  return (await storage().get<RecentEntry[]>(KEYS.recent)) ?? [];
}

export async function pushRecent(slug: string, now: number): Promise<void> {
  const cur = await getRecent();
  const next = [{ slug, at: now }, ...cur.filter((r) => r.slug !== slug)].slice(0, RECENT_MAX);
  await storage().set(KEYS.recent, next);
}

/** مسودّةُ أداة — تبقى في جهاز المستخدم ولا تُرسَل */
export async function getDraft<T>(slug: string): Promise<T | null> {
  return storage().get<T>(KEYS.draft(slug));
}
export async function setDraft<T>(slug: string, value: T): Promise<void> {
  return storage().set(KEYS.draft(slug), value);
}
