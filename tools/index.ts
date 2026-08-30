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
];
