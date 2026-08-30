import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { listCategories } from "@/lib/db";
import { can } from "@/lib/permissions";
import { CATEGORIES, subcategoryName } from "@/tools/categories";
import { TOOLS, publishedTools } from "@/tools";
import { deleteCategoryAction, moveCategoryAction, renameCategoryAction, resetCategoryNameAction } from "@/lib/actions";
import { AddCategoryForm } from "@/components/admin-category-form";

export const metadata: Metadata = { title: "إدارة التصنيفات", robots: { index: false } };

export default async function CategoriesAdminPage({
  searchParams,
}: { searchParams: Promise<{ err?: string }> }) {
  const user = await getUser();
  if (!can(user, "categories.manage")) redirect("/");
  const { err } = await searchParams;
  const rows = listCategories();
  const live = publishedTools(TOOLS);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pt-12">
      <div>
        <h1 className="text-2xl font-bold">التصنيفات</h1>
        <p className="text-muted">
          مصدرُها سجلُّ الأدوات في الشيفرة — وهنا تسمّيها وترتّبها كما تشاء.
        </p>
      </div>

      {err === "used" && <p role="alert" className="form-error">لا يُحذف تصنيفٌ فيه أدوات.</p>}
      {err === "registry" && (
        <p role="alert" className="form-error">
          هذا التصنيفُ مُعرَّفٌ في السجلّ فلا يُحذف من هنا — احذفه من <span className="font-mono" dir="ltr">tools/categories.ts</span>.
        </p>
      )}

      <div className="card divide-y divide-line">
        {rows.map((c, i) => {
          const def = CATEGORIES.find((d) => d.id === c.slug);
          const subs = def?.subcategories
            .map((s) => ({ ...s, n: live.filter((t) => t.categoryId === c.slug && t.subcategoryId === s.id).length }))
            .filter((s) => s.n > 0) ?? [];
          return (
            <div key={c.id} className="flex flex-col gap-2 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <form action={renameCategoryAction.bind(null, c.id)} className="flex min-w-0 flex-1 items-center gap-2">
                  <input name="name" defaultValue={c.name_ar} className="field !w-auto min-w-0 flex-1" aria-label={`اسم ${c.name_ar}`} />
                  <button className="btn btn-ghost !px-3 !py-1.5">حفظ</button>
                </form>
                <span className="font-mono text-[0.78rem] text-muted" dir="ltr">{c.slug}</span>
                <span className="rounded-full bg-surface2 px-2.5 py-0.5 text-[0.8rem] text-muted">
                  {c.tools_count} {c.tools_count === 1 ? "أداة" : "أدوات"}
                </span>
                <div className="flex items-center gap-1">
                  <form action={moveCategoryAction.bind(null, c.id, -1)}>
                    <button className="btn btn-ghost !px-2.5 !py-1" disabled={i === 0} aria-label="فوق">↑</button>
                  </form>
                  <form action={moveCategoryAction.bind(null, c.id, 1)}>
                    <button className="btn btn-ghost !px-2.5 !py-1" disabled={i === rows.length - 1} aria-label="تحت">↓</button>
                  </form>
                  {def ? (
                    <form action={resetCategoryNameAction.bind(null, c.id)}>
                      <button className="btn btn-ghost !px-2.5 !py-1 text-muted" title={`الاسم في السجلّ: ${def.name}`}>
                        استعادة
                      </button>
                    </form>
                  ) : (
                    <form action={deleteCategoryAction.bind(null, c.id)}>
                      <button className="btn btn-ghost !px-2.5 !py-1 text-danger" disabled={c.tools_count > 0}>حذف</button>
                    </form>
                  )}
                </div>
              </div>
              {subs.length > 0 && (
                <div className="flex flex-wrap gap-1.5 ps-1">
                  {subs.map((s) => (
                    <span key={s.id} className="rounded-full border border-line px-2.5 py-0.5 text-[0.76rem] text-muted">
                      {subcategoryName(c.slug, s.id)} <span className="font-mono">{s.n}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AddCategoryForm />
      <p className="text-[0.84rem] leading-relaxed text-muted">
        التصنيفاتُ الفرعيّةُ تُشتقّ من بيانات الأدوات ولا تُدار هنا — تُضاف في
        <span className="mx-1 font-mono" dir="ltr">tools/categories.ts</span>
        ويعلنها بيانُ الأداة، فيُحدَّث العدُّ وحدَه.
      </p>
    </div>
  );
}
