/**
 * منطقُ أدوات المطوّرين — دوالُّ خالصةٌ قابلةٌ للاختبار، بلا DOM ولا حالة.
 * كلُّ ما هنا يعمل في المتصفّح: لا تُرسَل بياناتُ المستخدم إلى أيّ خادم.
 */

/* ═══════════ Base64 ═══════════ */

/** ترميزٌ يمرّ بـUTF-8 أوّلاً — فالعربيّةُ لا تفقد حرفاً */
export function toBase64(text: string, urlSafe = false): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  const b64 = btoa(bin);
  return urlSafe ? b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : b64;
}

export type Decoded = { ok: true; text: string; bytes: number } | { ok: false; error: string };

export function fromBase64(value: string): Decoded {
  const cleaned = value.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  if (!cleaned) return { ok: false, error: "لا شيءَ لفكّه." };
  if (!/^[A-Za-z0-9+/]*=*$/.test(cleaned)) {
    return { ok: false, error: "النصُّ ليس Base64 صالحاً — فيه محارفُ خارج الأبجديّة." };
  }
  const rem = cleaned.length % 4;
  if (rem === 1) return { ok: false, error: "طولُ النصّ لا يصلح لـBase64 (بقيّةُ قسمةٍ على ٤ تساوي ١)." };
  const padded = rem ? cleaned + "=".repeat(4 - rem) : cleaned;
  try {
    const bin = atob(padded);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return { ok: true, text, bytes: bytes.length };
  } catch {
    return { ok: false, error: "فُكَّ الترميزُ لكنّ الناتجَ ليس نصّاً بترميز UTF-8 — لعلّه ملفٌّ ثنائيّ." };
  }
}

/* ═══════════ الروابط ═══════════ */

export type UrlParam = { key: string; value: string };
export type UrlParts = {
  ok: boolean;
  protocol?: string; host?: string; port?: string; path?: string; hash?: string;
  params: UrlParam[];
};

/** يقبل رابطاً كاملاً أو سلسلةَ استعلامٍ وحدَها */
export function parseUrl(input: string): UrlParts {
  const raw = input.trim();
  if (!raw) return { ok: false, params: [] };
  try {
    const u = new URL(raw);
    return {
      ok: true,
      protocol: u.protocol.replace(":", ""),
      host: u.hostname,
      port: u.port || undefined,
      path: u.pathname,
      hash: u.hash ? u.hash.slice(1) : undefined,
      params: [...u.searchParams.entries()].map(([key, value]) => ({ key, value })),
    };
  } catch {
    const q = raw.startsWith("?") ? raw.slice(1) : raw;
    if (!q.includes("=")) return { ok: false, params: [] };
    return { ok: true, params: [...new URLSearchParams(q).entries()].map(([key, value]) => ({ key, value })) };
  }
}

export function buildQuery(params: UrlParam[]): string {
  const s = new URLSearchParams();
  for (const p of params) if (p.key) s.append(p.key, p.value);
  return s.toString();
}

/* ═══════════ فحصُ المحارف ═══════════ */

export type CharInfo = {
  index: number; ch: string; cp: number; hex: string;
  utf8: number[]; name: string; invisible: boolean;
};

/** المحارفُ الخفيّةُ التي تكسر البحثَ والمقارنةَ — تُسمّى بالاسم لا بالرقم */
const NAMED: Record<number, string> = {
  0x09: "جدولة (Tab)", 0x0a: "سطرٌ جديد (LF)", 0x0d: "رجوعُ عربة (CR)",
  0x20: "مسافة", 0xa0: "مسافةٌ غيرُ فاصلة (NBSP)", 0xad: "واصلةٌ ليّنة (SHY)",
  0x061c: "علامةُ حرفٍ عربيّ (ALM)", 0x0640: "تطويل (ـ)",
  0x200b: "مسافةٌ صفريّة (ZWSP)", 0x200c: "فاصلٌ صفريّ (ZWNJ)", 0x200d: "واصلٌ صفريّ (ZWJ)",
  0x200e: "علامةُ يسار-يمين (LRM)", 0x200f: "علامةُ يمين-يسار (RLM)",
  0x202a: "تضمينُ يسار-يمين (LRE)", 0x202b: "تضمينُ يمين-يسار (RLE)",
  0x202c: "إنهاءُ الاتّجاه (PDF)", 0x202d: "قهرُ يسار-يمين (LRO)", 0x202e: "قهرُ يمين-يسار (RLO)",
  0x2066: "عزلُ يسار-يمين (LRI)", 0x2067: "عزلُ يمين-يسار (RLI)", 0x2069: "إنهاءُ العزل (PDI)",
  0xfeff: "علامةُ ترتيبِ بايتات (BOM)", 0xfffd: "محرفُ بديلٍ — دليلُ ترميزٍ تالف",
};

