import type { ComponentType } from "react";
import { CATEGORY_IDS, categoryById } from "@/tools/categories";

/**
 * سجلُّ الأدوات — نقطةُ التسجيل الوحيدة في المنصّة.
 *
 * إضافةُ أداةٍ = سطرٌ واحدٌ هنا. لا صفحةَ تُنشأ ولا قائمةَ تُحدَّث ولا SEO يُكتب
 * يدويّاً: الصفحةُ والبحثُ والتصنيفُ والوسومُ والأدواتُ ذاتُ الصلة كلُّها مشتقّة.
 *
 * **لماذا `load()` لا اسمٌ نصّيّ للمكوّن:** الاسمُ النصّيّ يحتاج خريطةَ ربطٍ
 * تُصان في ملفٍّ ثانٍ — وهو عينُ ما نتجنّبه — ويمنع التحميلَ الكسول.
 */

export type ToolStatus = "published" | "draft" | "disabled";
export type Complexity = "simple" | "medium" | "advanced";

export type ToolManifest = {
  /** المعرّف = الرابط */
  id: string;
  slug: string;
  /** الاسمُ العربيّ */
  title: string;
  titleEn: string;
  description: string;
  descriptionEn?: string;
  category: string;
  subcategory?: string;
  /** كلماتٌ يبحث بها الناسُ ولا تَرِد في الاسم */
  keywords: string[];
  keywordsEn?: string[];
  icon: string;
  version: string;
  status: ToolStatus;
  complexity: Complexity;
  /** تعليماتٌ قصيرةٌ أعلى منطقة العمل */
  instructions?: string;
  /** «كيف تعمل الأداة؟» — فقرةٌ لكلّ نقطة */
  howItWorks?: string[];
  /** تُظهر زرَّ الطباعة في الإطار (أداةٌ مخرَجُها ورقة) */
  printable?: boolean;
  seo?: { title?: string; description?: string };
  load: () => Promise<{ default: ComponentType }>;
};

/** ما يُكتب في السجلّ: الباقي يُملأ بقيمٍ افتراضيّة */
export type ToolInput =
  Omit<ToolManifest, "id" | "status" | "complexity" | "keywords" | "titleEn"> &
  Partial<Pick<ToolManifest, "id" | "status" | "complexity" | "keywords" | "titleEn">>;

export function defineTool(t: ToolInput): ToolManifest {
  return {
    id: t.id ?? t.slug,
    status: "published",
    complexity: "simple",
    keywords: [],
    titleEn: t.titleEn ?? t.slug,
    ...t,
  };
}

/**
 * البيانُ بلا دالّة التحميل — هذا وحدَه ما يعبر إلى مكوّنات العميل.
 * (الدوالُّ لا تُسلسَل عبر حدّ الخادم/العميل، والفصلُ هنا يجعل ذلك خطأَ أنواعٍ لا خطأَ تشغيل.)
 */
export type ToolSummary = Omit<ToolManifest, "load">;

export function summarize(t: ToolManifest): ToolSummary {
  const { load: _load, ...rest } = t;
  return rest;
}

export const summarizeAll = (all: ToolManifest[]): ToolSummary[] => all.map(summarize);

/* ————— استعلاماتُ السجلّ ————— */

export const isLive = (t: ToolSummary) => t.status === "published";

export function publishedTools<T extends ToolSummary>(all: T[]): T[] {
  return all.filter(isLive);
}

export function toolBySlug(all: ToolManifest[], slug: string): ToolManifest | undefined {
  return all.find((t) => t.slug === slug);
}

export type CategoryCount = { id: string; name: string; count: number; subs: { id: string; name: string; count: number }[] };

/** العددُ يُشتقّ من السجلّ — لا يُكتب في مكانٍ ثانٍ فيتقادم */
export function categoryCounts(all: ToolSummary[]): CategoryCount[] {
  const live = publishedTools(all);
  return CATEGORY_IDS.map((id) => {
    const def = categoryById(id)!;
    const inCat = live.filter((t) => t.category === id);
    return {
      id,
      name: def.name,
      count: inCat.length,
      subs: def.subcategories
        .map((s) => ({ id: s.id, name: s.name, count: inCat.filter((t) => t.subcategory === s.id).length }))
        .filter((s) => s.count > 0),
    };
  });
}

/** أدواتٌ ذاتُ صلة: التصنيفُ الفرعيّ أوّلاً، ثمّ اشتراكُ الكلمات، ثمّ التصنيف */
export function relatedTools<T extends ToolSummary>(all: T[], tool: ToolSummary, limit = 4): T[] {
  const live = publishedTools(all).filter((t) => t.slug !== tool.slug);
  const kw = new Set(tool.keywords);
  const score = (t: ToolSummary) => {
    let s = 0;
    if (t.category === tool.category) s += 2;
    if (tool.subcategory && t.subcategory === tool.subcategory) s += 4;
    s += t.keywords.filter((k) => kw.has(k)).length * 3;
    return s;
  };
  return live
    .map((t) => ({ t, s: score(t) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.t.title.localeCompare(b.t.title, "ar"))
    .slice(0, limit)
    .map((x) => x.t);
}

/** فحوصُ سلامةِ السجلّ — تُشغَّل في الاختبارات وعند الإقلاع في التطوير */
export function validateRegistry(all: ToolSummary[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const t of all) {
    if (seen.has(t.slug)) errors.push(`معرّفٌ مكرّر: ${t.slug}`);
    seen.add(t.slug);
    if (!/^[a-z0-9-]+$/.test(t.slug)) errors.push(`معرّفٌ غيرُ صالح: ${t.slug}`);
    if (!t.title.trim()) errors.push(`${t.slug}: بلا اسمٍ عربيّ`);
    if (!t.description.trim()) errors.push(`${t.slug}: بلا وصف`);
    const cat = categoryById(t.category);
    if (!cat) errors.push(`${t.slug}: تصنيفٌ مجهول «${t.category}»`);
    else if (t.subcategory && !cat.subcategories.some((s) => s.id === t.subcategory)) {
      errors.push(`${t.slug}: تصنيفٌ فرعيٌّ مجهول «${t.subcategory}»`);
    }
    if (!/^\d+\.\d+\.\d+$/.test(t.version)) errors.push(`${t.slug}: إصدارٌ غيرُ SemVer`);
  }
  return errors;
}
