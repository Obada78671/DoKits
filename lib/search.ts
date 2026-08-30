import { publishedTools, type ToolSummary } from "@/tools/registry";
import { categoryById, subcategoryName } from "@/tools/categories";

/**
 * محرّكُ بحثٍ نقيٌّ يعمل على السجلّ — لا فهرسَ خارجيٌّ ولا خدمة.
 * يُستعمل نفسُه في الصفحة الرئيسة وفي صفحة النتائج المستقلّة.
 */

/** توحيدُ العربيّة قبل المطابقة: بلا تشكيلٍ ولا تطويل، وألفٌ وياءٌ وتاءٌ موحّدة */
export function normalizeAr(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ً-ْٰـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * مرادفاتُ الأعمال: يبحث الناسُ بكلماتٍ لا تَرِد في أسماء الأدوات.
 * كلُّ مجموعةٍ متكافئة — أيُّ كلمةٍ فيها تجد أخواتِها.
 */
const SYNONYM_GROUPS: string[][] = [
  ["ضريبة", "vat", "قيمه مضافه", "ضريبه", "ضريبة القيمة المضافة", "tax"],
  ["تفقيط", "كتابه المبلغ", "المبلغ بالحروف", "تفقيط الشيك"],
  ["هامش", "ربح", "margin", "markup", "ترميز"],
  ["فاتوره", "invoice", "بيل", "وصل"],
  ["قرض", "تمويل", "قسط", "loan", "installment"],
  ["هجري", "اسلامي", "قمري", "hijri"],
  ["ميلادي", "افرنجي", "gregorian"],
  ["ايبان", "iban", "رقم حساب", "حساب بنكي"],
  ["تشكيل", "حركات", "تشكيل النص", "diacritics"],
  ["كلمه سر", "باسورد", "password", "كلمة مرور"],
  ["json", "جيسون"],
  ["لون", "الوان", "color", "hex", "rgb"],
  ["وحدات", "تحويل وحدات", "قياسات", "units"],
  ["زكاه", "نصاب", "zakat"],
  ["راتب", "اجر", "دوام", "ساعات عمل", "payroll"],
];

const SYNONYMS = new Map<string, string[]>();
for (const g of SYNONYM_GROUPS) {
  const norm = g.map(normalizeAr);
  for (const w of norm) SYNONYMS.set(w, norm);
}

/** يوسّع كلمةً أو عبارةً إلى مرادفاتها المتكافئة */
export function expandTerm(term: string): string[] {
  return SYNONYMS.get(term) ?? [term];
}

export type SearchContext = {
  /** عددُ الزيارات لكلّ أداة — يرجّح الشائع عند تساوي التطابق */
  popularity?: Record<string, number>;
  favorites?: Set<string>;
};

export type SearchHit<T extends ToolSummary = ToolSummary> = { tool: T; score: number; reason: string };

/** مسافةُ تحريرٍ محدودةٌ بواحد — تكفي خطأً مطبعيّاً ولا تخلط الكلمات */
function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a === b) return true;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (a.length < b.length) j++;
    else { i++; j++; }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

/** يتسامح مع خطأٍ مطبعيٍّ واحدٍ في الكلمات التي يستحقّ فيها ذلك */
function fuzzyHit(haystack: string[], term: string): boolean {
  if (term.length < 4) return false;
  return haystack.some((h) => h.split(" ").some((w) => w.length >= 4 && withinOneEdit(w, term)));
}