function charName(cp: number): string {
  const named = NAMED[cp];
  if (named) return named;
  if (cp >= 0x0610 && cp <= 0x061a) return "علامةٌ قرآنيّة";
  if (cp >= 0x064b && cp <= 0x0652) return "تشكيل";
  if (cp >= 0x0653 && cp <= 0x0655) return "همزةٌ أو مدّة";
  if (cp >= 0x0660 && cp <= 0x0669) return "رقمٌ عربيٌّ هنديّ";
  if (cp >= 0x06f0 && cp <= 0x06f9) return "رقمٌ فارسيّ";
  if (cp >= 0x0600 && cp <= 0x06ff) return "حرفٌ عربيّ";
  if (cp >= 0xfb50 && cp <= 0xfefc) return "شكلُ عرضٍ عربيّ (توافقيّ)";
  if (cp >= 0x30 && cp <= 0x39) return "رقمٌ لاتينيّ";
  if ((cp >= 0x41 && cp <= 0x5a) || (cp >= 0x61 && cp <= 0x7a)) return "حرفٌ لاتينيّ";
  if (cp < 0x20 || (cp >= 0x7f && cp <= 0x9f)) return "محرفُ تحكّم";
  if (cp >= 0x1f300) return "رمزٌ تعبيريّ";
  if (cp < 0x80) return "ترقيمٌ أو رمز";
  return "محرفٌ آخر";
}

const INVISIBLE = new Set([
  0xa0, 0xad, 0x061c, 0x200b, 0x200c, 0x200d, 0x200e, 0x200f,
  0x202a, 0x202b, 0x202c, 0x202d, 0x202e, 0x2066, 0x2067, 0x2068, 0x2069, 0xfeff,
]);

export function inspectChars(text: string, limit = 400): CharInfo[] {
  const out: CharInfo[] = [];
  let i = 0;
  for (const ch of text) {
    if (out.length >= limit) break;
    const cp = ch.codePointAt(0)!;
    out.push({
      index: i, ch, cp,
      hex: `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`,
      utf8: [...new TextEncoder().encode(ch)],
      name: charName(cp),
      invisible: INVISIBLE.has(cp),
    });
    i += ch.length;
  }
  return out;
}

export type TextStats = {
  chars: number; codePoints: number; utf8Bytes: number;
  invisible: number; isNfc: boolean; nfcChars: number; nfdChars: number;
};

export function textStats(text: string): TextStats {
  const cps = [...text];
  return {
    chars: text.length,
    codePoints: cps.length,
    utf8Bytes: new TextEncoder().encode(text).length,
    invisible: cps.filter((c) => INVISIBLE.has(c.codePointAt(0)!)).length,
    isNfc: text.normalize("NFC") === text,
    nfcChars: [...text.normalize("NFC")].length,
    nfdChars: [...text.normalize("NFD")].length,
  };
}

/* ═══════════ JSON ═══════════ */

export type JsonResult =
  | { ok: true; out: string; keys: number; depth: number }
  | { ok: false; message: string; line?: number; col?: number };

function sortDeep(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortDeep);
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return Object.fromEntries(Object.keys(o).sort().map((k) => [k, sortDeep(o[k])]));
  }
  return v;
}

function measure(v: unknown, d = 1): { keys: number; depth: number } {
  if (Array.isArray(v)) {
    let keys = 0, depth = d;
    for (const x of v) { const m = measure(x, d + 1); keys += m.keys; depth = Math.max(depth, m.depth); }
    return { keys, depth };
  }
  if (v && typeof v === "object") {
    const e = Object.entries(v as Record<string, unknown>);
    let keys = e.length, depth = d;
    for (const [, x] of e) { const m = measure(x, d + 1); keys += m.keys; depth = Math.max(depth, m.depth); }
    return { keys, depth };
  }
  return { keys: 0, depth: d - 1 };
}

