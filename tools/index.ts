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
  // تُضاف الأدوات تباعاً — أوّلها الأداة النموذجيّة القادمة مع عقد التطبيع
];
