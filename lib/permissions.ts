import type { SessionUser } from "@/lib/auth";

/**
 * طبقةُ صلاحيّاتٍ صغيرةٌ تكفي اليوم وتتّسع غداً — بلا لوحةِ إدارةٍ كاملة.
 * ثلاثةُ أدوار: زائرٌ (بلا جلسة)، ومستخدم، ومدير.
 */

export type Role = "guest" | "user" | "admin";

export const roleOf = (u: SessionUser | null): Role =>
  !u ? "guest" : u.role === "admin" ? "admin" : "user";

export type Capability =
  | "tools.use"          // استعمالُ الأدوات العامّة
  | "favorites.sync"     // مفضّلةٌ محفوظةٌ بين الأجهزة
  | "history.sync"       // سجلُّ الاستخدام
  | "drafts.save"        // حفظُ مسودّات
  | "categories.manage"  // تسميةُ التصنيفات وترتيبُها
  | "tools.manage";      // إيقافُ أداةٍ أو إظهارُها

const MATRIX: Record<Role, Capability[]> = {
  guest: ["tools.use"],
  user: ["tools.use", "favorites.sync", "history.sync", "drafts.save"],
  admin: ["tools.use", "favorites.sync", "history.sync", "drafts.save", "categories.manage", "tools.manage"],
};

export function can(user: SessionUser | null, cap: Capability): boolean {
  return MATRIX[roleOf(user)].includes(cap);
}

export const ROLE_LABEL: Record<Role, string> = {
  guest: "زائر",
  user: "مستخدم",
  admin: "مدير",
};
