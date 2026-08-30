import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { TOOLS } from "@/tools";

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), "data", "dokits.db");

let _db: Database.Database | null = null;

export function db(): Database.Database {
  if (_db) return _db;
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  migrate(_db);
  seedCategories(_db);
  syncTools(_db);
  return _db;
}

/* هجرات مرقّمة عبر user_version — الهجرة تُضاف ولا تُعدَّل بعد شحنها */
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

function seedCategories(d: Database.Database) {
  const count = (d.prepare("SELECT COUNT(*) c FROM categories").get() as { c: number }).c;
  if (count > 0) return;
  const ins = d.prepare("INSERT INTO categories (slug, name_ar, sort) VALUES (?, ?, ?)");
  const seed: Array<[string, string, number]> = [
    ["docs", "نصوص ومستندات", 1],
    ["business", "حسابات وأعمال", 2],
    ["convert", "تحويلات وقياسات", 3],
    ["dev", "مطوّرون", 4],
    ["design", "تصميم", 5],
  ];
  const tx = d.transaction(() => seed.forEach((row) => ins.run(...row)));
  tx();
}

/* الأدوات المسجَّلة في tools/index.ts هي المصدر — القاعدة مرآتها (تبقى صفوف المعطَّلة لحفظ المفضّلات) */
function syncTools(d: Database.Database) {
  const upsert = d.prepare(`
    INSERT INTO tools (slug, name_ar, description_ar, category_slug, icon, version, enabled, sort)
    VALUES (@slug, @nameAr, @descriptionAr, @category, @icon, @version, 1, @sort)
    ON CONFLICT(slug) DO UPDATE SET
      name_ar = excluded.name_ar,
      description_ar = excluded.description_ar,
      category_slug = excluded.category_slug,
      icon = excluded.icon,
      version = excluded.version,
      enabled = 1,
      sort = excluded.sort
  `);
  const tx = d.transaction(() => {
    d.prepare("UPDATE tools SET enabled = 0").run();
    TOOLS.forEach((t, i) =>
      upsert.run({ slug: t.slug, nameAr: t.nameAr, descriptionAr: t.descriptionAr, category: t.category, icon: t.icon, version: t.version, sort: i }),
    );
  });
  tx();
}

/* ————— استعلامات القراءة ————— */

export type CategoryRow = { id: number; slug: string; name_ar: string; sort: number; tools_count: number };
export type ToolRow = {
  id: number; slug: string; name_ar: string; description_ar: string;
  category_slug: string; icon: string; version: string; fav: number;
};

export function listCategories(): CategoryRow[] {
  return db()
    .prepare(`
      SELECT c.*, (SELECT COUNT(*) FROM tools t WHERE t.category_slug = c.slug AND t.enabled = 1) tools_count
      FROM categories c ORDER BY c.sort, c.id
    `)
    .all() as CategoryRow[];
}

export function listEnabledTools(userId?: number): ToolRow[] {
  return db()
    .prepare(`
      SELECT t.id, t.slug, t.name_ar, t.description_ar, t.category_slug, t.icon, t.version,
             CASE WHEN f.user_id IS NULL THEN 0 ELSE 1 END fav
      FROM tools t
      LEFT JOIN favorites f ON f.tool_id = t.id AND f.user_id = ?
      WHERE t.enabled = 1
      ORDER BY t.sort, t.id
    `)
    .all(userId ?? -1) as ToolRow[];
}
