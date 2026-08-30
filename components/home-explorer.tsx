"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type { CategoryRow, ToolRow } from "@/lib/db";
import { toggleFavoriteAction } from "@/lib/actions";
import { NamedIcon, SearchIcon, StarIcon } from "@/components/icons";

export function HomeExplorer({
  categories, tools, loggedIn,
}: { categories: CategoryRow[]; tools: ToolRow[]; loggedIn: boolean }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [favOnly, setFavOnly] = useState(false);
  const [, startTransition] = useTransition();

  const shown = useMemo(() => {
    const needle = q.trim();
    return tools.filter((t) =>
      (!cat || t.category_slug === cat) &&
      (!favOnly || t.fav === 1) &&
      (!needle || t.name_ar.includes(needle) || t.description_ar.includes(needle) || t.slug.includes(needle)),
    );
  }, [tools, q, cat, favOnly]);

  const catName = (slug: string) => categories.find((c) => c.slug === slug)?.name_ar ?? slug;

  return (
    <div className="flex flex-col gap-5">
      <label className="field flex items-center gap-2.5 !py-2.5">
        <SearchIcon size={18} className="shrink-0 text-muted" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث في الأدوات…"
          className="w-full bg-transparent outline-none placeholder:text-muted"
          aria-label="بحث في الأدوات"
        />
      </label>

      <div className="flex flex-wrap gap-2" role="group" aria-label="التصنيفات">
        <button className={`chip ${cat === null && !favOnly ? "chip-active" : ""}`}
                onClick={() => { setCat(null); setFavOnly(false); }}>
          الكلّ
        </button>
        {categories.map((c) => (
          <button key={c.slug}
                  className={`chip ${cat === c.slug ? "chip-active" : ""}`}
                  onClick={() => { setCat(cat === c.slug ? null : c.slug); setFavOnly(false); }}>
            {c.name_ar}
            {c.tools_count > 0 && <span className="ms-1.5 text-muted">{c.tools_count}</span>}
          </button>
        ))}
        {loggedIn && (
          <button className={`chip ${favOnly ? "chip-active" : ""}`}
                  onClick={() => { setFavOnly(!favOnly); setCat(null); }}>
            <StarIcon size={14} filled={favOnly} className="me-1 text-accent" /> مفضّلتي
          </button>
        )}
      </div>

      {tools.length === 0 ? (
        <div className="rounded-l border-[1.5px] border-dashed border-line px-6 py-12 text-center text-muted">
          <span className="mb-4 inline-grid grid-cols-2 gap-1.5" aria-hidden="true">
            <i className="block size-6 rounded-lg bg-surface2" />
            <i className="block size-6 rounded-lg bg-accent" />
            <i className="block size-6 rounded-lg bg-surface2" />
            <i className="block size-6 rounded-lg bg-surface2" />
          </span>
          <p className="text-lg font-bold text-ink">الحقيبةُ تتجهّز</p>
          <p>الأدواتُ تُضاف تباعاً — أوّلُها قريب.</p>
        </div>
      ) : shown.length === 0 ? (
        <div className="rounded-l border-[1.5px] border-dashed border-line px-6 py-10 text-center text-muted">
          <p className="font-bold text-ink">لا نتائج</p>
          <p>جرّب كلمةً أقصر، أو أزل التصفية.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((t) => (
            <div key={t.slug} className="card flex items-start gap-3.5 p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                <NamedIcon name={t.icon} size={22} />
              </span>
              <div className="min-w-0">
                <div className="text-[0.72rem] font-bold text-primary">{catName(t.category_slug)}</div>
                <Link href={`/tools/${t.slug}`} className="font-bold text-ink hover:text-primary">
                  {t.name_ar}
                </Link>
                <p className="text-[0.86rem] leading-relaxed text-muted">{t.description_ar}</p>
              </div>
              {loggedIn ? (
                <button
                  className={`ms-auto shrink-0 ${t.fav ? "text-accent" : "text-muted hover:text-accent"}`}
                  aria-label={t.fav ? "إزالة من المفضّلة" : "إضافة إلى المفضّلة"}
                  onClick={() => startTransition(() => toggleFavoriteAction(t.id))}
                >
                  <StarIcon size={19} filled={t.fav === 1} />
                </button>
              ) : (
                <Link href="/login" className="ms-auto shrink-0 text-muted hover:text-accent" aria-label="سجّل الدخول للمفضّلة">
                  <StarIcon size={19} />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
