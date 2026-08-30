import type { ComponentType } from "react";
import { CATEGORY_IDS, categoryById } from "@/tools/categories";
import type { Lang } from "@/lib/i18n";

/**
 * سجلُّ الأدوات — عقدُ المنصّة مع أدواتها.
 *
 * إضافةُ أداةٍ = مكوّنٌ + بيانٌ واحد. ومنه تُشتقّ تلقائيّاً: الصفحةُ والمسارُ
 * والوسومُ وsitemap وSchema.org والبحثُ والتصنيفُ والمفضّلةُ والأدواتُ ذاتُ الصلة.
 *
 * **`component` نصٌّ للتوثيق والإدارة، و`load()` هو ما يُحمّل فعلاً.** الاسمُ
 * النصّيُّ وحدَه يحتاج خريطةَ ربطٍ تُصان في ملفٍّ ثانٍ — وهو ما نتجنّبه — ويكسر
 * التحميلَ الكسول. فالحقلان معاً: الاسمُ يُقرأ في لوحة الإدارة، والدالّةُ تُنفَّذ.
 */

export type ToolStatus = "draft" | "beta" | "published" | "archived";
export type Complexity = "basic" | "medium" | "advanced";
export type Visibility = "public" | "authenticated" | "premium";

export type Localized = { ar: string; en: string };

/** ما تدعمه الأداة — يقود أزرارَ القالب ومرشّحاتِ الدليل */
export type ToolCapabilities = {
  copyResult: boolean;
  print: boolean;
  exportPdf: boolean;
  exportCsv: boolean;
  saveDraft: boolean;
  share: boolean;
  offline: boolean;
};

export type ToolPrivacy = {
  /** أين يجري الحساب فعلاً */
  processing: "local" | "server" | "hybrid";
  storesUserData: boolean;
  dataRetention?: string;
};

export type ToolSeo = {
  title: string;
  description: string;
  canonicalPath: string;
  noIndex?: boolean;
};

export type ToolFaq = { q: string; a: string };

/** جدولُ أمثلةٍ مرجعيّ: قيمٌ شائعةٌ محسوبةٌ سلفاً يقرؤها الزائرُ بلا إدخال */
export type ToolExamples = { caption?: string; columns: string[]; rows: string[][] };

/** فصلُ شرحٍ مطوّل — يجيب عن «لماذا» لا «كيف» */
export type ToolSection = { heading: string; body: string };

/**
 * الخطوةُ التالية — ما يفعله المستخدمُ **بعد** ظهور النتيجة.
 *
 * وهذه هي طبقةُ «تابع»: أداةٌ تنتهي عند رقمٍ تترك المستخدمَ يبحث من جديد،
 * وأداةٌ تقول «والآن أنشئ عرضَ سعرٍ بهذه الأرقام» تُكمل عملَه.
 *
 * و`carry` خريطةُ نقلٍ صريحة: معرّفُ حقلٍ عندنا ← معرّفُ حقلٍ هناك. صريحةٌ
 * لأنّ التخمينَ بالاسم يملأ حقلاً بقيمةٍ خطأ، وذلك أسوأُ من ألّا يُملأ شيء.
 */
/**
 * مثالٌ جاهز: معرّفُ حقلٍ ← قيمة.
 * الحقلُ الفارغُ أوّلَ زيارةٍ يُصمِت المستخدم؛ ومثالٌ واقعيٌّ بنقرةٍ يريه
 * ما تفعله الأداةُ قبل أن يفكّر فيما يُدخل.
 */
export type ToolDemo = {
  fields: Record<string, string>;
  /** اسمُ مجموعة الرقاقات ← ترتيبُ ما يُنقَر منها. لازمٌ لأنّ بعضَ الحقول لا
   *  تُرسَم أصلاً إلّا في وضعٍ بعينه — فملءُ قيمةٍ قبل اختيار الوضع لا يفعل شيئاً. */
  chips?: Record<string, number[]>;
};

export type NextStep = {
  slug: string;
  label: string;
  /** لازمٌ متى كانت الأداتان إنجليزيّتين — وإلّا حُذفت الخطوةُ من `/en` بدل أن تُعرَض عربيّة */
  labelEn?: string;
  carry?: Record<string, string>;
};

