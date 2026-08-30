import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TOOLS, categoryById, publishedTools, toListings } from "@/tools";
import { categoryNames } from "@/lib/db";
import { NamedIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const def = categoryById(id);
  if (!def) return { title: "تصنيف غير موجود" };
  const n = toListings(publishedTools(TOOLS)).filter((t) => t.categoryId === id).length;
  const title = `أدوات ${def.name}`;
  const description = `${n} أداةً عربيّةً في ${def.name} — ${def.blurb} تعمل في متصفّحك بلا تثبيت.`;
  return {
    title, description,
    alternates: { canonical: `/category/${id}` },
    openGraph: { title: `${title} · Do Kits`, description, type: "website", locale: "ar" },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const def = categoryById(id);
  if (!def) notFound();

  const names = categoryNames();
  const catName = names[id] ?? def.name;
  const live = toListings(publishedTools(TOOLS)).filter((t) => t.categoryId === id);
  const subs = def.subcategories
    .map((s) => ({ ...s, tools: live.filter((t) => t.subcategoryId === s.id) }))
    .filter((s) => s.tools.length > 0);
  const loose = live.filter((t) => !t.subcategoryId);

  return (
    <div className="flex flex-col gap-8 pt-10">
      <nav className="flex items-center gap-2 text-[0.88rem] text-muted" aria-label="مسار">
        <Link href="/" className="hover:text-primary">الأدوات</Link>
        <span aria-hidden="true">‹</span>
        <span>{catName}</span>
      </nav>

      <header>
        <h1 className="text-3xl font-bold">أدوات {catName}</h1>
        <p className="mt-1.5 max-w-[56ch] text-muted">
          {def.blurb} <span className="font-medium text-ink">{live.length} أداة</span>، كلُّها تعمل في متصفّحك.
        </p>
      </header>

      {subs.map((s) => (
        <section key={s.id}>
          <h2 className="mb-3 flex items-baseline gap-2 text-lg font-bold">
            {s.name}
            <Link href={`/category/${id}/${s.id}`} className="text-[0.8rem] font-normal text-primary hover:underline">
              صفحةٌ مستقلّة ({s.tools.length})
            </Link>
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {s.tools.map((t) => (
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
        </section>
      ))}

      {loose.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">أخرى</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {loose.map((t) => (
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
        </section>
      )}
    </div>
  );
}
