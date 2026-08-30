/**
 * منطقٌ نصّيٌّ نقيٌّ تتقاسمه أدواتُ «نصوص ومستندات» — بلا DOM (القاعدة ٧).
 */

/* ————— العربيّة ————— */

export const DIACRITICS = /[ً-ْٰٓ-ٕـ]/g; // التشكيل والتطويل
export const TATWEEL = /ـ/g;

export const stripDiacritics = (s: string) => s.replace(/[ً-ْٰٓ-ٕ]/g, "");
export const stripTatweel = (s: string) => s.replace(TATWEEL, "");
/** توحيدُ الألف: أ إ آ ٱ → ا */
export const normalizeAlef = (s: string) => s.replace(/[أإآٱ]/g, "ا");
/** ة → ه ، ى → ي */
export const normalizeTaaYaa = (s: string) => s.replace(/ة/g, "ه").replace(/ى/g, "ي");
/** حذفُ المحارف الخفيّة: الوصلات والعلامات الاتّجاهيّة */
export const stripInvisible = (s: string) =>
  s.replace(/[​-‏‪-‮⁦-⁩﻿­]/g, "");

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export const toLatinDigits = (s: string) =>
  s.replace(/[٠-٩۰-۹]/g, (d) => {
    const i = AR_DIGITS.indexOf(d);
    return String(i >= 0 ? i : FA_DIGITS.indexOf(d));
  });

export const toArabicDigits = (s: string) => s.replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]);

/* ————— تنظيف ————— */

export type CleanOptions = {
  collapseSpaces: boolean;
  trimLines: boolean;
  dropEmptyLines: boolean;
  stripInvisible: boolean;
  fixPunctuationSpace: boolean;
};

export function cleanText(s: string, o: CleanOptions): string {
  let out = s;
  if (o.stripInvisible) out = stripInvisible(out);
  if (o.fixPunctuationSpace) {
    out = out.replace(/[ \t]+([،.؛:!؟,;])/g, "$1").replace(/([،.؛:!؟,;])(?=[^\s\d])/g, "$1 ");
  }
  if (o.collapseSpaces) out = out.replace(/[ \t]{2,}/g, " ");
  if (o.trimLines) out = out.split("\n").map((l) => l.trim()).join("\n");
  if (o.dropEmptyLines) out = out.split("\n").filter((l) => l.trim() !== "").join("\n");
  return out;
}

/* ————— تخطيطُ لوحة المفاتيح (عربيّ ١٠١ ↔ QWERTY) ————— */

const LAYOUT: [string, string][] = [
  ["q", "ض"], ["w", "ص"], ["e", "ث"], ["r", "ق"], ["t", "ف"], ["y", "غ"], ["u", "ع"],
  ["i", "ه"], ["o", "خ"], ["p", "ح"], ["[", "ج"], ["]", "د"],
  ["a", "ش"], ["s", "س"], ["d", "ي"], ["f", "ب"], ["g", "ل"], ["h", "ا"], ["j", "ت"],
  ["k", "ن"], ["l", "م"], [";", "ك"], ["'", "ط"],
  ["z", "ئ"], ["x", "ء"], ["c", "ؤ"], ["v", "ر"], ["b", "لا"], ["n", "ى"], ["m", "ة"],
  [",", "و"], [".", "ز"], ["/", "ظ"],
  ["Q", "َ"], ["W", "ً"], ["E", "ُ"], ["R", "ٌ"], ["T", "لإ"], ["Y", "إ"], ["I", "÷"],
  ["O", "×"], ["P", "؛"], ["A", "ِ"], ["S", "ٍ"], ["D", "]"], ["F", "["], ["G", "لأ"],
  ["H", "أ"], ["J", "ـ"], ["K", "،"], ["L", "/"], ["X", "ْ"], ["C", "}"], ["V", "{"],
  ["B", "لآ"], ["N", "آ"], ["M", "'"], ["?", "؟"], [">", "."], ["<", ","],
];