/** موضعُ الخطأ يُحسب من الفهرس لا من نصّ الرسالة — فصياغةُ المحرّكات تتبدّل */
export function formatJson(
  text: string,
  opts: { indent?: number | "tab"; sortKeys?: boolean; minify?: boolean } = {},
): JsonResult {
  if (!text.trim()) return { ok: false, message: "لا شيءَ لتنسيقه." };
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const at = /position (\d+)/.exec(msg);
    if (!at) return { ok: false, message: msg };
    const pos = Math.min(Number(at[1]), text.length);
    const before = text.slice(0, pos);
    const line = before.split("\n").length;
    const col = pos - before.lastIndexOf("\n");
    return { ok: false, message: msg, line, col };
  }
  const value = opts.sortKeys ? sortDeep(parsed) : parsed;
  const space = opts.minify ? undefined : opts.indent === "tab" ? "\t" : (opts.indent ?? 2);
  const m = measure(parsed);
  return { ok: true, out: JSON.stringify(value, null, space), keys: m.keys, depth: m.depth };
}

/* ═══════════ CSV ═══════════ */

/** محلّلٌ يحترم الاقتباس: فاصلةٌ أو سطرٌ داخل `"…"` جزءٌ من القيمة لا فاصل */
export function parseCsv(text: string, delim = ","): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const src = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') { cell += '"'; i++; } else quoted = false;
      } else cell += c;
      continue;
    }
    if (c === '"' && cell === "") { quoted = true; continue; }
    if (c === delim) { row.push(cell); cell = ""; continue; }
    if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; continue; }
    cell += c;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.length > 1 || r[0] !== "");
}

const needsQuote = (v: string, delim: string) =>
  v.includes(delim) || v.includes('"') || v.includes("\n");

export function toCsvCell(v: unknown, delim: string): string {
  const s = v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
  return needsQuote(s, delim) ? `"${s.replace(/"/g, '""')}"` : s;
}

export type ConvertResult = { ok: true; out: string; rows: number; cols: number } | { ok: false; error: string };

export function csvToJson(text: string, delim = ",", header = true): ConvertResult {
  const rows = parseCsv(text, delim);
  if (!rows.length) return { ok: false, error: "لا صفوفَ في المُدخل." };
  if (!header) {
    return { ok: true, out: JSON.stringify(rows, null, 2), rows: rows.length, cols: rows[0].length };
  }
  const [head, ...body] = rows;
  if (!body.length) return { ok: false, error: "فيه سطرُ عناوينَ ولا بيانات." };
  const objs = body.map((r) =>
    Object.fromEntries(head.map((h, i) => [h.trim() || `عمود${i + 1}`, r[i] ?? ""])),
  );
  return { ok: true, out: JSON.stringify(objs, null, 2), rows: objs.length, cols: head.length };
}

export function jsonToCsv(text: string, delim = ","): ConvertResult {
  let data: unknown;
  try { data = JSON.parse(text); } catch (e) {
    return { ok: false, error: `JSON غيرُ صالح: ${e instanceof Error ? e.message : ""}` };
  }
  const arr = Array.isArray(data) ? data : [data];
  if (!arr.length) return { ok: false, error: "المصفوفةُ فارغة." };
  if (arr.some((r) => typeof r !== "object" || r === null || Array.isArray(r))) {
    return { ok: false, error: "يُتوقَّع مصفوفةُ كائناتٍ — كلُّ كائنٍ صفّ." };
  }
  const cols: string[] = [];
  for (const r of arr as Record<string, unknown>[]) {
    for (const k of Object.keys(r)) if (!cols.includes(k)) cols.push(k);
  }
  const lines = [cols.map((c) => toCsvCell(c, delim)).join(delim)];
  for (const r of arr as Record<string, unknown>[]) {
    lines.push(cols.map((c) => toCsvCell(r[c], delim)).join(delim));
  }
  return { ok: true, out: lines.join("\n"), rows: arr.length, cols: cols.length };
}

/* ═══════════ JWT ═══════════ */

