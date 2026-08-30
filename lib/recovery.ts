import "server-only";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth";

/**
 * استعادةُ الحساب برموزٍ يولّدها المستخدمُ مسبقاً — لا ببريد.
 *
 * رابطُ الاستعادة بالبريد يفرض خادمَ بريدٍ ونطاقاً موثوقاً وسمعةَ إرسال؛
 * والخادمُ هنا منزليٌّ خلف نفق، ورسائلُه تنتهي في مجلّد المهملات إن وصلت.
 * وخدمةُ إرسالٍ خارجيّةٌ تعني أنّ بريدَ كلِّ مستخدمٍ يمرّ بطرفٍ ثالث — وذلك
 * ينقض وعدَ «كلُّ شيءٍ على خادمك».
 *
 * فالرموزُ تُولَّد مرّةً ويحفظها المستخدمُ حيث يحفظ كلمةَ مروره. وهي تُخزَّن
 * **مجزَّأةً بـargon2id** كما تُخزَّن كلمةُ المرور: تسريبُ القاعدة لا يعطي
 * سارقَها مفتاحاً جاهزاً. وكلُّ رمزٍ يُستعمل مرّةً واحدة.
 */

/** أبجديّةٌ بلا محارفَ ملتبسة: لا 0/O ولا 1/I/L — الرمزُ يُملى ويُكتب بيد */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const GROUP = 5;
const GROUPS = 2;
export const CODE_COUNT = 8;

/** ‏٥٠ بتّاً لكلّ رمز (31^10) — يكفي كثيراً مع حدِّ المعدّل الصارم أدناه */
export function generateCode(): string {
  const bytes = crypto.getRandomValues(new Uint32Array(GROUP * GROUPS));
  const limit = Math.floor(0xffffffff / ALPHABET.length) * ALPHABET.length;
  const out: string[] = [];
  let i = 0;
  while (out.length < GROUP * GROUPS) {
    const v = bytes[i % bytes.length];
    i++;
    if (v >= limit) { crypto.getRandomValues(bytes); continue; }
    out.push(ALPHABET[v % ALPHABET.length]);
  }
  return out.join("").replace(new RegExp(`(.{${GROUP}})(?=.)`, "g"), "$1-");
}

export const normalizeCode = (raw: string): string =>
  raw.toUpperCase().replace(/[^A-Z0-9]/g, "");

/** يولّد مجموعةً جديدةً ويُبطل ما قبلها — فالمجموعةُ الظاهرةُ هي الصالحةُ وحدَها */
export async function issueCodes(userId: number): Promise<string[]> {
  const codes = Array.from({ length: CODE_COUNT }, generateCode);
  const hashes = await Promise.all(codes.map((c) => hashPassword(normalizeCode(c))));
  const d = db();
  d.transaction(() => {
    d.prepare("DELETE FROM recovery_codes WHERE user_id = ?").run(userId);
    const ins = d.prepare("INSERT INTO recovery_codes (user_id, code_hash) VALUES (?, ?)");
    for (const h of hashes) ins.run(userId, h);
  })();
  return codes;
}

export function countCodes(userId: number): number {
  const r = db()
    .prepare("SELECT COUNT(*) AS n FROM recovery_codes WHERE user_id = ? AND used_at IS NULL")
    .get(userId) as { n: number };
  return r.n;
}

/**
 * يستهلك رمزاً صالحاً. يفحص كلَّ الرموز غير المستعملة لأنّ argon2 لا يسمح
 * بالبحث بالمساواة — والعددُ ثمانيةٌ فلا كلفةَ تُذكر.
 */
export async function consumeCode(userId: number, raw: string): Promise<boolean> {
  const code = normalizeCode(raw);
  if (!code) return false;
  const rows = db()
    .prepare("SELECT id, code_hash FROM recovery_codes WHERE user_id = ? AND used_at IS NULL")
    .all(userId) as { id: number; code_hash: string }[];
  for (const row of rows) {
    if (await verifyPassword(row.code_hash, code)) {
      db().prepare("UPDATE recovery_codes SET used_at = unixepoch() WHERE id = ?").run(row.id);
      return true;
    }
  }
  return false;
}