const EN_TO_AR = new Map(LAYOUT);
// الأطولُ أوّلاً كي تُلتقط «لا» و«لأ» قبل حروفها المفردة
const AR_TO_EN = [...LAYOUT].map(([en, ar]) => [ar, en] as [string, string])
  .sort((a, b) => b[0].length - a[0].length);

/** نصٌّ كُتب واللوحةُ إنكليزيّة والقصدُ عربيّ */
export const enToAr = (s: string) => [...s].map((ch) => EN_TO_AR.get(ch) ?? ch).join("");

/** والعكس */
export function arToEn(s: string): string {
  let out = "";
  let i = 0;
  outer: while (i < s.length) {
    for (const [ar, en] of AR_TO_EN) {
      if (s.startsWith(ar, i)) { out += en; i += ar.length; continue outer; }
    }
    out += s[i]; i += 1;
  }
  return out;
}

/** يخمّن الاتّجاه: نصٌّ أغلبُه لاتينيٌّ غالباً كُتب بلوحةٍ خاطئة */
export function guessDirection(s: string): "en2ar" | "ar2en" {
  const ar = (s.match(/[؀-ۿ]/g) ?? []).length;
  const en = (s.match(/[a-zA-Z]/g) ?? []).length;
  return en >= ar ? "en2ar" : "ar2en";
}

/* ————— أسطر ————— */

export type SortMode = "asc" | "desc" | "reverse" | "none";

export function processLines(
  s: string,
  { mode, unique, trim, dropEmpty }: { mode: SortMode; unique: boolean; trim: boolean; dropEmpty: boolean },
): string {
  let lines = s.split("\n");
  if (trim) lines = lines.map((l) => l.trim());
  if (dropEmpty) lines = lines.filter((l) => l !== "");
  if (unique) lines = [...new Set(lines)];
  const cmp = new Intl.Collator("ar", { numeric: true, sensitivity: "base" });
  if (mode === "asc") lines.sort(cmp.compare);
  else if (mode === "desc") lines.sort((a, b) => cmp.compare(b, a));
  else if (mode === "reverse") lines.reverse();
  return lines.join("\n");
}

/* ————— تكرارُ الكلمات ————— */

export function wordFrequency(s: string, { ignoreDiacritics }: { ignoreDiacritics: boolean }) {
  const base = ignoreDiacritics ? normalizeAlef(stripDiacritics(stripTatweel(s))) : s;
  const words = base.match(/[\p{L}\p{N}]+/gu) ?? [];
  const map = new Map<string, number>();
  for (const w of words) map.set(w, (map.get(w) ?? 0) + 1);
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ar"))
    .map(([word, count]) => ({ word, count }));
}

/* ————— استخراج ————— */

