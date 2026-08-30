"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, toolIdBySlug } from "@/lib/db";
import {
  createSession, destroyAllSessions, destroyCurrentSession, getUser,
  hashPassword, verifyPassword,
} from "@/lib/auth";
import { clientKey, take } from "@/lib/rate-limit";
import { consumeCode, countCodes, issueCodes } from "@/lib/recovery";
import { CATEGORIES } from "@/tools/categories";

export type FormState = { error?: string; ok?: string };

const USERNAME_RE = /^[a-zA-Z0-9_]{3,32}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ————— تسجيل ————— */
export async function registerAction(_prev: FormState, form: FormData): Promise<FormState> {
  const username = String(form.get("username") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");

  if (!USERNAME_RE.test(username))
    return { error: "اسم المستخدم: أحرف لاتينيّة وأرقام و_ فقط، من ٣ إلى ٣٢ محرفاً." };
  if (!EMAIL_RE.test(email)) return { error: "البريد الإلكترونيّ غير صالح." };
  if (password.length < 10) return { error: "كلمة المرور قصيرة — ١٠ محارف على الأقلّ." };
  if (password !== confirm) return { error: "كلمتا المرور غير متطابقتين." };

  if (!take(`reg:${await clientKey()}`, 5, 60 * 60 * 1000))
    return { error: "محاولات كثيرة — انتظر قليلاً ثمّ أعد المحاولة." };

  const exists = db()
    .prepare("SELECT username, email FROM users WHERE username = ? OR email = ?")
    .get(username, email) as { username: string; email: string } | undefined;
  if (exists)
    return {
      error: exists.username.toLowerCase() === username.toLowerCase()
        ? "اسم المستخدم محجوز — اختر غيره."
        : "هذا البريد مسجَّل من قبل — جرّب الدخول.",
    };

  const password_hash = await hashPassword(password);
  const info = db()
    .prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)")
    .run(username, email, password_hash);
  await createSession(Number(info.lastInsertRowid));
  redirect("/");
}

/* ————— دخول ————— */
export async function loginAction(_prev: FormState, form: FormData): Promise<FormState> {
  const identifier = String(form.get("identifier") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!identifier || !password) return { error: "أدخل المعرّف وكلمة المرور." };

  const ipOk = take(`login:ip:${await clientKey()}`, 20, 15 * 60 * 1000);
  const idOk = take(`login:id:${identifier.toLowerCase()}`, 10, 15 * 60 * 1000);
  if (!ipOk || !idOk) return { error: "محاولات كثيرة — انتظر ربع ساعة ثمّ أعد المحاولة." };

  const user = db()
    .prepare("SELECT id, password_hash FROM users WHERE username = ? OR email = ?")
    .get(identifier, identifier.toLowerCase()) as { id: number; password_hash: string } | undefined;

  const valid = user ? await verifyPassword(user.password_hash, password) : false;
  if (!user || !valid) return { error: "المعرّف أو كلمة المرور غير صحيحة." };

  await createSession(user.id);
  redirect("/");
}

export async function signOutAction() {
  await destroyCurrentSession();
  redirect("/");
}

/* ————— الحساب ————— */
export async function changePasswordAction(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) redirect("/login");
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  if (next.length < 10) return { error: "كلمة المرور الجديدة قصيرة — ١٠ محارف على الأقلّ." };
  if (next !== confirm) return { error: "كلمتا المرور غير متطابقتين." };

  const row = db().prepare("SELECT password_hash FROM users WHERE id = ?").get(user.id) as { password_hash: string };
  if (!(await verifyPassword(row.password_hash, current)))
    return { error: "كلمة المرور الحاليّة غير صحيحة." };

  db()
    .prepare("UPDATE users SET password_hash = ?, updated_at = unixepoch() WHERE id = ?")
    .run(await hashPassword(next), user.id);
  return { ok: "بُدّلت كلمة المرور." };
}

export async function signOutAllAction() {
  const user = await getUser();
  if (!user) redirect("/login");
  await destroyAllSessions(user.id);
  redirect("/login");
}

/* ————— المفضّلة وسجلُّ الاستخدام ————— */