export type ToolManifest = {
  id: string;
  slug: string;
  version: string;
  status: ToolStatus;

  title: Localized;
  description: Localized;

  categoryId: string;
  subcategoryId?: string;
  tags: string[];
  keywords: string[];
  keywordsEn: string[];

  icon: string;
  coverImage?: string;
  accentColor?: string;

  complexity: Complexity;
  visibility: Visibility;

  /** اسمُ المكوّن — للتوثيق ولوحة الإدارة */
  component: string;
  route: string;

  capabilities: ToolCapabilities;
  privacy: ToolPrivacy;
  seo: ToolSeo;

  /** صلاتٌ مُعلَنةٌ تسبق الصلاتِ المحسوبة */
  relatedToolIds?: string[];
  publishedAt?: string;
  updatedAt?: string;

  instructions?: string;
  /** خطواتٌ مرقّمةٌ: ماذا يفعل المستخدمُ بيده، بالترتيب */
  useSteps?: string[];
  examples?: ToolExamples;
  howItWorks?: string[];
  /** فصولٌ تشرح الخلفيّةَ والفروقَ والمزالق */
  deepDive?: ToolSection[];
  /** تنبيهُ حدودٍ يظهر تحت الأداة مباشرةً — لما نتيجتُه تقديرٌ لا حكمٌ قاطع */
  caveat?: string;
  demo?: ToolDemo;
  nextSteps?: NextStep[];
  faq?: ToolFaq[];
  /**
   * اللغاتُ التي تُرجمت واجهتُها. العربيّةُ دائماً، والإنجليزيّةُ متى نضجت.
   * ولا تُعرَض في `/en` أداةٌ لم تُعلن "en" — فصفحةٌ نصفُها عربيٌّ ونصفُها
   * إنكليزيٌّ أسوأُ من صفحةٍ غيرِ موجودة.
   */
  langs: Lang[];
  /** المحتوى الإنجليزيّ — يُعرَض في `/en` وحدَه، وما لم يُترجَم يُحذَف لا يُخلَط */
  instructionsEn?: string;
  useStepsEn?: string[];
  howItWorksEn?: string[];
  faqEn?: ToolFaq[];

  load: () => Promise<{ default: ComponentType }>;
};

/* ————— الشكلُ المختصرُ الذي يُكتب في السجلّ ————— */

export type ToolInput = {
  slug: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn?: string;
  category: string;
  subcategory?: string;
  icon: string;
  version: string;
  keywords?: string[];
  keywordsEn?: string[];
  tags?: string[];
  status?: ToolStatus;
  complexity?: Complexity;
  visibility?: Visibility;
  component?: string;
  capabilities?: Partial<ToolCapabilities>;
  privacy?: Partial<ToolPrivacy>;
  seo?: Partial<ToolSeo>;
  relatedToolIds?: string[];
  publishedAt?: string;
  updatedAt?: string;
  instructions?: string;
  useSteps?: string[];
  examples?: ToolExamples;
  howItWorks?: string[];
  deepDive?: ToolSection[];
  caveat?: string;
  demo?: ToolDemo;
  nextSteps?: NextStep[];
  faq?: ToolFaq[];
  langs?: Lang[];
  instructionsEn?: string;
  useStepsEn?: string[];
  howItWorksEn?: string[];
  faqEn?: ToolFaq[];
  load: () => Promise<{ default: ComponentType }>;
};

const DEFAULT_CAPS: ToolCapabilities = {
  copyResult: true, print: false, exportPdf: false, exportCsv: false,
  saveDraft: false, share: true, offline: true,
};

/** الأصلُ في أدوات الحقيبة أنّها تحسب محلّيّاً ولا تحفظ شيئاً */
const DEFAULT_PRIVACY: ToolPrivacy = { processing: "local", storesUserData: false };

const pascal = (slug: string) =>
  slug.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");

