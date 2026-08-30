/**
 * لغتان بمسارين: العربيّةُ في الجذر والإنجليزيّةُ تحت `/en`.
 *
 * ولم نضع العربيّةَ تحت `/ar` عمداً: روابطُها منشورةٌ ومفهرسةٌ منذ الإصدار
 * الأوّل، ونقلُها يكسرها. والمسارُ المنفصلُ — لا مبدّلٌ في المكان — يجعل
 * الصفحةَ الإنجليزيّةَ قابلةً للفهرسة والمشاركة، وتعمل بلا كعكةٍ ولا سكربت.
 *
 * والعربيّةُ تبقى الأصل: كلُّ أداةٍ تُكتب عربيّةً أوّلاً، والإنجليزيّةُ تُضاف
 * متى نضجت — ولا تُعرَض في `/en` أداةٌ لم تُترجَم واجهتُها بعد، فلا يقع
 * الزائرُ على شاشةٍ نصفُها عربيّ.
 */

export const LANGS = ["ar", "en"] as const;
export type Lang = (typeof LANGS)[number];

export const DIR: Record<Lang, "rtl" | "ltr"> = { ar: "rtl", en: "ltr" };

/** يبني مساراً في اللغة المطلوبة: العربيُّ كما هو، والإنجليزيُّ بالبادئة */
export const path = (lang: Lang, p: string): string =>
  lang === "ar" ? p : p === "/" ? "/en" : `/en${p}`;

/** نظيرُ المسار في اللغة الأخرى — لوسوم hreflang ومبدّل اللغة */
export const other = (lang: Lang): Lang => (lang === "ar" ? "en" : "ar");

export type Dict = {
  brandTagline: string;
  nav: { tools: string; workflows: string; board: string; signIn: string; signUp: string; account: string };
  home: {
    title: string; lede: (n: number) => string;
    stats: { tools: string; categories: string; inBrowser: string; noSignup: string; noSignupValue: string; inBrowserValue: string };
    tasksTitle: string; tasksLede: string;
    workflowsTitle: string; workflowsLede: string;
    browseTitle: string; browseLede: string;
    newestTitle: string; newestLede: string;
    countSuffix: string;
  };
  search: {
    placeholder: string; aria: string; start: string;
    best: string; alternatives: string; allResults: string;
    empty: string; emptyHint: string; openDirectory: string;
    tryExample: string; localBadge: string;
    examples: string[];
  };
  directory: { title: string; lede: (n: number) => string; noResults: string };
  tool: {
    breadcrumbRoot: string; localBadge: string; serverBadge: string; beta: string;
    howToUse: string; examples: string; howItWorks: string; faq: string;
    related: string; noRelated: string; browseAll: string;
    reportIssue: string; nextStep: string; carryNote: string;
    favorite: string; favorited: string;
    reset: string; copy: string; copied: string; print: string; download: string;
    share: string; shared: string; saveDraft: string; draftSaved: string; fillExample: string;
    draftFound: (ago: string) => string; restore: string; deleteDraft: string;
    carried: (from: string) => string;
    exportPdf: string; exportPdfHint: string;
    templates: string; saveTemplate: string; templateName: string; save: string; cancel: string;
    noTemplates: string; deleteTemplate: string; applied: string;
    embedTitle: string; embedLede: string; embedNote: string;
    privacyLocal: string; privacyNoStore: string;
  };
  category: { startFromTask: string; startFromTaskLede: string; separatePage: string; toolsCount: (n: number) => string };
  footer: { local: string };
  time: { now: string; minutes: (n: number) => string; hours: (n: number) => string; days: (n: number) => string };
  switchTo: string;
  langName: Record<Lang, string>;
};