export async function toggleFavoriteAction(slug: string) {
  const user = await getUser();
  if (!user) redirect("/login");
  const toolId = toolIdBySlug(slug);
  if (toolId === null) return;
  const d = db();
  const existing = d.prepare("SELECT 1 x FROM favorites WHERE user_id = ? AND tool_id = ?").get(user.id, toolId);
  if (existing) d.prepare("DELETE FROM favorites WHERE user_id = ? AND tool_id = ?").run(user.id, toolId);
  else d.prepare("INSERT INTO favorites (user_id, tool_id) VALUES (?, ?)").run(user.id, toolId);
  revalidatePath("/");
  revalidatePath("/my");
}

/** يرفع مفضّلةَ الزائر إلى حسابه بعد الدخول — يُرجع عددَ ما أُضيف */
export async function mergeLocalFavoritesAction(slugs: string[]): Promise<number> {
  const user = await getUser();
  if (!user || slugs.length === 0) return 0;
  const d = db();
  const ins = d.prepare("INSERT OR IGNORE INTO favorites (user_id, tool_id) VALUES (?, ?)");
  let added = 0;
  d.transaction(() => {
    for (const s of slugs.slice(0, 200)) {
      const id = toolIdBySlug(s);
      if (id !== null) added += ins.run(user.id, id).changes;
    }
  })();
  if (added) { revalidatePath("/"); revalidatePath("/my"); }
  return added;
}

/** سجلُّ الاستخدام للمستخدم المسجَّل — اسمُ الأداة والوقتُ فقط */
export async function recordUsageAction(slug: string) {
  const user = await getUser();
  if (!user || toolIdBySlug(slug) === null) return;
  db()
    .prepare(`
      INSERT INTO tool_usage (user_id, tool_slug, used_at, uses) VALUES (?, ?, unixepoch(), 1)
      ON CONFLICT(user_id, tool_slug) DO UPDATE SET used_at = unixepoch(), uses = uses + 1
    `)
    .run(user.id, slug);
}

/* ————— إدارة التصنيفات (admin) ————— */
async function requireAdmin() {
  const user = await getUser();
  if (!user || user.role !== "admin") redirect("/");
  return user;
}

const SLUG_RE = /^[a-z0-9-]{2,32}$/;

export async function addCategoryAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const slug = String(form.get("slug") ?? "").trim().toLowerCase();
  const name = String(form.get("name") ?? "").trim();
  if (!SLUG_RE.test(slug)) return { error: "المعرّف اللاتينيّ: أحرف صغيرة وأرقام و- فقط." };
  if (name.length < 2) return { error: "أدخل اسماً عربيّاً." };
  const d = db();
  if (d.prepare("SELECT 1 x FROM categories WHERE slug = ?").get(slug)) return { error: "المعرّف موجود." };
  const max = (d.prepare("SELECT COALESCE(MAX(sort),0) m FROM categories").get() as { m: number }).m;
  d.prepare("INSERT INTO categories (slug, name_ar, sort) VALUES (?, ?, ?)").run(slug, name, max + 1);
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { ok: `أُضيف تصنيف «${name}».` };
}

