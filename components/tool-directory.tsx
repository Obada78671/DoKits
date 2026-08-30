"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, categoryById, subcategoryName, type ToolSummary } from "@/tools";
import { searchTools } from "@/lib/search";
import { getLocalFavorites, toggleLocalFavorite } from "@/lib/storage";
import { NamedIcon, SearchIcon, StarIcon } from "@/components/icons";
import { toggleFavoriteAction } from "@/lib/actions";

type SortKey = "popular" | "new" | "alpha" | "fav";
type View = "grid" | "list";

const COMPLEXITY: Record<string, string> = { basic: "بسيطة", medium: "متوسّطة", advanced: "متقدّمة" };

const CAP_FILTERS = [
  { id: "print", label: "طباعة" },
  { id: "exportCsv", label: "تصدير CSV" },
  { id: "saveDraft", label: "حفظ مسودّة" },
  { id: "offline", label: "بلا إنترنت" },
] as const;

export function ToolDirectory({
  tools, categoryNames, serverFavorites, popularity, loggedIn,
}: {
  tools: ToolSummary[];
  categoryNames: Record<string, string>;
  serverFavorites: string[];
  popularity: Record<string, number>;
  loggedIn: boolean;
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [sub, setSub] = useState<string | null>(null);
  const [complexity, setComplexity] = useState<string | null>(null);
  const [caps, setCaps] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortKey>("popular");
  const [view, setView] = useState<View>("grid");
  const [localFavs, setLocalFavs] = useState<string[]>([]);

  useEffect(() => { if (!loggedIn) void getLocalFavorites().then(setLocalFavs); }, [loggedIn]);
  const favs = useMemo(() => new Set(loggedIn ? serverFavorites : localFavs), [loggedIn, serverFavorites, localFavs]);

  const toggleCap = (id: string) =>
    setCaps((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const results = useMemo(() => {
    let base = q.trim() ? searchTools(tools, q, { popularity, favorites: favs }).map((h) => h.tool) : [...tools];
    base = base.filter((t) =>
      (!cat || t.categoryId === cat) &&
      (!sub || t.subcategoryId === sub) &&
      (!complexity || t.complexity === complexity) &&
      [...caps].every((c) => t.capabilities[c as keyof typeof t.capabilities]),
    );
    if (!q.trim()) {
      const cmp = new Intl.Collator("ar");
      if (sort === "alpha") base.sort((a, b) => cmp.compare(a.title.ar, b.title.ar));
      else if (sort === "new") base.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
      else if (sort === "fav") base.sort((a, b) => Number(favs.has(b.slug)) - Number(favs.has(a.slug)));
      else base.sort((a, b) => (popularity[b.slug] ?? 0) - (popularity[a.slug] ?? 0));
    }
    return base;
  }, [tools, q, cat, sub, complexity, caps, sort, favs, popularity]);

  const activeSubs = cat ? (categoryById(cat)?.subcategories ?? []).filter((s) => tools.some((t) => t.subcategoryId === s.id)) : [];

  const onFav = (slug: string) => {
    if (loggedIn) void toggleFavoriteAction(slug);
    else void toggleLocalFavorite(slug).then(setLocalFavs);
  };

  return (
    <div className="flex flex-col gap-5">
      <label className="field flex items-center gap-2.5 !py-2.5">
        <SearchIcon size={18} className="shrink-0 text-muted" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)}
               placeholder="ابحث في الدليل…" aria-label="بحث"
               className="w-full bg-transparent outline-none placeholder:text-muted" />
        <span className="shrink-0 text-[0.78rem] text-muted">{results.length}</span>
      </label>

      <div className="flex flex-wrap gap-2">
        <button className={`chip ${!cat ? "chip-active" : ""}`} onClick={() => { setCat(null); setSub(null); }}>كلُّ التصنيفات</button>
        {CATEGORIES.filter((c) => tools.some((t) => t.categoryId === c.id)).map((c) => (
          <button key={c.id} className={`chip ${cat === c.id ? "chip-active" : ""}`}
                  onClick={() => { setCat(cat === c.id ? null : c.id); setSub(null); }}>
            {categoryNames[c.id] ?? c.name}
          </button>
        ))}
      </div>

      {activeSubs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeSubs.map((s) => (
            <button key={s.id} className={`chip !py-0.5 !text-[0.8rem] ${sub === s.id ? "chip-active" : ""}`}
                    onClick={() => setSub(sub === s.id ? null : s.id)}>{s.name}</button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[0.8rem] text-muted">التعقيد</span>
        {Object.entries(COMPLEXITY).map(([id, label]) => (
          <button key={id} className={`chip !py-0.5 !text-[0.8rem] ${complexity === id ? "chip-active" : ""}`}
                  onClick={() => setComplexity(complexity === id ? null : id)}>{label}</button>
        ))}
        <span className="ms-3 text-[0.8rem] text-muted">المزايا</span>
        {CAP_FILTERS.map((c) => (
          <button key={c.id} className={`chip !py-0.5 !text-[0.8rem] ${caps.has(c.id) ? "chip-active" : ""}`}
                  aria-pressed={caps.has(c.id)} onClick={() => toggleCap(c.id)}>{c.label}</button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-y border-line py-2.5">
        <label className="flex items-center gap-2 text-[0.85rem]">
          <span className="text-muted">ترتيب</span>
          <select className="field !w-auto !py-1" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="popular">الأكثر استخداماً</option>
            <option value="new">الأحدث</option>
            <option value="alpha">أبجديّاً</option>
            <option value="fav">المفضّلة أوّلاً</option>
          </select>
        </label>
        <div className="ms-auto flex gap-1" role="group" aria-label="طريقة العرض">
          <button className={`chip !py-1 ${view === "grid" ? "chip-active" : ""}`} onClick={() => setView("grid")}>شبكة</button>
          <button className={`chip !py-1 ${view === "list" ? "chip-active" : ""}`} onClick={() => setView("list")}>قائمة</button>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="rounded-l border-[1.5px] border-dashed border-line px-6 py-10 text-center text-muted">
          <p className="font-bold text-ink">لا نتائج</p>
          <p>أزل بعضَ المرشّحات، أو <Link href="/" className="font-medium text-primary">ابدأ من الرئيسة</Link>.</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((t) => (
            <div key={t.slug} className="card flex items-start gap-3.5 p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                <NamedIcon name={t.icon} size={22} />
              </span>
              <div className="min-w-0">
                <div className="text-[0.72rem] font-bold text-primary">
                  {categoryNames[t.categoryId] ?? categoryById(t.categoryId)?.name}
                  {subcategoryName(t.categoryId, t.subcategoryId) ? ` · ${subcategoryName(t.categoryId, t.subcategoryId)}` : ""}
                </div>
                <Link href={t.route} className="font-bold text-ink hover:text-primary">{t.title.ar}</Link>
                <p className="text-[0.86rem] leading-relaxed text-muted">{t.description.ar}</p>
              </div>
              <button className={`ms-auto shrink-0 ${favs.has(t.slug) ? "text-accent" : "text-muted hover:text-accent"}`}
                      aria-label="مفضّلة" aria-pressed={favs.has(t.slug)} onClick={() => onFav(t.slug)}>
                <StarIcon size={19} filled={favs.has(t.slug)} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <ul className="card divide-y divide-line">
          {results.map((t) => (
            <li key={t.slug} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
              <NamedIcon name={t.icon} size={18} className="shrink-0 text-primary" />
              <Link href={t.route} className="font-medium text-ink hover:text-primary">{t.title.ar}</Link>
              <span className="text-[0.8rem] text-muted">{categoryNames[t.categoryId] ?? categoryById(t.categoryId)?.name}</span>
              <span className="rounded-full border border-line px-2 py-0.5 text-[0.72rem] text-muted">{COMPLEXITY[t.complexity]}</span>
              <button className={`ms-auto shrink-0 ${favs.has(t.slug) ? "text-accent" : "text-muted hover:text-accent"}`}
                      aria-label="مفضّلة" aria-pressed={favs.has(t.slug)} onClick={() => onFav(t.slug)}>
                <StarIcon size={17} filled={favs.has(t.slug)} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