const ar: Dict = {
  brandTagline: "حقيبةُ أدواتٍ عربيّة",
  nav: { tools: "الدليل", workflows: "المسارات", board: "لوحتي", signIn: "دخول", signUp: "إنشاء حساب", account: "حسابي" },
  home: {
    title: "ماذا تريد أن تنجز اليوم؟",
    lede: (n) => `اكتب ما تريده بكلماتك — لا يلزمك أن تعرف اسمَ الأداة. و${n} أداةً هنا تعمل كلُّها في متصفّحك، بلا تسجيلٍ ولا إعلانات.`,
    stats: { tools: "أداةٌ جاهزة", categories: "تصنيفاً", inBrowser: "في متصفّحك", noSignup: "تسجيلٍ ولا إعلانات", noSignupValue: "بلا", inBrowserValue: "١٠٠٪" },
    tasksTitle: "ابدأ من مهمّة", tasksLede: "اختر هدفَك، ونحن نجمع لك الأدوات.",
    workflowsTitle: "لا تعرف من أين تبدأ؟", workflowsLede: "مساراتٌ جاهزةٌ تأخذك خطوةً خطوة من البداية إلى المستند.",
    browseTitle: "تصفّح بالاختصاص", browseLede: "العددُ إلى جانب كلّ تصنيفٍ مشتقٌّ من السجلّ، فلا يتقادم.",
    newestTitle: "أحدثُ ما أُضيف", newestLede: "آخرُ ثماني أدواتٍ دخلت الحقيبة.",
    countSuffix: "أدوات ←",
  },
  search: {
    placeholder: "اكتب ما تريد إنجازه…", aria: "ماذا تريد أن تنجز", start: "ابدأ",
    best: "أفضلُ خيارٍ لك", alternatives: "بدائل", allResults: "عرضُ كلّ النتائج",
    empty: "لم نجد أداةً مطابقة", emptyHint: "جرّب كلماتٍ أقلّ، أو تصفّح الدليل — قد تكون الأداةُ باسمٍ آخر.",
    openDirectory: "افتح دليل الأدوات", tryExample: "شاهد مثالاً", localBadge: "🔒 على جهازك",
    examples: [],
  },
  directory: { title: "دليل الأدوات", lede: (n) => `${n} أداةً، كلُّها تعمل في متصفّحك.`, noResults: "لا نتائج" },
  tool: {
    breadcrumbRoot: "الأدوات", localBadge: "🔒 تعمل في متصفّحك", serverBadge: "تحتاج الخادم", beta: "تجريبيّة",
    howToUse: "كيف تستعملها", examples: "أمثلةٌ جاهزة", howItWorks: "كيف تعمل الأداة؟", faq: "أسئلةٌ شائعة",
    related: "أدواتٌ ذاتُ صلة", noRelated: "لا أدواتِ صلةٍ بعد — هذه أوّلُ أداةٍ في تصنيفها.", browseAll: "تصفّح كلَّ الأدوات",
    reportIssue: "أبلغ عن مشكلةٍ أو اقترح تحسيناً", nextStep: "والخطوةُ التالية؟",
    carryNote: "ما أدخلتَه ينتقل معك إلى الأداة التالية — في جهازك وحدَه، لا في الرابط ولا على خادم.",
    favorite: "فضّلها", favorited: "في المفضّلة",
    reset: "إعادة تعيين", copy: "نسخ", copied: "نُسخ ✓", print: "طباعة", download: "تنزيل",
    share: "مشاركة", shared: "نُسخ الرابط ✓", saveDraft: "احفظ مسودّة", draftSaved: "حُفظت ✓", fillExample: "املأ مثالاً",
    draftFound: (ago) => `لك مسودّةٌ محفوظةٌ على هذا الجهاز ${ago}.`, restore: "استعِدها", deleteDraft: "احذفها",
    carried: (from) => `عُبِّئت الحقولُ ممّا أدخلتَه في ${from} — راجعها قبل الاعتماد عليها.`,
    exportPdf: "تصدير PDF", exportPdfHint: "يفتح حوارَ الطباعة — اختر «حفظ بصيغة PDF» وجهتَه.",
    templates: "قوالبي", saveTemplate: "احفظ الحاليّ كقالب", templateName: "اسمُ القالب",
    save: "احفظ القالب", cancel: "إلغاء", noTemplates: "لا قوالبَ بعد لهذه الأداة.",
    deleteTemplate: "احذف", applied: "طُبِّق القالب",
    embedTitle: "ضَع هذه الأداة في موقعك", embedLede: "مجّاناً، وتعمل فوراً",
    embedNote: "صفحةُ التضمين بلا ترويسةٍ ولا حساب، ولا تُفهرَس في محرّكات البحث — فلا تنافس صفحتَك.",
    privacyLocal: "الحسابُ كلُّه في متصفّحك — لا يُرسَل ما تُدخله إلى الخادم.",
    privacyNoStore: " ولا يُحفظ شيءٌ من مُدخلاتك إلّا إن ضغطتَ «احفظ مسودّة» — وعندها في جهازك وحدَه.",
  },
  category: {
    startFromTask: "ابدأ من مهمّة", startFromTaskLede: "لا يلزمك أن تعرف اسمَ الأداة — اختر ما تريد إنجازَه.",
    separatePage: "صفحةٌ مستقلّة", toolsCount: (n) => `${n} أداة`,
  },
  footer: { local: "كلُّ الحساب في متصفّحك" },
  time: {
    now: "قبل لحظات",
    minutes: (n) => `قبل ${n} دقيقة`, hours: (n) => `قبل ${n} ساعة`, days: (n) => `قبل ${n} يوم`,
  },
  switchTo: "English",
  langName: { ar: "العربيّة", en: "English" },
};

