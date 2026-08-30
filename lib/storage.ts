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
  templates: (slug: string) => `tpl:${slug}`,
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
  if (value === null) return storage().remove(KEYS.draft(slug));
  return storage().set(KEYS.draft(slug), value);
}

export type DraftEntry = { slug: string; at: number };

/** كلُّ المسودّات المحفوظة — لعرضها في «لوحتي» */
export async function listDrafts(): Promise<DraftEntry[]> {
  const keys = await storage().keys("draft:");
  const out: DraftEntry[] = [];
  for (const k of keys) {
    const slug = k.slice("draft:".length);
    const d = await storage().get<{ at?: number }>(k);
    if (d && typeof d.at === "number") out.push({ slug, at: d.at });
  }
  return out.sort((a, b) => b.at - a.at);
}

export async function removeDraft(slug: string): Promise<void> {
  return storage().remove(KEYS.draft(slug));
}

/**
 * القالبُ مسودّةٌ مسمّاةٌ تُعاد مراراً: «فاتورةُ عميلي الشهريّة»، «تسعيرُ منتجٍ
 * بهامش ٣٠٪». والفرقُ عن المسودّة أنّ المسودّةَ واحدةٌ تُستأنَف، والقالبَ
 * مجموعةٌ تُختار منها — ولذلك لكلٍّ مفتاحُه وواجهتُه.
 */
export type Template<T = unknown> = { id: string; name: string; at: number; snap: T };

export async function listTemplates<T>(slug: string): Promise<Template<T>[]> {
  return (await storage().get<Template<T>[]>(KEYS.templates(slug))) ?? [];
}

export async function saveTemplate<T>(slug: string, name: string, snap: T): Promise<Template<T>[]> {
  const cur = await listTemplates<T>(slug);
  const id = `${Date.now().toString(36)}${cur.length}`;
  const next = [{ id, name: name.trim() || "قالب", at: Date.now(), snap }, ...cur].slice(0, 20);
  await storage().set(KEYS.templates(slug), next);
  return next;
}

export async function removeTemplate<T>(slug: string, id: string): Promise<Template<T>[]> {
  const next = (await listTemplates<T>(slug)).filter((t) => t.id !== id);
  await storage().set(KEYS.templates(slug), next);
  return next;
}

/** كلُّ القوالب عبر الأدوات — لعرضها في «لوحتي» */
export async function allTemplates(): Promise<{ slug: string; count: number }[]> {
  const keys = await storage().keys("tpl:");
  const out: { slug: string; count: number }[] = [];
  for (const k of keys) {
    const list = (await storage().get<Template[]>(k)) ?? [];
    if (list.length) out.push({ slug: k.slice("tpl:".length), count: list.length });
  }
  return out;
}
