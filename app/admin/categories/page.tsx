import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { listCategories } from "@/lib/db";
import { deleteCategoryAction, moveCategoryAction, renameCategoryAction } from "@/lib/actions";
import { AddCategoryForm } from "@/components/admin-category-form";

export const metadata: Metadata = { title: "إدارة التصنيفات" };

export default async function CategoriesAdminPage({
  searchParams,
}: { searchParams: Promise<{ err?: string }> }) {
  const user = await getUser();
  if (!user || user.role !== "admin") redirect("/");
  const { err } = await searchParams;
  const categories = listCategories();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pt-12">
      <div>
        <h1 className="text-2xl font-bold">التصنيفات</h1>
        <p className="text-muted">ترتيبُها هنا هو ترتيبُ ظهورها في الحقيبة.</p>
      </div>

      {err === "used" && (
        <p role="alert" className="form-error">لا يُحذف تصنيفٌ فيه أدوات — انقل أدواته أوّلاً.</p>
      )}

      <div className="card divide-y divide-line">
        {categories.map((c, i) => (
          <div key={c.id} className="flex flex-wrap items-center gap-3 p-4">
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
                <button className="btn btn-ghost !px-2.5 !py-1" disabled={i === categories.length - 1} aria-label="تحت">↓</button>
              </form>
              <form action={deleteCategoryAction.bind(null, c.id)}>
                <button className="btn btn-ghost !px-2.5 !py-1 text-danger" disabled={c.tools_count > 0} aria-label={`حذف ${c.name_ar}`}>حذف</button>
              </form>
            </div>
          </div>
        ))}
      </div>

      <AddCategoryForm />
    </div>
  );
}