const en: Dict = {
  brandTagline: "Arabic-first web tools",
  nav: { tools: "Tools", workflows: "Workflows", board: "My board", signIn: "Sign in", signUp: "Create account", account: "Account" },
  home: {
    title: "What do you need to get done?",
    lede: (n) => `Describe it in your own words — you don't need the tool's name. All ${n} tools run in your browser: no sign-up, no ads, nothing uploaded.`,
    stats: { tools: "tools ready", categories: "categories", inBrowser: "in your browser", noSignup: "sign-up, no ads", noSignupValue: "No", inBrowserValue: "100%" },
    tasksTitle: "Start from a task", tasksLede: "Pick your goal — we'll gather the tools.",
    workflowsTitle: "Not sure where to start?", workflowsLede: "Guided paths that take you step by step from a blank page to a finished document.",
    browseTitle: "Browse by field", browseLede: "Every count is derived from the registry, so it never goes stale.",
    newestTitle: "Recently added", newestLede: "The last eight tools to join the kit.",
    countSuffix: "tools →",
  },
  search: {
    placeholder: "Describe what you want to do…", aria: "What do you need to get done", start: "Go",
    best: "Best match", alternatives: "Alternatives", allResults: "See all results",
    empty: "No matching tool", emptyHint: "Try fewer words, or browse the directory — the tool may go by another name.",
    openDirectory: "Open the directory", tryExample: "See an example", localBadge: "🔒 On your device",
    examples: [
      "convert metres to feet",
      "check colour contrast",
      "generate a strong password",
      "decode base64",
      "hex to rgb",
    ],
  },
  directory: { title: "Tool directory", lede: (n) => `${n} tools, all running in your browser.`, noResults: "No results" },
  tool: {
    breadcrumbRoot: "Tools", localBadge: "🔒 Runs in your browser", serverBadge: "Needs the server", beta: "Beta",
    howToUse: "How to use it", examples: "Worked examples", howItWorks: "How it works", faq: "Frequently asked",
    related: "Related tools", noRelated: "No related tools yet — this is the first in its category.", browseAll: "Browse all tools",
    reportIssue: "Report a problem or suggest an improvement", nextStep: "What's next?",
    carryNote: "What you entered travels with you to the next tool — on your device only, never in the URL or on a server.",
    favorite: "Favourite", favorited: "Favourited",
    reset: "Reset", copy: "Copy", copied: "Copied ✓", print: "Print", download: "Download",
    share: "Share", shared: "Link copied ✓", saveDraft: "Save draft", draftSaved: "Saved ✓", fillExample: "Fill an example",
    draftFound: (ago) => `You have a draft saved on this device ${ago}.`, restore: "Restore it", deleteDraft: "Delete it",
    carried: (from) => `Fields were filled from what you entered in ${from} — check them before relying on them.`,
    exportPdf: "Export PDF", exportPdfHint: "Opens the print dialog — choose \"Save as PDF\" as the destination.",
    templates: "My templates", saveTemplate: "Save current as template", templateName: "Template name",
    save: "Save template", cancel: "Cancel", noTemplates: "No templates for this tool yet.",
    deleteTemplate: "Delete", applied: "Template applied",
    embedTitle: "Put this tool on your site", embedLede: "Free, and it works instantly",
    embedNote: "The embed page carries no header and no account, and search engines don't index it — so it won't compete with your page.",
    privacyLocal: "Everything is computed in your browser — what you type is never sent to a server.",
    privacyNoStore: " Nothing you enter is saved unless you press Save draft — and then only on your device.",
  },
  category: {
    startFromTask: "Start from a task", startFromTaskLede: "You don't need the tool's name — pick what you want to get done.",
    separatePage: "Own page", toolsCount: (n) => `${n} tools`,
  },
  footer: { local: "Everything computed in your browser" },
  time: {
    now: "moments ago",
    minutes: (n) => `${n} min ago`, hours: (n) => `${n} h ago`, days: (n) => `${n} d ago`,
  },
  switchTo: "العربيّة",
  langName: { ar: "العربيّة", en: "English" },
};

const DICTS: Record<Lang, Dict> = { ar, en };

export const dict = (lang: Lang): Dict => DICTS[lang];