export type JwtClaim = { key: string; value: string; note?: string };
export type JwtResult =
  | { ok: true; header: string; payload: string; signature: string; alg: string; typ: string; claims: JwtClaim[]; expired?: boolean }
  | { ok: false; error: string };

const CLAIM_NAMES: Record<string, string> = {
  iss: "المُصدِر", sub: "الموضوع (المستخدم)", aud: "الجمهور المقصود",
  exp: "ينتهي في", nbf: "لا يصلح قبل", iat: "أُصدر في", jti: "معرّفُ الرمز",
  scope: "النطاقات", email: "البريد", name: "الاسم", role: "الدور",
};

const fmtTs = (n: number): string => {
  const d = new Date(n * 1000);
  if (Number.isNaN(d.getTime())) return String(n);
  return d.toISOString().replace("T", " ").slice(0, 19) + "Z";
};

export function decodeJwt(token: string, now = 0): JwtResult {
  const t = token.trim().replace(/^Bearer\s+/i, "");
  const parts = t.split(".");
  if (parts.length !== 3) {
    return { ok: false, error: `الرمزُ يجب أن يكون ثلاثةَ أجزاءٍ يفصلها نقطة — وجدتُ ${parts.length}.` };
  }
  const dec = (p: string) => {
    const r = fromBase64(p);
    if (!r.ok) return null;
    try { return JSON.parse(r.text) as Record<string, unknown>; } catch { return null; }
  };
  const header = dec(parts[0]);
  const payload = dec(parts[1]);
  if (!header) return { ok: false, error: "تعذّر فكُّ الترويسة — ليست Base64URL لكائن JSON." };
  if (!payload) return { ok: false, error: "تعذّر فكُّ الحمولة — ليست Base64URL لكائن JSON." };

  const claims: JwtClaim[] = Object.entries(payload).map(([key, v]) => {
    const label = CLAIM_NAMES[key];
    if ((key === "exp" || key === "iat" || key === "nbf") && typeof v === "number") {
      return { key, value: fmtTs(v), note: label };
    }
    return { key, value: typeof v === "object" ? JSON.stringify(v) : String(v), note: label };
  });

  const exp = typeof payload.exp === "number" ? payload.exp : undefined;
  return {
    ok: true,
    header: JSON.stringify(header, null, 2),
    payload: JSON.stringify(payload, null, 2),
    signature: parts[2],
    alg: String(header.alg ?? "—"),
    typ: String(header.typ ?? "—"),
    claims,
    expired: exp !== undefined && now > 0 ? exp * 1000 < now : undefined,
  };
}

/* ═══════════ cron ═══════════ */

export type CronField = { values: Set<number>; star: boolean; step?: number };
export type CronParsed = { minute: CronField; hour: CronField; dom: CronField; month: CronField; dow: CronField };
export type CronResult = { ok: true; cron: CronParsed; text: string } | { ok: false; error: string };

const MONTH_NAMES = ["كانون الثاني", "شباط", "آذار", "نيسان", "أيّار", "حزيران", "تمّوز", "آب", "أيلول", "تشرين الأوّل", "تشرين الثاني", "كانون الأوّل"];
const DOW_NAMES = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const MONTH_ABBR = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const DOW_ABBR = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const ALIASES: Record<string, string> = {
  "@yearly": "0 0 1 1 *", "@annually": "0 0 1 1 *", "@monthly": "0 0 1 * *",
  "@weekly": "0 0 * * 0", "@daily": "0 0 * * *", "@midnight": "0 0 * * *", "@hourly": "0 * * * *",
};

function parseField(spec: string, min: number, max: number, abbr?: string[]): CronField | null {
  const values = new Set<number>();
  let star = spec === "*";
  let step: number | undefined;
  for (const part of spec.split(",")) {
    if (!part) return null;
    const [rangePart, stepPart] = part.split("/");
    let s: number, e: number;
    const n = stepPart === undefined ? undefined : Number(stepPart);
    if (stepPart !== undefined && (!Number.isInteger(n) || n! < 1)) return null;
    if (rangePart === "*") { s = min; e = max; if (spec === `*/${stepPart}`) { star = false; step = n; } }
    else {
      const bounds = rangePart.split("-");
      if (bounds.length > 2) return null;
      const num = (v: string) => {
        const i = abbr?.indexOf(v.toLowerCase());
        if (i !== undefined && i >= 0) return abbr === DOW_ABBR ? i : i + 1;
        return /^\d+$/.test(v) ? Number(v) : NaN;
      };
      s = num(bounds[0]);
      e = bounds.length === 2 ? num(bounds[1]) : s;
      if (Number.isNaN(s) || Number.isNaN(e)) return null;
      if (bounds.length === 1 && stepPart !== undefined) e = max;
    }
    if (s < min || e > max || s > e) return null;
    for (let v = s; v <= e; v += n ?? 1) values.add(v === 7 && max === 7 ? 0 : v);
  }
  if (!values.size) return null;
  return { values, star, step };
}