/** التسميةُ تجاوزٌ على السجلّ — تُعلَّم كي لا تعيدها المزامنةُ عند الإقلاع */
export async function renameCategoryAction(id: number, form: FormData) {
  await requireAdmin();
  const name = String(form.get("name") ?? "").trim();
  if (name.length < 2) return;
  db().prepare("UPDATE categories SET name_ar = ?, name_overridden = 1 WHERE id = ?").run(name, id);
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

/** يُعيد التصنيفَ إلى اسمه في السجلّ */
export async function resetCategoryNameAction(id: number) {
  await requireAdmin();
  const d = db();
  const row = d.prepare("SELECT slug FROM categories WHERE id = ?").get(id) as { slug: string } | undefined;
  const def = row ? CATEGORIES.find((c) => c.id === row.slug) : undefined;
  if (def) d.prepare("UPDATE categories SET name_ar = ?, name_overridden = 0 WHERE id = ?").run(def.name, id);
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function deleteCategoryAction(id: number) {
  await requireAdmin();
  const d = db();
  const row = d.prepare("SELECT slug FROM categories WHERE id = ?").get(id) as { slug: string } | undefined;
  if (row && CATEGORIES.some((c) => c.id === row.slug)) redirect("/admin/categories?err=registry");
  const used = (d.prepare(`
    SELECT COUNT(*) c FROM tools t JOIN categories c2 ON c2.slug = t.category_slug WHERE c2.id = ?
  `).get(id) as { c: number }).c;
  if (used > 0) redirect("/admin/categories?err=used");
  d.prepare("DELETE FROM categories WHERE id = ?").run(id);
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function moveCategoryAction(id: number, dir: number) {
  await requireAdmin();
  const d = db();
  const all = d.prepare("SELECT id FROM categories ORDER BY sort, id").all() as { id: number }[];
  const idx = all.findIndex((c) => c.id === id);
  const swap = idx + (dir > 0 ? 1 : -1);
  if (idx < 0 || swap < 0 || swap >= all.length) return;
  [all[idx], all[swap]] = [all[swap], all[idx]];
  const upd = d.prepare("UPDATE categories SET sort = ? WHERE id = ?");
  d.transaction(() => all.forEach((c, i) => upd.run(i + 1, c.id)))();
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

/* ————— استعادةُ الحساب ————— */

export async function issueRecoveryCodesAction(): Promise<{ codes?: string[]; error?: string }> {
  const user = await getUser();
  if (!user) return { error: "سجّل الدخولَ أوّلاً." };
  if (!take(`recovery:issue:${user.id}`, 5, 60 * 60 * 1000)) {
    return { error: "طلباتٌ كثيرة — انتظر ساعةً ثمّ أعد المحاولة." };
  }
  return { codes: await issueCodes(user.id) };
}

export async function recoveryCodeCount(): Promise<number> {
  const user = await getUser();
  return user ? countCodes(user.id) : 0;
}

/**
 * الاستعادةُ بالرمز — أضيقُ من الدخول في حدّ المعدّل لأنّها آخرُ بابٍ للحساب.
 *
 * وثلاثةُ أشياءَ تجري معاً عند النجاح: يُستهلك الرمز، وتُبدَّل كلمةُ المرور،
 * و**تُنهى كلُّ الجلسات**. فمن نسي كلمتَه قد يكون فقد جهازاً أو سُرق منه —
 * وترْكُ جلسةٍ قديمةٍ حيّةً بعد الاستعادة يُبقي البابَ الذي جاء منه المهاجم.
 */
export async function recoverAction(_prev: FormState, form: FormData): Promise<FormState> {
  const identifier = String(form.get("identifier") ?? "").trim();
  const code = String(form.get("code") ?? "");
  const password = String(form.get("password") ?? "");
  if (!identifier || !code || !password) return { error: "أكمل الحقولَ الثلاثة." };
  if (password.length < 8) return { error: "كلمةُ المرور الجديدة ثمانيةُ محارفَ فأكثر." };

  const ipOk = take(`recover:ip:${await clientKey()}`, 8, 60 * 60 * 1000);
  const idOk = take(`recover:id:${identifier.toLowerCase()}`, 5, 60 * 60 * 1000);
  if (!ipOk || !idOk) return { error: "محاولات كثيرة — انتظر ساعةً ثمّ أعد المحاولة." };

  const user = db()
    .prepare("SELECT id FROM users WHERE username = ? OR email = ?")
    .get(identifier, identifier.toLowerCase()) as { id: number } | undefined;

  // رسالةٌ واحدةٌ للحالتين: لا نكشف أيُّ المعرّفات موجودٌ في القاعدة
  const ok = user ? await consumeCode(user.id, code) : false;
  if (!user || !ok) return { error: "المعرّفُ أو رمزُ الاستعادة غير صحيح." };

  const hash = await hashPassword(password);
  db().prepare("UPDATE users SET password_hash = ?, updated_at = unixepoch() WHERE id = ?").run(hash, user.id);
  destroyAllSessions(user.id);
  await createSession(user.id);
  redirect("/account?recovered=1");
}