/** الترجيح: الاسمُ أوّلاً، ثمّ الكلماتُ المفتاحيّة، ثمّ الوصف، ثمّ التصنيف */
function scoreTool(t: ToolSummary, q: string): { score: number; reason: string } {
  const title = normalizeAr(t.title.ar);
  const titleEn = normalizeAr(t.title.en);
  const desc = normalizeAr(t.description.ar);
  const kws = [...t.keywords, ...t.keywordsEn, ...t.tags].map(normalizeAr);
  const cat = normalizeAr(categoryById(t.categoryId)?.name ?? "");
  const sub = normalizeAr(subcategoryName(t.categoryId, t.subcategoryId) ?? "");

  if (title === q || titleEn === q) return { score: 120, reason: "مطابقةُ الاسم" };
  if (title.startsWith(q) || titleEn.startsWith(q)) return { score: 90, reason: "بدايةُ الاسم" };
  if (title.includes(q) || titleEn.includes(q)) return { score: 70, reason: "في الاسم" };
  if (kws.some((k) => k === q)) return { score: 60, reason: "كلمةٌ مفتاحيّة" };
  if (kws.some((k) => k.includes(q))) return { score: 45, reason: "كلمةٌ مفتاحيّة" };
  if (desc.includes(q)) return { score: 30, reason: "في الوصف" };
  if (sub && sub.includes(q)) return { score: 22, reason: "تصنيفٌ فرعيّ" };
  if (cat.includes(q)) return { score: 18, reason: "التصنيف" };
  if (fuzzyHit([title, titleEn, ...kws], q)) return { score: 14, reason: "تقاربٌ في الكتابة" };
  return { score: 0, reason: "" };
}

export function searchTools<T extends ToolSummary>(
  all: T[],
  query: string,
  ctx: SearchContext = {},
): SearchHit<T>[] {
  const q = normalizeAr(query);
  const live = publishedTools(all);
  if (!q) {
    return live.map((t) => ({ tool: t, score: 0, reason: "" }));
  }
  // الاستعلامُ كلُّه قد يكون عبارةً مرادفة («المبلغ بالحروف») — تُجرَّب قبل التقسيم
  const wholeVariants = SYNONYMS.get(q);
  if (wholeVariants) {
    const phraseHits: SearchHit<T>[] = [];
    for (const t of live) {
      let best = { score: 0, reason: "" };
      for (const v of wholeVariants) {
        const r = scoreTool(t, v);
        if (r.score > best.score) best = r;
      }
      if (best.score === 0) continue;
      let total = best.score;
      if (ctx.favorites?.has(t.slug)) total += 25;
      total += Math.min(15, Math.log10(1 + (ctx.popularity?.[t.slug] ?? 0)) * 6);
      phraseHits.push({ tool: t, score: total, reason: best.reason });
    }
    if (phraseHits.length > 0) {
      return phraseHits.sort((a, b) => b.score - a.score || a.tool.title.ar.localeCompare(b.tool.title.ar, "ar"));
    }
  }

  // وإلّا فكلُّ كلمةٍ يجب أن تجد موضعاً — بحثٌ تقاطعيٌّ لا اتّحاديّ
  const terms = q.split(" ").filter(Boolean);
  const hits: SearchHit<T>[] = [];
  for (const t of live) {
    let total = 0;
    let best = "";
    let bestScore = 0;
    let all_matched = true;
    for (const term of terms) {
      // تكفي مطابقةُ مرادفٍ واحد — «ضريبة» تجد VAT والعكس
      let bestForTerm = { score: 0, reason: "" };
      for (const variant of expandTerm(term)) {
        const r = scoreTool(t, variant);
        if (r.score > bestForTerm.score) bestForTerm = r;
      }
      if (bestForTerm.score === 0) { all_matched = false; break; }
      total += bestForTerm.score;
      if (bestForTerm.score > bestScore) { bestScore = bestForTerm.score; best = bestForTerm.reason; }
    }
    if (!all_matched) continue;
    if (ctx.favorites?.has(t.slug)) total += 25;
    total += Math.min(15, Math.log10(1 + (ctx.popularity?.[t.slug] ?? 0)) * 6);
    hits.push({ tool: t, score: total, reason: best });
  }
  return hits.sort((a, b) => b.score - a.score || a.tool.title.ar.localeCompare(b.tool.title.ar, "ar"));
}

/** ترتيبُ العرض بلا استعلام: المفضّلةُ ثمّ الشائعُ ثمّ ترتيبُ السجلّ */
export function rankBrowse<T extends ToolSummary>(all: T[], ctx: SearchContext = {}): T[] {
  return publishedTools(all)
    .map((t, i) => ({
      t, i,
      s: (ctx.favorites?.has(t.slug) ? 1000 : 0) + (ctx.popularity?.[t.slug] ?? 0),
    }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map((x) => x.t);
}
