"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { rankBrowse, searchTools } from "@/lib/search";
import { CATEGORIES, categoryById, subcategoryName, type ToolSummary } from "@/tools";
import { getLocalFavorites, toggleLocalFavorite } from "@/lib/storage";
import { SearchIcon, StarIcon } from "@/components/icons";
import { ToolCard, type CardTool } from "@/components/tool-card";

/**
 * متصفّحُ الأدوات: بحثٌ فوريٌّ وتصنيفاتٌ وتصنيفاتٌ فرعيّةٌ ومفضّلة.
 * يعمل على السجلّ مباشرةً — إضافةُ أداةٍ تظهر هنا بلا تعديل.
 */
export function ToolBrowser({
  tools, categoryNames, serverFavorites, popularity, loggedIn, initialCategory,
}: {
  tools: ToolSummary[];
  categoryNames: Record<string, string>;
  serverFavorites: string[];
  popularity: Record<string, number>;
  loggedIn: boolean;
  initialCategory?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(initialCategory ?? null);
  const [sub, setSub] = useState<string | null>(null);
  const [favOnly, setFavOnly] = useState(false);
  const [localFavs, setLocalFavs] = useState<string[]>([]);

  useEffect(() => { if (!loggedIn) void getLocalFavorites().then(setLocalFavs); }, [loggedIn]);

  const favs = useMemo(
    () => new Set(loggedIn ? serverFavorites : localFavs),
    [loggedIn, serverFavorites, localFavs],
  );

  const onLocalFav = (slug: string) => { void toggleLocalFavorite(slug).then(setLocalFavs); };

  const results = useMemo(() => {
    const base = q.trim()
      ? searchTools(tools, q, { popularity, favorites: favs }).map((h) => h.tool)
      : rankBrowse(tools, { popularity, favorites: favs });
    return base.filter((t) =>
      (!cat || t.category === cat) &&
      (!sub || t.subcategory === sub) &&
      (!favOnly || favs.has(t.slug)),
    );
  }, [tools, q, cat, sub, favOnly, favs, popularity]);

  const counts = useMemo(() => {
    const live = tools;
    return CATEGORIES.map((c) => ({
      id: c.id,
      name: categoryNames[c.id] ?? c.name,
      count: live.filter((t) => t.category === c.id).length,
      subs: c.subcategories
        .map((s) => ({ ...s, count: live.filter((t) => t.category === c.id && t.subcategory === s.id).length }))
        .filter((s) => s.count > 0),
    })).filter((c) => c.count > 0);
  }, [tools, categoryNames]);

  const activeSubs = cat ? counts.find((c) => c.id === cat)?.subs ?? [] : [];

  const cards: CardTool[] = results.map((t) => ({
    slug: t.slug, title: t.title, description: t.description, icon: t.icon,
    categoryName: categoryNames[t.category] ?? categoryById(t.category)?.name ?? t.category,
    subName: subcategoryName(t.category, t.subcategory),
    fav: favs.has(t.slug),
  }));

  return (
    <div className="flex flex-col gap-5">
      <label className="field flex items-center gap-2.5 !py-2.5">
        <SearchIcon size={18} className="shrink-0 text-muted" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`); }}
          placeholder="ابحث بالاسم أو الوصف أو الكلمة المفتاحيّة…"
          className="w-full bg-transparent outline-none placeholder:text-muted"
          aria-label="بحث في الأدوات"
        />
        {q && <span className="shrink-0 text-[0.78rem] text-muted">{results.length}</span>}
      </label>

      <div className="flex flex-wrap gap-2" role="group" aria-label="التصنيفات">
        <button
          className={`chip ${cat === null && !favOnly ? "chip-active" : ""}`}
          onClick={() => { setCat(null); setSub(null); setFavOnly(false); }}
        >
          الكلّ <span className="ms-1.5 text-muted">{tools.length}</span>
        </button>
        {counts.map((c) => (
          <button
            key={c.id}
            className={`chip ${cat === c.id ? "chip-active" : ""}`}
            onClick={() => { setCat(cat === c.id ? null : c.id); setSub(null); setFavOnly(false); }}
          >
            {c.name} <span className="ms-1.5 text-muted">{c.count}</span>
          </button>
        ))}
        <button className={`chip ${favOnly ? "chip-active" : ""}`}
                onClick={() => { setFavOnly(!favOnly); setCat(null); setSub(null); }}>
          <StarIcon size={14} filled={favOnly} className="me-1 text-accent" /> مفضّلتي
          {favs.size > 0 && <span className="ms-1.5 text-muted">{favs.size}</span>}
        </button>
      </div>

      {activeSubs.length > 0 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="التصنيفات الفرعيّة">
          {activeSubs.map((s) => (
            <button
              key={s.id}
              className={`chip !py-0.5 !text-[0.8rem] ${sub === s.id ? "chip-active" : ""}`}
              onClick={() => setSub(sub === s.id ? null : s.id)}
            >
              {s.name} <span className="ms-1.5 text-muted">{s.count}</span>
            </button>
          ))}
        </div>
      )}

      {cards.length === 0 ? (
        <div className="rounded-l border-[1.5px] border-dashed border-line px-6 py-10 text-center text-muted">
          <p className="font-bold text-ink">{favOnly ? "لا مفضّلةَ بعد" : "لا نتائج"}</p>
          <p>{favOnly ? "اضغط النجمةَ على أيّ أداةٍ لتظهر هنا." : "جرّب كلمةً أقصر، أو أزل التصفية."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((t) => (
            <ToolCard key={t.slug} tool={t} loggedIn={loggedIn} onLocalFav={onLocalFav} />
          ))}
        </div>
      )}

      {!loggedIn && favs.size > 0 && (
        <p className="text-[0.84rem] text-muted">
          مفضّلتُك محفوظةٌ في هذا المتصفّح. <a href="/register" className="font-medium text-primary">أنشئ حساباً</a> لتتبعك بين أجهزتك.
        </p>
      )}
    </div>
  );
}
