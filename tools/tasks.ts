/**
 * المهامُّ والمسارات: مدخلٌ بالهدف لا بالتصنيف.
 * «أريد تسعير منتج» أوضحُ من «حسابات وأعمال» لمن لا يعرف اسمَ الأداة.
 */

export type TaskCard = {
  id: string;
  title: string;
  blurb: string;
  icon: string;
  /** أدواتٌ تخدم هذا الهدف، بترتيبِ الأرجح */
  tools: string[];
};

export const TASKS: TaskCard[] = [
  {
    id: "invoicing",
    title: "أُنشئ فاتورةً أو عرضَ سعر",
    blurb: "مستندٌ جاهزٌ للطباعة، بمبلغٍ مكتوبٍ بالحروف وضريبةٍ محسوبة.",
    icon: "receipt",
    tools: ["invoice", "number-to-words", "vat"],
  },
  {
    id: "pricing",
    title: "أُسعّر منتجاً وأحسب ربحي",
    blurb: "من التكلفة إلى سعر البيع، بهامشٍ تعرف مقدارَه.",
    icon: "tag",
    tools: ["pricing", "discounts", "percentage", "vat"],
  },
  {
    id: "money",
    title: "أحسب أقساطاً وزكاةً ومستحقّات",
    blurb: "قروضٌ وأجورٌ وزكاةٌ ونهايةُ خدمة.",
    icon: "loan",
    tools: ["loan", "zakat", "timesheet", "end-of-service", "split-bill"],
  },
  {
    id: "text",
    title: "أكتب نصّاً وأدقّقه",
    blurb: "تنظيفٌ وتشكيلٌ وعدٌّ ومقارنةٌ وتحويلُ صيغ.",
    icon: "docs",
    tools: ["word-counter", "clean-text", "strip-diacritics", "find-replace", "text-diff", "markdown"],
  },
  {
    id: "convert",
    title: "أحوّل تاريخاً أو رقماً",
    blurb: "هجريٌّ وميلاديٌّ، وأرقامٌ عربيّةٌ ولاتينيّة.",
    icon: "calendar",
    tools: ["hijri-gregorian", "arabic-numerals", "number-to-words"],
  },
  {
    id: "banking",
    title: "أتحقّق قبل تحويلٍ ماليّ",
    blurb: "رقمُ الحساب الدوليّ سليمٌ قبل أن تُرسل.",
    icon: "bank",
    tools: ["iban", "number-to-words"],
  },
];

export type WorkflowStep = {
  toolSlug: string;
  /** ماذا ينجز المستخدم في هذه الخطوة */
  goal: string;
  /** ما يحمله معه إلى الخطوة التالية */
  carry?: string;
};

export type Workflow = {
  id: string;
  title: string;
  blurb: string;
  icon: string;
  steps: WorkflowStep[];
};

export const WORKFLOWS: Workflow[] = [
  {
    id: "launch-product",
    title: "إطلاقُ منتج",
    blurb: "من التكلفة إلى فاتورةٍ جاهزة، خطوةً خطوة.",
    icon: "tag",
    steps: [
      { toolSlug: "pricing", goal: "حدّد سعرَ البيع من التكلفة والهامش الذي تريده", carry: "سعرُ البيع" },
      { toolSlug: "vat", goal: "أضِف الضريبةَ إلى سعر البيع لتعرف ما يدفعه العميل", carry: "السعرُ شاملَ الضريبة" },
      { toolSlug: "number-to-words", goal: "اكتب المبلغَ بالحروف كما تتطلّب المستندات", carry: "المبلغُ كتابةً" },
      { toolSlug: "invoice", goal: "جهّز الفاتورةَ واطبعها أو احفظها PDF" },
    ],
  },
  {
    id: "monthly-close",
    title: "إقفالُ شهرٍ ماليّ",
    blurb: "أجورٌ وضريبةٌ ومستحقّاتٌ في مسارٍ واحد.",
    icon: "clock",
    steps: [
      { toolSlug: "timesheet", goal: "اجمع ساعاتِ العمل واحسب الأجر", carry: "إجماليُّ الأجور" },
      { toolSlug: "percentage", goal: "احسب نسبَ الزيادة أو الاستقطاع" },
      { toolSlug: "vat", goal: "استخرج الضريبةَ من المبالغ الشاملة" },
      { toolSlug: "invoice", goal: "أصدر فاتورةَ الشهر" },
    ],
  },
  {
    id: "clean-document",
    title: "تجهيزُ نصٍّ للنشر",
    blurb: "من نصٍّ فوضويٍّ إلى مستندٍ نظيفٍ مقيس.",
    icon: "broom",
    steps: [
      { toolSlug: "clean-text", goal: "نظّف المسافاتِ والأسطرَ والمحارفَ الخفيّة", carry: "النصُّ النظيف" },
      { toolSlug: "strip-diacritics", goal: "جرّد التشكيلَ إن كان النصُّ للبحث لا للنشر" },
      { toolSlug: "word-counter", goal: "قِس الطولَ وزمنَ القراءة" },
      { toolSlug: "platform-limits", goal: "تأكّد أنّه يسع المنصّةَ التي تنشر فيها" },
    ],
  },
];

export const workflowById = (id: string) => WORKFLOWS.find((w) => w.id === id);
export const taskById = (id: string) => TASKS.find((t) => t.id === id);
