import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { TOOLS } from "@/tools";
import { CATEGORIES } from "@/tools/categories";
import { publishedTools } from "@/tools/registry";

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), "data", "dokits.db");

let _db: Database.Database | null = null;

export function db(): Database.Database {
  if (_db) return _db;
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  migrate(_db);
  syncCategories(_db);
  syncTools(_db);
  return _db;
}

/* الهجراتُ تُضاف ولا تُعدَّل بعد شحنها */
const MIGRATIONS: string[] = [
  `
  CREATE TABLE users (
    id            INTEGER PRIMARY KEY,
    username      TEXT NOT NULL UNIQUE COLLATE NOCASE,
    email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'user',
    created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE TABLE sessions (
    token_hash   TEXT PRIMARY KEY,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
    expires_at   INTEGER NOT NULL,
    last_used_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE INDEX idx_sessions_user ON sessions(user_id);
  CREATE TABLE categories (
    id      INTEGER PRIMARY KEY,
    slug    TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL,
    sort    INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE tools (
    id             INTEGER PRIMARY KEY,
    slug           TEXT NOT NULL UNIQUE,
    name_ar        TEXT NOT NULL,
    description_ar TEXT NOT NULL DEFAULT '',
    category_slug  TEXT NOT NULL REFERENCES categories(slug) ON UPDATE CASCADE,
    icon           TEXT NOT NULL DEFAULT 'tool',
    version        TEXT NOT NULL DEFAULT '0.1.0',
    enabled        INTEGER NOT NULL DEFAULT 1,
    sort           INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE favorites (
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tool_id    INTEGER NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    PRIMARY KEY (user_id, tool_id)
  );
  `,
  // ٢ — بنيةُ المنصّة: تصنيفٌ فرعيّ، سجلُّ استخدام، عدّاداتٌ مجمَّعة
  `
  ALTER TABLE tools ADD COLUMN subcategory TEXT;
  ALTER TABLE categories ADD COLUMN name_overridden INTEGER NOT NULL DEFAULT 0;
  CREATE TABLE tool_usage (
    user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tool_slug TEXT NOT NULL,
    used_at   INTEGER NOT NULL DEFAULT (unixepoch()),
    uses      INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (user_id, tool_slug)
  );
  CREATE INDEX idx_usage_recent ON tool_usage(user_id, used_at DESC);
  CREATE TABLE tool_stats (
    tool_slug TEXT PRIMARY KEY,
    views     INTEGER NOT NULL DEFAULT 0,
    searches  INTEGER NOT NULL DEFAULT 0
  );
  `,
];

function migrate(d: Database.Database) {
  const current = d.pragma("user_version", { simple: true }) as number;
  for (let v = current; v < MIGRATIONS.length; v++) {
    d.transaction(() => {
      d.exec(MIGRATIONS[v]);
      d.pragma(`user_version = ${v + 1}`);
    })();
  }
}

/**
 * التصنيفاتُ مصدرُها السجلّ (الشيفرة). القاعدةُ مرآةٌ تحفظ **تجاوزات المدير**:
 * إن سمّى تصنيفاً باسمٍ آخر بقي اسمُه، وإلّا تبع السجلَّ.
 */
function syncCategories(d: Database.Database) {
  const upsert = d.prepare(`
    INSERT INTO categories (slug, name_ar, sort) VALUES (@slug, @name, @sort)
    ON CONFLICT(slug) DO UPDATE SET
      name_ar = CASE WHEN categories.name_overridden = 1 THEN categories.name_ar ELSE excluded.name_ar END
  `);
  d.transaction(() => {
    CATEGORIES.forEach((c, i) => upsert.run({ slug: c.id, name: c.name, sort: i + 1 }));
  })();
}

/** سجلُّ الأدوات هو المصدر — القاعدةُ مرآتُه (وتبقى صفوفُ المعطَّلة لحفظ المفضّلات) */
function syncTools(d: Database.Database) {
  const upsert = d.prepare(`
    INSERT INTO tools (slug, name_ar, description_ar, category_slug, subcategory, icon, version, enabled, sort)
    VALUES (@slug, @title, @description, @category, @subcategory, @icon, @version, 1, @sort)
    ON CONFLICT(slug) DO UPDATE SET
      name_ar = excluded.name_ar, description_ar = excluded.description_ar,
      category_slug = excluded.category_slug, subcategory = excluded.subcategory,
      icon = excluded.icon, version = excluded.version, enabled = 1, sort = excluded.sort
  `);
  const live = publishedTools(TOOLS);
  d.transaction(() => {
    d.prepare("UPDATE tools SET enabled = 0").run();
    live.forEach((t, i) =>
      upsert.run({
        slug: t.slug, title: t.title, description: t.description,
        category: t.category, subcategory: t.subcategory ?? null,
        icon: t.icon, version: t.version, sort: i,
      }),
    );
  })();
}

/* ————— قراءة ————— */

export type CategoryRow = { id: number; slug: string; name_ar: string; sort: number; tools_count: number };

export function listCategories(): CategoryRow[] {
  return db()
    .prepare(`
      SELECT c.id, c.slug, c.name_ar, c.sort,
             (SELECT COUNT(*) FROM tools t WHERE t.category_slug = c.slug AND t.enabled = 1) tools_count
      FROM categories c ORDER BY c.sort, c.id
    `)
    .all() as CategoryRow[];
}

/** أسماءُ التصنيفات كما يراها المستخدم (مع تجاوزات المدير) */
export function categoryNames(): Record<string, string> {
  const rows = db().prepare("SELECT slug, name_ar FROM categories").all() as { slug: string; name_ar: string }[];
  return Object.fromEntries(rows.map((r) => [r.slug, r.name_ar]));
}

export function favoriteSlugs(userId: number): string[] {
  return (db()
    .prepare("SELECT t.slug FROM favorites f JOIN tools t ON t.id = f.tool_id WHERE f.user_id = ?")
    .all(userId) as { slug: string }[]).map((r) => r.slug);
}

export function toolIdBySlug(slug: string): number | null {
  const r = db().prepare("SELECT id FROM tools WHERE slug = ?").get(slug) as { id: number } | undefined;
  return r?.id ?? null;
}

export type RecentRow = { tool_slug: string; used_at: number; uses: number };

export function recentTools(userId: number, limit = 12): RecentRow[] {
  return db()
    .prepare("SELECT tool_slug, used_at, uses FROM tool_usage WHERE user_id = ? ORDER BY used_at DESC LIMIT ?")
    .all(userId, limit) as RecentRow[];
}

/** شعبيّةٌ مجمَّعةٌ لترجيح البحث — بلا أيّ ربطٍ بشخص */
export function popularity(): Record<string, number> {
  const rows = db().prepare("SELECT tool_slug, views FROM tool_stats").all() as { tool_slug: string; views: number }[];
  return Object.fromEntries(rows.map((r) => [r.tool_slug, r.views]));
}
