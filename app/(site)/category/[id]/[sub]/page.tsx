import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TOOLS, categoryById, publishedTools, subcategoryName, toListings } from "@/tools";
import { categoryNames } from "@/lib/db";
import { NamedIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: { params: Promise<{ id: string; sub: string }> }): Promise<Metadata> {
  const { id, sub } = await params;
  const def = categoryById(id);
  const subName = subcategoryName(id, sub);
  if (!def || !subName) return { title: "تصنيف غير موجود" };
  const n = toListings(publishedTools(TOOLS)).filter((t) => t.categoryId === id && t.subcategoryId === sub).length;
  const title = `أدوات ${subName}`;
  const description = `${n} أداةً عربيّةً في ${subName} ضمن ${def.name} — تعمل في متصفّحك بلا تثبيت.`;
  return {
    title, description,
    alternates: { canonical: `/category/${id}/${sub}` },
    openGraph: { title: `${title} · Do Kits`, description, type: "website", locale: "ar" },
  };
}

export default async function SubcategoryPage({
  params,
}: { params: Promise<{ id: string; sub: string }> }) {
  const { id, sub } = await params;
  const def = categoryById(id);
  const subName = subcategoryName(id, sub);
  if (!def || !subName) notFound();

  const names = categoryNames();
  const catName = names[id] ?? def.name;
  const tools = toListings(publishedTools(TOOLS)).filter((t) => t.categoryId === id && t.subcategoryId === sub);

  return (
    <div className="flex flex-col gap-7 pt-10">
      <nav className="flex flex-wrap items-center gap-2 text-[0.88rem] text-muted" aria-label="مسار">
        <Link href="/" className="hover:text-primary">الأدوات</Link>
        <span aria-hidden="true">‹</span>
        <Link href={`/category/${id}`} className="hover:text-primary">{catName}</Link>
        <span aria-hidden="true">‹</span>
        <span>{subName}</span>
      </nav>

      <header>
        <h1 className="text-3xl font-bold">أدوات {subName}</h1>
        <p className="mt-1.5 text-muted">
          <span className="font-medium text-ink">{tools.length} أداة</span> ضمن {catName}.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tools.map((t) => (
          <Link key={t.slug} href={t.route} className="card flex items-start gap-3 p-3.5 hover:border-primary">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
              <NamedIcon name={t.icon} size={18} />
            </span>
            <span className="min-w-0">
              <span className="block font-bold text-ink">{t.title.ar}</span>
              <span className="block text-[0.84rem] leading-snug text-muted">{t.description.ar}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
