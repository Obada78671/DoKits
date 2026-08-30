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

export type SearchContext = {
  /** عددُ الزيارات لكلّ أداة — يرجّح الشائع عند تساوي التطابق */
  popularity?: Record<string, number>;
  favorites?: Set<string>;
};

export type SearchHit<T extends ToolSummary = ToolSummary> = { tool: T; score: number; reason: string };

/** الترجيح: الاسمُ أوّلاً، ثمّ الكلماتُ المفتاحيّة، ثمّ الوصف، ثمّ التصنيف */
function scoreTool(t: ToolSummary, q: string): { score: number; reason: string } {
  const title = normalizeAr(t.title);
  const titleEn = normalizeAr(t.titleEn);
  const desc = normalizeAr(t.description);
  const kws = [...t.keywords, ...(t.keywordsEn ?? [])].map(normalizeAr);
  const cat = normalizeAr(categoryById(t.category)?.name ?? "");
  const sub = normalizeAr(subcategoryName(t.category, t.subcategory) ?? "");

  if (title === q || titleEn === q) return { score: 120, reason: "مطابقةُ الاسم" };
  if (title.startsWith(q) || titleEn.startsWith(q)) return { score: 90, reason: "بدايةُ الاسم" };
  if (title.includes(q) || titleEn.includes(q)) return { score: 70, reason: "في الاسم" };
  if (kws.some((k) => k === q)) return { score: 60, reason: "كلمةٌ مفتاحيّة" };
  if (kws.some((k) => k.includes(q))) return { score: 45, reason: "كلمةٌ مفتاحيّة" };
  if (desc.includes(q)) return { score: 30, reason: "في الوصف" };
  if (sub && sub.includes(q)) return { score: 22, reason: "تصنيفٌ فرعيّ" };
  if (cat.includes(q)) return { score: 18, reason: "التصنيف" };
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
  // كلُّ كلمةٍ في الاستعلام يجب أن تجد موضعاً — بحثٌ تقاطعيٌّ لا اتّحاديّ
  const terms = q.split(" ").filter(Boolean);
  const hits: SearchHit<T>[] = [];
  for (const t of live) {
    let total = 0;
    let best = "";
    let bestScore = 0;
    let all_matched = true;
    for (const term of terms) {
      const { score, reason } = scoreTool(t, term);
      if (score === 0) { all_matched = false; break; }
      total += score;
      if (score > bestScore) { bestScore = score; best = reason; }
    }
    if (!all_matched) continue;
    if (ctx.favorites?.has(t.slug)) total += 25;
    total += Math.min(15, Math.log10(1 + (ctx.popularity?.[t.slug] ?? 0)) * 6);
    hits.push({ tool: t, score: total, reason: best });
  }
  return hits.sort((a, b) => b.score - a.score || a.tool.title.localeCompare(b.tool.title, "ar"));
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