export const EXTRACTORS = {
  email: /[\w.+-]+@[\w-]+\.[\w.-]{2,}/g,
  url: /https?:\/\/[^\s<>"')]+/g,
  phone: /(?:\+|00)?\d[\d\s()-]{6,17}\d/g,
  number: /-?\d[\d,]*(?:\.\d+)?/g,
} as const;

export type ExtractKind = keyof typeof EXTRACTORS;

export function extract(s: string, kind: ExtractKind, unique: boolean): string[] {
  const found = toLatinDigits(s).match(EXTRACTORS[kind]) ?? [];
  const cleaned = found.map((f) => f.trim());
  return unique ? [...new Set(cleaned)] : cleaned;
}

/* ————— رابطٌ لطيف ————— */

/** نقلٌ صوتيٌّ للعربيّة إلى لاتينيّة — للروابط لا للنشر */
const TRANSLIT: Record<string, string> = {
  ا: "a", أ: "a", إ: "i", آ: "a", ب: "b", ت: "t", ث: "th", ج: "j", ح: "h", خ: "kh",
  د: "d", ذ: "dh", ر: "r", ز: "z", س: "s", ش: "sh", ص: "s", ض: "d", ط: "t", ظ: "z",
  ع: "a", غ: "gh", ف: "f", ق: "q", ك: "k", ل: "l", م: "m", ن: "n", ه: "h", ة: "h",
  و: "w", ؤ: "w", ي: "y", ى: "a", ئ: "y", ء: "", "لا": "la",
};

export function slugify(s: string, { latin }: { latin: boolean }): string {
  let out = stripDiacritics(stripTatweel(stripInvisible(s))).toLowerCase();
  if (latin) out = [...out].map((ch) => TRANSLIT[ch] ?? ch).join("");
  out = out
    .replace(latin ? /[^a-z0-9]+/g : /[^\p{L}\p{N}]+/gu, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
  return out;
}

/* ————— حدودُ المنصّات ————— */

export const PLATFORMS = [
  { id: "x", name: "إكس (تويتر)", limit: 280 },
  { id: "x-premium", name: "إكس المدفوع", limit: 25000 },
  { id: "linkedin", name: "لينكدإن — منشور", limit: 3000 },
  { id: "linkedin-headline", name: "لينكدإن — العنوان", limit: 220 },
  { id: "instagram", name: "إنستغرام — وصف", limit: 2200 },
  { id: "whatsapp", name: "واتساب — حالة", limit: 700 },
  { id: "sms", name: "رسالةٌ نصّيّةٌ عربيّة", limit: 70 },
  { id: "meta-desc", name: "وصفُ صفحةٍ لمحرّكات البحث", limit: 160 },
] as const;

/** المنصّاتُ تعدّ نقاطَ الترميز لا الوحدات — والعربيّةُ تختلف عن اللاتينيّة هنا */
export const countChars = (s: string) => [...s].length;

/* ————— مقارنةُ نصّين ————— */

export type DiffRow = { type: "same" | "add" | "del"; text: string };

/** فروقٌ سطراً سطراً بأطول تسلسلٍ مشترك */
export function diffLines(a: string, b: string): DiffRow[] {
  const A = a.split("\n");
  const B = b.split("\n");
  const n = A.length;
  const m = B.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: DiffRow[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) { out.push({ type: "same", text: A[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ type: "del", text: A[i] }); i++; }
    else { out.push({ type: "add", text: B[j] }); j++; }
  }
  while (i < n) out.push({ type: "del", text: A[i++] });
  while (j < m) out.push({ type: "add", text: B[j++] });
  return out;
}

/* ————— Markdown ————— */

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * محوّلٌ صغيرٌ يكفي المستندات الشائعة.
 * **يُهرَّب الدخلُ أوّلاً** فلا يمرّ وسمٌ من المستخدم — الوقايةُ من الحقن قبل التنسيق.
 */
export function markdownToHtml(src: string): string {
  const lines = escapeHtml(src).split("\n");
  const out: string[] = [];
  let inCode = false;
  let listType: "ul" | "ol" | null = null;

  const closeList = () => { if (listType) { out.push(`</${listType}>`); listType = null; } };
  const inline = (s: string) =>
    s
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|\W)\*([^*]+)\*/g, "$1<em>$2</em>")
      .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>');

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^```/.test(line.trim())) {
      closeList();
      out.push(inCode ? "</code></pre>" : "<pre><code>");
      inCode = !inCode;
      continue;
    }
    if (inCode) { out.push(raw); continue; }

    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) { closeList(); out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); continue; }
    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) { closeList(); out.push("<hr>"); continue; }
    const q = /^>\s?(.*)$/.exec(line);
    if (q) { closeList(); out.push(`<blockquote>${inline(q[1])}</blockquote>`); continue; }

    const ul = /^\s*[-*+]\s+(.*)$/.exec(line);
    const ol = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (ul || ol) {
      const want = ul ? "ul" : "ol";
      if (listType !== want) { closeList(); out.push(`<${want}>`); listType = want; }
      out.push(`<li>${inline((ul ?? ol)![1])}</li>`);
      continue;
    }
    closeList();
    if (line.trim() === "") out.push("");
    else out.push(`<p>${inline(line)}</p>`);
  }
  closeList();
  if (inCode) out.push("</code></pre>");
  return out.filter((l) => l !== "").join("\n");
}