/** يحوّل المختصرَ إلى بيانٍ كامل — فيبقى السجلُّ مقروءاً والعقدُ كاملاً */
export function defineTool(t: ToolInput): ToolManifest {
  const route = `/tools/${t.slug}`;
  return {
    id: t.slug,
    slug: t.slug,
    version: t.version,
    status: t.status ?? "published",
    title: { ar: t.title, en: t.titleEn },
    description: { ar: t.description, en: t.descriptionEn ?? t.description },
    categoryId: t.category,
    subcategoryId: t.subcategory,
    tags: t.tags ?? [],
    keywords: t.keywords ?? [],
    keywordsEn: t.keywordsEn ?? [],
    icon: t.icon,
    coverImage: undefined,
    accentColor: undefined,
    complexity: t.complexity ?? "basic",
    visibility: t.visibility ?? "public",
    component: t.component ?? pascal(t.slug),
    route,
    capabilities: { ...DEFAULT_CAPS, ...t.capabilities },
    privacy: { ...DEFAULT_PRIVACY, ...t.privacy },
    seo: {
      title: t.seo?.title ?? t.title,
      description: t.seo?.description ?? t.description,
      canonicalPath: t.seo?.canonicalPath ?? route,
      noIndex: t.seo?.noIndex,
    },
    relatedToolIds: t.relatedToolIds,
    publishedAt: t.publishedAt,
    updatedAt: t.updatedAt,
    instructions: t.instructions,
    useSteps: t.useSteps,
    examples: t.examples,
    howItWorks: t.howItWorks,
    deepDive: t.deepDive,
    caveat: t.caveat,
    demo: t.demo,
    nextSteps: t.nextSteps,
    faq: t.faq,
    langs: t.langs ?? ["ar"],
    instructionsEn: t.instructionsEn,
    useStepsEn: t.useStepsEn,
    howItWorksEn: t.howItWorksEn,
    faqEn: t.faqEn,
    load: t.load,
  };
}

/**
 * البيانُ بلا دالّة التحميل — هذا وحدَه ما يعبر إلى مكوّنات العميل.
 * الدوالُّ لا تُسلسَل عبر حدّ الخادم/العميل، والفصلُ هنا يجعل ذلك خطأَ أنواعٍ لا خطأَ تشغيل.
 */
export type ToolSummary = Omit<ToolManifest, "load">;

export function summarize(t: ToolManifest): ToolSummary {
  const { load: _load, ...rest } = t;
  return rest;
}

export const summarizeAll = (all: ToolManifest[]): ToolSummary[] => all.map(summarize);

/**
 * البطاقة — ما تحتاجه القوائمُ والبحثُ فقط، وهذا **وحدَه** ما يعبر إلى العميل.
 *
 * البيانُ الكامل يحمل الشروحَ والأسئلةَ والخطواتِ وseo، وكلُّه يُسلسَل مرّتين
 * (في HTML وفي حمولة RSC) لو مرّ إلى مكوّنِ عميل. وبحثُ الترويسة يستقبل كلَّ
 * الأدوات في **كلّ صفحة**، فالفرقُ يضرب في عدد الأدوات وفي عدد الصفحات معاً.
 * والحجمُ ليس مسألةَ بايتاتٍ وحدَه: تجاوزُ حدِّ progressiveChunkSize يجعل React
 * تؤجّل حدودَ Suspense فتصل بلا ترطيب — وهو عطبٌ صامتٌ وقعنا فيه في v0.10.0.
 */
export type ToolListing = {
  id: string;
  slug: string;
  route: string;
  title: Localized;
  description: Localized;
  categoryId: string;
  subcategoryId?: string;
  icon: string;
  tags: string[];
  keywords: string[];
  keywordsEn: string[];
  status: ToolStatus;
  complexity: Complexity;
  /** صغيران لكنّ الدليل يرشّح بهما ويفرز — فيبقيان في البطاقة */
  capabilities: ToolCapabilities;
  publishedAt?: string;
  /** يحسب في المتصفّح — تحتاجه شارةُ الخصوصيّة في القوائم */
  local: boolean;
  /** علمٌ فقط لا القيم: البحثُ يعرض «شاهد مثالاً» متى وُجد */
  hasDemo: boolean;
  langs: Lang[];
};