export function parseCron(expr: string): CronResult {
  const raw = expr.trim().toLowerCase();
  if (!raw) return { ok: false, error: "اكتب تعبيرَ cron." };
  const line = ALIASES[raw] ?? raw;
  const f = line.split(/\s+/);
  if (f.length === 6) return { ok: false, error: "ستّةُ حقول: هذا نمطُ الثواني (Quartz/Spring) — أزل حقلَ الثواني الأوّل." };
  if (f.length !== 5) return { ok: false, error: `يُتوقَّع خمسةُ حقول (دقيقة ساعة يوم شهر يوم-أسبوع) — وجدتُ ${f.length}.` };
  const minute = parseField(f[0], 0, 59);
  const hour = parseField(f[1], 0, 23);
  const dom = parseField(f[2], 1, 31);
  const month = parseField(f[3], 1, 12, MONTH_ABBR);
  const dow = parseField(f[4], 0, 7, DOW_ABBR);
  const bad = [["الدقيقة", minute], ["الساعة", hour], ["اليوم", dom], ["الشهر", month], ["يوم الأسبوع", dow]]
    .find(([, v]) => v === null);
  if (bad) return { ok: false, error: `حقلُ ${bad[0]} غيرُ صالح.` };
  const cron: CronParsed = { minute: minute!, hour: hour!, dom: dom!, month: month!, dow: dow! };
  return { ok: true, cron, text: describeCron(cron) };
}

/** صيغةُ العدد العربيّة: مفردٌ ومثنّى وجمعُ قلّةٍ وتمييزٌ منصوب — لا «1 صفّاً» */
export const arabicCount = (n: number, one: string, two: string, few: string, many: string) =>
  n === 1 ? one : n === 2 ? two : n <= 10 ? `${n} ${few}` : `${n} ${many}`;

