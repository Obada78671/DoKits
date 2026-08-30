import type { Metadata } from "next";
import Link from "next/link";
import { TOOLS, categoryById, publishedTools, subcategoryName } from "@/tools";
import { categoryNames, favoriteSlugs, popularity } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { searchTools } from "@/lib/search";
import { NamedIcon, SearchIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `بحث: ${q}` : "بحث",
    description: q ? `نتائجُ البحث عن «${q}» في أدوات Do Kits.` : "ابحث في أدوات Do Kits.",
    robots: { index: false },
  };
}

export default async function SearchPage({
  searchParams,
}: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const user = await getUser();
  const names = categoryNames();
  const favs = new Set(user ? favoriteSlugs(user.id) : []);
  const hits = q.trim()
    ? searchTools(TOOLS, q, { popularity: popularity(), favorites: favs })
    : [];

  return (
    <div className="flex flex-col gap-6 pt-10">
      <header>
        <h1 className="text-2xl font-bold">البحث في الأدوات</h1>
        {q.trim() && (
          <p className="mt-1 text-muted">
            {hits.length} نتيجةً لـ<span className="font-medium text-ink"> «{q}»</span>
          </p>
        )}
      </header>

      {/* نموذجٌ خادميّ: الرابطُ قابلٌ للمشاركة ويعمل بلا جافاسكربت */}
      <form action="/search" className="field flex items-center gap-2.5 !py-2.5">
        <SearchIcon size={18} className="shrink-0 text-muted" />
        <input
          name="q"
          type="search"
          defaultValue={q}
          autoFocus
          placeholder="ابحث بالاسم أو الكلمة المفتاحيّة…"
          className="w-full bg-transparent outline-none placeholder:text-muted"
          aria-label="نصّ البحث"
        />
        <button className="btn btn-primary !py-1.5">بحث</button>
      </form>

      {!q.trim() ? (
        <p className="text-muted">اكتب كلمةً للبحث — أو تصفّح <Link href="/" className="font-medium text-primary">كلَّ الأدوات</Link>.</p>
      ) : hits.length === 0 ? (
        <div className="rounded-l border-[1.5px] border-dashed border-line px-6 py-10 text-center text-muted">
          <p className="font-bold text-ink">لا نتائج</p>
          <p>جرّب كلمةً أقصر أو مرادفاً — البحثُ يفهم التشكيلَ وصيغَ الألف.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {hits.map(({ tool, reason }) => (
            <li key={tool.slug}>
              <Link href={`/tools/${tool.slug}`} className="card flex items-start gap-3.5 p-4 hover:border-primary">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                  <NamedIcon name={tool.icon} size={22} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.72rem] font-bold text-primary">
                    {names[tool.categoryId] ?? categoryById(tool.categoryId)?.name}
                    {subcategoryName(tool.categoryId, tool.subcategoryId) ? ` · ${subcategoryName(tool.categoryId, tool.subcategoryId)}` : ""}
                  </span>
                  <span className="block font-bold text-ink">{tool.title.ar}</span>
                  <span className="block text-[0.86rem] leading-relaxed text-muted">{tool.description.ar}</span>
                </span>
                <span className="hidden shrink-0 rounded-full bg-surface2 px-2.5 py-0.5 text-[0.72rem] text-muted sm:block">
                  {reason}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