export function toListing(t: ToolManifest | ToolSummary): ToolListing {
  return {
    id: t.id, slug: t.slug, route: t.route,
    title: t.title, description: t.description,
    categoryId: t.categoryId, subcategoryId: t.subcategoryId,
    icon: t.icon, tags: t.tags, keywords: t.keywords, keywordsEn: t.keywordsEn,
    status: t.status, complexity: t.complexity,
    capabilities: t.capabilities, publishedAt: t.publishedAt,
    local: t.privacy.processing === "local",
    hasDemo: !!t.demo && Object.keys(t.demo.fields).length > 0,
    langs: t.langs,
  };
}

export const toListings = (all: (ToolManifest | ToolSummary)[]): ToolListing[] => all.map(toListing);

/* ————— واجهةُ الأداة الداخليّة (SDK) ————— */

export type ValidationIssue = { field?: string; message: string };
export type ValidationResult = { ok: true } | { ok: false; errors: ValidationIssue[] };

export type ExportFormat = "pdf" | "csv" | "json";

/**
 * عقدُ الأداة البرمجيّ. الحقولُ كلُّها اختياريّةٌ عدا البيان: أداةٌ بسيطةٌ
 * تكتفي بمكوّنها، وأداةٌ متقدّمةٌ تُعلن حسابَها وتحقّقَها وتصديرَها فيستفيد
 * منها القالبُ والاختباراتُ والمشاركةُ برابطٍ مُعبّأ.
 */
export type ToolModule<I = unknown, O = unknown> = {
  manifest: ToolManifest;
  calculate?: (input: I) => O;
  validate?: (input: I) => ValidationResult;
  /** حالةُ الأداة إلى نصٍّ يصلح للرابط أو للمسودّة */
  serialize?: (input: I) => string;
  deserialize?: (value: string) => I;
  export?: (result: O, format: ExportFormat) => Promise<Blob>;
};

export const ok: ValidationResult = { ok: true };
export const fail = (...errors: ValidationIssue[]): ValidationResult => ({ ok: false, errors });

/* ————— استعلاماتُ السجلّ ————— */

/** المعروضُ للعامّة: منشورٌ أو تجريبيّ */
/** القيودُ أدناه على الحدّ الأدنى من الحقول، فتعمل على البيان وعلى البطاقة معاً */
export const isLive = (t: { status: ToolStatus }) => t.status === "published" || t.status === "beta";
export const isIndexable = (t: ToolSummary) => t.status === "published" && !t.seo.noIndex;

export function publishedTools<T extends { status: ToolStatus }>(all: T[]): T[] {
  return all.filter(isLive);
}

export function toolBySlug(all: ToolManifest[], slug: string): ToolManifest | undefined {
  return all.find((t) => t.slug === slug);
}

export type CategoryCount = {
  id: string; name: string; count: number;
  subs: { id: string; name: string; count: number }[];
};

/** العددُ يُشتقّ من السجلّ — لا يُكتب في مكانٍ ثانٍ فيتقادم */
type Categorised = { status: ToolStatus; categoryId: string; subcategoryId?: string };

export function categoryCounts(all: Categorised[]): CategoryCount[] {
  const live = publishedTools(all);
  return CATEGORY_IDS.map((id) => {
    const def = categoryById(id)!;
    const inCat = live.filter((t) => t.categoryId === id);
    return {
      id,
      name: def.name,
      count: inCat.length,
      subs: def.subcategories
        .map((s) => ({ id: s.id, name: s.name, count: inCat.filter((t) => t.subcategoryId === s.id).length }))
        .filter((s) => s.count > 0),
    };
  });
}

/** الصلاتُ المُعلَنةُ أوّلاً، ثمّ التصنيفُ الفرعيّ، ثمّ الوسومُ والكلمات، ثمّ التصنيف */
type Relatable = { id: string; slug: string; status: ToolStatus; categoryId: string; subcategoryId?: string; keywords: string[]; tags: string[]; title: Localized; relatedToolIds?: string[] };