const joinAr = (items: string[]): string =>
  items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(" و")} و${items[items.length - 1]}`;

const pad2 = (n: number) => String(n).padStart(2, "0");
const sorted = (f: CronField) => [...f.values].sort((a, b) => a - b);

/** «الاثنين إلى الجمعة» أوضحُ من عدِّ خمسةِ أيّامٍ واحداً واحداً */
function runsOf(values: number[], label: (n: number) => string): string {
  const parts: string[] = [];
  for (let i = 0; i < values.length; ) {
    let j = i;
    while (j + 1 < values.length && values[j + 1] === values[j] + 1) j++;
    if (j - i >= 2) parts.push(`${label(values[i])} إلى ${label(values[j])}`);
    else parts.push(...values.slice(i, j + 1).map(label));
    i = j + 1;
  }
  return joinAr(parts);
}

export function describeCron(c: CronParsed): string {
  let time: string;
  if (c.minute.star && c.hour.star) time = "كلَّ دقيقة";
  else if (c.hour.star) {
    time = c.minute.step
      ? `كلَّ ${arabicCount(c.minute.step, "دقيقة", "دقيقتين", "دقائق", "دقيقة")}`
      : `عند الدقيقة ${runsOf(sorted(c.minute), String)} من كلّ ساعة`;
  } else if (c.minute.star) {
    time = c.hour.step
      ? `كلَّ دقيقةٍ خلال كلِّ ${arabicCount(c.hour.step, "ساعة", "ساعتين", "ساعات", "ساعة")}`
      : `كلَّ دقيقةٍ خلال الساعة ${joinAr(sorted(c.hour).map(pad2))}`;
  } else {
    const times: string[] = [];
    for (const h of sorted(c.hour)) for (const m of sorted(c.minute)) times.push(`${pad2(h)}:${pad2(m)}`);
    time = times.length <= 6
      ? `الساعة ${joinAr(times)}`
      : `${times.length} موعداً يوميّاً، أوّلُها ${times[0]} وآخرُها ${times[times.length - 1]}`;
  }

  const when: string[] = [];
  if (!c.dom.star) {
    when.push(c.dom.step
      ? `كلَّ ${arabicCount(c.dom.step, "يوم", "يومين", "أيّام", "يوماً")} من الشهر`
      : `في اليوم ${runsOf(sorted(c.dom), String)} من الشهر`);
  }
  if (!c.dow.star) when.push(`يومَ ${runsOf(sorted(c.dow), (d) => DOW_NAMES[d])}`);
  if (!c.month.star) when.push(`في ${runsOf(sorted(c.month), (m) => MONTH_NAMES[m - 1])}`);
  if (!when.length) when.push("كلَّ يوم");

  const both = !c.dom.star && !c.dow.star;
  return `${time}، ${when.join(both ? " أو " : " ")}${both ? " (cron يجمع الشرطين بـ«أو» متى قُيّد الحقلان)" : ""}.`;
}

function dayMatches(c: CronParsed, d: Date): boolean {
  if (!c.month.values.has(d.getMonth() + 1)) return false;
  const dom = c.dom.values.has(d.getDate());
  const dow = c.dow.values.has(d.getDay());
  if (c.dom.star && c.dow.star) return true;
  if (c.dom.star) return dow;
  if (c.dow.star) return dom;
  return dom || dow;
}

/** المواعيدُ القادمة بتوقيت الجهاز — يُقفَز اليومُ كلُّه متى لم يطابق، فيبقى سريعاً */
export function nextRuns(c: CronParsed, from: Date, count = 6): Date[] {
  const out: Date[] = [];
  const d = new Date(from.getTime());
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() + 1);
  for (let guard = 0; guard < 500_000 && out.length < count; guard++) {
    if (!dayMatches(c, d)) { d.setDate(d.getDate() + 1); d.setHours(0, 0, 0, 0); continue; }
    if (!c.hour.values.has(d.getHours())) { d.setHours(d.getHours() + 1, 0, 0, 0); continue; }
    if (!c.minute.values.has(d.getMinutes())) { d.setMinutes(d.getMinutes() + 1, 0, 0); continue; }
    out.push(new Date(d.getTime()));
    d.setMinutes(d.getMinutes() + 1, 0, 0);
  }
  return out;
}

/* ═══════════ التوليدُ العشوائيّ ═══════════ */

export const CHARSETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/",
} as const;

export type CharsetId = keyof typeof CHARSETS;

/** ملتبسةٌ بالعين أو بالخطّ: صفرٌ وحرفُ O، وواحدٌ ولامٌ وI الكبيرة */
const AMBIGUOUS = new Set("O0oIl1|`'\"{}[]()/\\".split(""));

export function buildPool(sets: CharsetId[], noAmbiguous: boolean): string {
  const chars = new Set(sets.flatMap((s) => CHARSETS[s].split("")));
  if (noAmbiguous) for (const c of AMBIGUOUS) chars.delete(c);
  return [...chars].join("");
}

/** أخذُ عيّنةٍ برفض القيم الزائدة — فلا ينحاز التوزيعُ كما يفعل باقي القسمة */
export function randomFrom(pool: string, length: number, rand: (n: number) => Uint32Array): string {
  if (!pool.length || length <= 0) return "";
  const limit = Math.floor(0xffffffff / pool.length) * pool.length;
  let out = "";
  while (out.length < length) {
    for (const v of rand(length)) {
      if (v >= limit) continue;
      out += pool[v % pool.length];
      if (out.length === length) break;
    }
  }
  return out;
}

export const cryptoWords = (n: number): Uint32Array =>
  crypto.getRandomValues(new Uint32Array(n));

export const entropyBits = (poolSize: number, length: number): number =>
  poolSize <= 1 ? 0 : Math.round(length * Math.log2(poolSize));

