import type { ComponentType } from "react";

/**
 * سجلّ أدوات الحقيبة — نقطة التسجيل الوحيدة.
 * كلّ أداة تعيش في tools/<slug>/ ولها بيان تعريف هنا؛
 * دمجُ أيّ أداة يخضع لعقد التطبيع الجامع (docs/normalization-contract.md).
 */
export type ToolManifest = {
  slug: string;
  nameAr: string;
  descriptionAr: string;
  /** slug تصنيفٍ موجودٍ في القاعدة */
  category: string;
  /** اسم أيقونة من components/icons.tsx */
  icon: string;
  version: string;
  load: () => Promise<{ default: ComponentType }>;
};

export const TOOLS: ToolManifest[] = [
  {
    slug: "word-counter",
    nameAr: "عدّاد الكلمات العربيّ",
    descriptionAr: "كلماتٌ وحروفٌ وجملٌ وزمنُ قراءة — يفهم العربيّةَ وتشكيلَها، ولا يغادر النصُّ متصفّحَك.",
    category: "docs",
    icon: "counter",
    version: "1.0.0",
    load: () => import("@/tools/word-counter/tool"),
  },
  {
    slug: "number-to-words",
    nameAr: "الأرقام إلى كلمات",
    descriptionAr: "تفقيطُ المبالغ للفواتير والشيكات بالعربيّة والإنكليزيّة — بقواعد العدد الصحيحة.",
    category: "business",
    icon: "numbers",
    version: "1.0.0",
    load: () => import("@/tools/number-to-words/tool"),
  },
  {
    slug: "hijri-gregorian",
    nameAr: "التقويم الهجريّ والميلاديّ",
    descriptionAr: "تحويلٌ في الاتّجاهين مع اسم اليوم — أمّ القرى أو الحسابيّ المدنيّ.",
    category: "convert",
    icon: "calendar",
    version: "1.0.0",
    load: () => import("@/tools/hijri-gregorian/tool"),
  },

  /* ————— نصوص ومستندات ————— */
  {
    slug: "strip-diacritics",
    nameAr: "إزالة التشكيل",
    descriptionAr: "تجريدُ النصّ من التشكيل والتطويل، وتوحيدُ الألف والتاء للبحث والمطابقة.",
    category: "docs", icon: "eraser", version: "1.0.0",
    load: () => import("@/tools/strip-diacritics/tool"),
  },
  {
    slug: "arabic-numerals",
    nameAr: "تحويل الأرقام",
    descriptionAr: "بين العربيّة-الهنديّة (٠١٢) واللاتينيّة (012) داخل نصٍّ كامل.",
    category: "docs", icon: "digits", version: "1.0.0",
    load: () => import("@/tools/arabic-numerals/tool"),
  },
  {
    slug: "keyboard-fix",
    nameAr: "تصحيح لوحة المفاتيح",
    descriptionAr: "نصٌّ كُتب والتخطيطُ خاطئ يعود إلى لغته الصحيحة.",
    category: "docs", icon: "keyboard", version: "1.0.0",
    load: () => import("@/tools/keyboard-fix/tool"),
  },
  {
    slug: "clean-text",
    nameAr: "تنظيف النصّ",
    descriptionAr: "مسافاتٌ زائدةٌ وأسطرٌ فارغةٌ ومحارفُ خفيّةٌ تفسد البحث.",
    category: "docs", icon: "broom", version: "1.0.0",
    load: () => import("@/tools/clean-text/tool"),
  },
  {
    slug: "find-replace",
    nameAr: "بحث واستبدال",
    descriptionAr: "دفعةً واحدة، مع التعابير النمطيّة والكلمة الكاملة.",
    category: "docs", icon: "swap", version: "1.0.0",
    load: () => import("@/tools/find-replace/tool"),
  },
  {
    slug: "sort-lines",
    nameAr: "ترتيب الأسطر",
    descriptionAr: "فرزٌ عربيٌّ صحيحٌ وعكسٌ وإزالةُ المكرّر.",
    category: "docs", icon: "sort", version: "1.0.0",
    load: () => import("@/tools/sort-lines/tool"),
  },
  {
    slug: "word-frequency",
    nameAr: "تكرار الكلمات",
    descriptionAr: "أكثرُ الكلمات ورودًا في نصّ، بجدولٍ قابلٍ للنسخ.",
    category: "docs", icon: "chart", version: "1.0.0",
    load: () => import("@/tools/word-frequency/tool"),
  },
  {
    slug: "extract-text",
    nameAr: "استخراج من نصّ",
    descriptionAr: "بريدٌ وروابطُ وأرقامُ هواتفَ وأرقام، سطراً لكلّ نتيجة.",
    category: "docs", icon: "filter", version: "1.0.0",
    load: () => import("@/tools/extract-text/tool"),
  },
  {
    slug: "slugify",
    nameAr: "رابط لطيف",
    descriptionAr: "عنوانٌ عربيٌّ يصير رابطاً نظيفاً — عربيّاً أو منقولاً صوتيّاً.",
    category: "docs", icon: "link", version: "1.0.0",
    load: () => import("@/tools/slugify/tool"),
  },
  {
    slug: "platform-limits",
    nameAr: "عدّاد حروف المنصّات",
    descriptionAr: "كم بقي لك في إكس ولينكدإن وواتساب والرسائل النصّيّة.",
    category: "docs", icon: "gauge", version: "1.0.0",
    load: () => import("@/tools/platform-limits/tool"),
  },
  {
    slug: "text-diff",
    nameAr: "مقارنة نصّين",
    descriptionAr: "الفروقُ سطراً سطراً، بإضافةٍ وحذفٍ ملوَّنَين.",
    category: "docs", icon: "diff", version: "1.0.0",
    load: () => import("@/tools/text-diff/tool"),
  },
  {
    slug: "markdown",
    nameAr: "Markdown إلى HTML",
    descriptionAr: "معاينةٌ حيّةٌ ونسخُ الشيفرة — والنصُّ يُهرَّب فلا يمرّ وسم.",
    category: "docs", icon: "markdown", version: "1.0.0",
    load: () => import("@/tools/markdown/tool"),
  },
];