export function relatedTools<T extends Relatable>(all: T[], tool: Relatable, limit = 4): T[] {
  const live = publishedTools(all).filter((t) => t.slug !== tool.slug);
  const declared = new Set(tool.relatedToolIds ?? []);
  const kw = new Set([...tool.keywords, ...tool.tags]);
  const score = (t: Relatable) => {
    let s = declared.has(t.id) ? 100 : 0;
    if (t.categoryId === tool.categoryId) s += 2;
    if (tool.subcategoryId && t.subcategoryId === tool.subcategoryId) s += 4;
    s += [...t.keywords, ...t.tags].filter((k) => kw.has(k)).length * 3;
    return s;
  };
  return live
    .map((t) => ({ t, s: score(t) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.t.title.ar.localeCompare(b.t.title.ar, "ar"))
    .slice(0, limit)
    .map((x) => x.t);
}

/** فحوصُ سلامةِ السجلّ — تُشغَّل في الاختبارات */
export function validateRegistry(all: ToolSummary[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  const ids = new Set(all.map((t) => t.id));
  for (const t of all) {
    if (seen.has(t.slug)) errors.push(`معرّفٌ مكرّر: ${t.slug}`);
    seen.add(t.slug);
    if (!/^[a-z0-9-]+$/.test(t.slug)) errors.push(`معرّفٌ غيرُ صالح: ${t.slug}`);
    if (!t.title.ar.trim()) errors.push(`${t.slug}: بلا اسمٍ عربيّ`);
    if (!t.title.en.trim()) errors.push(`${t.slug}: بلا اسمٍ إنكليزيّ`);
    if (!t.description.ar.trim()) errors.push(`${t.slug}: بلا وصف`);
    if (t.route !== `/tools/${t.slug}`) errors.push(`${t.slug}: المسارُ لا يطابق المعرّف`);
    if (t.seo.canonicalPath !== t.route && !t.seo.noIndex) {
      errors.push(`${t.slug}: المسارُ المعياريُّ يخالف مسارَ الأداة`);
    }
    const cat = categoryById(t.categoryId);
    if (!cat) errors.push(`${t.slug}: تصنيفٌ مجهول «${t.categoryId}»`);
    else if (t.subcategoryId && !cat.subcategories.some((s) => s.id === t.subcategoryId)) {
      errors.push(`${t.slug}: تصنيفٌ فرعيٌّ مجهول «${t.subcategoryId}»`);
    }
    if (!/^\d+\.\d+\.\d+$/.test(t.version)) errors.push(`${t.slug}: إصدارٌ غيرُ SemVer`);
    if (!t.langs.includes("ar")) errors.push(`${t.slug}: العربيّةُ أصلٌ لا تُترك`);
    if (t.langs.includes("en")) {
      if (!t.instructionsEn) errors.push(`${t.slug}: يعلن الإنجليزيّةَ بلا instructionsEn`);
      // الوصفُ يرتدُّ إلى العربيّة متى غاب descriptionEn، فيتسرّب إلى صفحةٍ إنكليزيّة
      if (t.description.en === t.description.ar) errors.push(`${t.slug}: يعلن الإنجليزيّةَ بلا descriptionEn`);
    }
    for (const n of t.nextSteps ?? []) {
      if (!ids.has(n.slug)) errors.push(`${t.slug}: خطوةٌ تالية إلى أداةٍ غير موجودة «${n.slug}»`);
      if (n.slug === t.id) errors.push(`${t.slug}: خطوةٌ تالية إلى نفسه`);
      if (!n.label.trim()) errors.push(`${t.slug}: خطوةٌ تالية بلا نصّ`);
      // خطوةٌ بين أداتين إنجليزيّتين بلا عنوانٍ إنجليزيٍّ تختفي من `/en` بلا سبب
      const target = all.find((x) => x.id === n.slug);
      if (t.langs.includes("en") && target?.langs.includes("en") && !n.labelEn) {
        errors.push(`${t.slug} ← ${n.slug}: خطوةٌ بين أداتين إنجليزيّتين بلا labelEn`);
      }
    }
    for (const r of t.relatedToolIds ?? []) {
      if (!ids.has(r)) errors.push(`${t.slug}: صلةٌ مُعلَنةٌ إلى أداةٍ غير موجودة «${r}»`);
      if (r === t.id) errors.push(`${t.slug}: يعلن صلةً بنفسه`);
    }
  }
  return errors;
}
