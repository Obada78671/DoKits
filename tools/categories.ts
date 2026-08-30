/**
 * التصنيفاتُ والتصنيفاتُ الفرعيّة — مصدرُها الشيفرة.
 *
 * لماذا هنا لا في القاعدة: الأداةُ تعلن تصنيفَها في بيانها، والعددُ يُشتقّ من
 * السجلّ تلقائيّاً. لو كان المصدرُ القاعدةَ لاحتاج كلُّ تصنيفٍ فرعيٍّ هجرةً.
 * وتبقى **التسميةُ والترتيب** قابلَين للتجاوز من صفحة المدير (جدول categories).
 */

export type SubcategoryDef = { id: string; name: string };

export type CategoryDef = {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  /** وصفٌ سطريٌّ يظهر في رأس التصنيف */
  blurb: string;
  subcategories: SubcategoryDef[];
};

export const CATEGORIES: CategoryDef[] = [
  {
    id: "docs",
    name: "نصوص ومستندات",
    nameEn: "Text & Documents",
    icon: "docs",
    blurb: "تنظيفُ النصوص وتحليلُها وتحويلُ صيغها.",
    subcategories: [
      { id: "cleanup", name: "تنظيف وتحرير" },
      { id: "analysis", name: "تحليل وقياس" },
      { id: "format", name: "تحويل صيغ" },
    ],
  },
  {
    id: "business",
    name: "حسابات وأعمال",
    nameEn: "Business & Accounting",
    icon: "business",
    blurb: "ما تحتاجه الفاتورةُ والتسعيرُ والأجور.",
    subcategories: [
      { id: "invoicing", name: "فواتير" },
      { id: "pricing", name: "تسعير" },
      { id: "tax", name: "ضرائب" },
      { id: "finance", name: "تمويل" },
      { id: "payroll", name: "أجور" },
      { id: "banking", name: "مصارف" },
    ],
  },
  {
    id: "convert",
    name: "تحويلات وقياسات",
    nameEn: "Conversions & Units",
    icon: "convert",
    blurb: "تواريخُ ووحداتٌ وأنظمةُ عدّ.",
    subcategories: [
      { id: "datetime", name: "تواريخ وأوقات" },
      { id: "units", name: "وحدات" },
      { id: "numbers", name: "أنظمة عدّ" },
    ],
  },
  {
    id: "dev",
    name: "مطوّرون",
    nameEn: "Developers",
    icon: "dev",
    blurb: "ترميزٌ وبياناتٌ وأدواتُ أمان.",
    subcategories: [
      { id: "encoding", name: "ترميز" },
      { id: "data", name: "بيانات" },
      { id: "security", name: "أمان" },
    ],
  },
  {
    id: "design",
    name: "تصميم",
    nameEn: "Design",
    icon: "design",
    blurb: "ألوانٌ وصورٌ ومعايير إتاحة.",
    subcategories: [
      { id: "color", name: "ألوان" },
      { id: "images", name: "صور" },
    ],
  },
];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);
export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const categoryById = (id: string) => CATEGORIES.find((c) => c.id === id);

export function subcategoryName(categoryId: string, subId?: string): string | undefined {
  if (!subId) return undefined;
  return categoryById(categoryId)?.subcategories.find((s) => s.id === subId)?.name;
}