export function strengthLabel(bits: number): { label: string; lit: boolean } {
  if (bits < 40) return { label: "ضعيفة — تُكسَر بحاسوبٍ عاديّ", lit: false };
  if (bits < 60) return { label: "مقبولةٌ لحسابٍ غير مهمّ", lit: false };
  if (bits < 80) return { label: "جيّدة", lit: false };
  if (bits < 100) return { label: "قويّة", lit: true };
  return { label: "قويّةٌ جدّاً — أكثرُ ممّا يلزم عادةً", lit: true };
}

/* ═══════════ UUID ═══════════ */

const hex = (n: number, w: number) => n.toString(16).padStart(w, "0");

export function uuidV4(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const s = [...b].map((x) => hex(x, 2)).join("");
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

/** v7: ٤٨ بتاً من زمن يونكس بالمللي ثمّ عشوائيّ — فالفرزُ النصّيُّ فرزٌ زمنيّ */
export function uuidV7(ms: number): string {
  const b = crypto.getRandomValues(new Uint8Array(16));
  const t = BigInt(ms);
  for (let i = 0; i < 6; i++) b[i] = Number((t >> BigInt(8 * (5 - i))) & 0xffn);
  b[6] = (b[6] & 0x0f) | 0x70;
  b[8] = (b[8] & 0x3f) | 0x80;
  const s = [...b].map((x) => hex(x, 2)).join("");
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

export const NIL_UUID = "00000000-0000-0000-0000-000000000000";
export const MAX_UUID = "ffffffff-ffff-ffff-ffff-ffffffffffff";

export type UuidInfo = { valid: boolean; version?: number; variant?: string; timestamp?: string; note: string };

export function inspectUuid(value: string): UuidInfo {
  const v = value.trim().toLowerCase().replace(/^urn:uuid:/, "").replace(/^\{|\}$/g, "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(v)) {
    return { valid: false, note: "ليس UUID بالشكل المعياريّ (٨-٤-٤-٤-١٢ خانةً ستّ عشريّة)." };
  }
  if (v === NIL_UUID) return { valid: true, note: "المعرّفُ الصفريّ (nil) — يعني «لا معرّف»." };
  if (v === MAX_UUID) return { valid: true, note: "المعرّفُ الأقصى (max)." };
  const version = parseInt(v[14], 16);
  const variantNibble = parseInt(v[19], 16);
  const variant = variantNibble >= 8 && variantNibble <= 0xb ? "RFC 4122" : "قديمٌ أو غيرُ معياريّ";
  const notes: Record<number, string> = {
    1: "الإصدار ١: زمنٌ + عنوانُ بطاقة الشبكة — يسرّب الجهازَ والوقت.",
    3: "الإصدار ٣: بصمةُ MD5 لاسمٍ ضمن نطاق.",
    4: "الإصدار ٤: عشوائيٌّ بالكامل — الأشيعُ والأسلم.",
    5: "الإصدار ٥: بصمةُ SHA-1 لاسمٍ ضمن نطاق.",
    7: "الإصدار ٧: زمنُ يونكس ثمّ عشوائيّ — يُفرَز زمنيّاً، وهو الأفضلُ مفتاحاً في القاعدة.",
  };
  let timestamp: string | undefined;
  if (version === 7) {
    const ms = Number(BigInt("0x" + v.replace(/-/g, "").slice(0, 12)));
    timestamp = new Date(ms).toISOString().replace("T", " ").slice(0, 19) + "Z";
  }
  return { valid: true, version, variant, timestamp, note: notes[version] ?? `الإصدار ${version}.` };
}

/* ═══════════ البصمات ═══════════ */

export const HASHES = [
  { id: "SHA-1", name: "SHA-1", note: "مكسورٌ أمنيّاً — للتحقّق من سلامة ملفٍّ فقط" },
  { id: "SHA-256", name: "SHA-256", note: "الخيارُ العامّ" },
  { id: "SHA-384", name: "SHA-384", note: "" },
  { id: "SHA-512", name: "SHA-512", note: "" },
] as const;

export type HashId = (typeof HASHES)[number]["id"];

export async function hashBytes(data: BufferSource, algo: HashId): Promise<string> {
  const buf = await crypto.subtle.digest(algo, data);
  return [...new Uint8Array(buf)].map((b) => hex(b, 2)).join("");
}

export const hashText = (text: string, algo: HashId): Promise<string> =>
  hashBytes(new TextEncoder().encode(text), algo);
