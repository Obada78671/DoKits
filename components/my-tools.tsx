"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLocalFavorites, getRecent, toggleLocalFavorite } from "@/lib/storage";
import { mergeLocalFavoritesAction } from "@/lib/actions";
import { ToolCard, type CardTool } from "@/components/tool-card";
import type { ToolListing } from "@/tools";
import { categoryById, subcategoryName } from "@/tools/categories";

type Props = {
  tools: ToolListing[];
  categoryNames: Record<string, string>;
  serverFavorites: string[];
  serverRecent: { slug: string; at: number }[];
  loggedIn: boolean;
};

const card = (t: ToolListing, names: Record<string, string>, fav: boolean): CardTool => ({
  slug: t.slug, title: t.title.ar, description: t.description.ar, icon: t.icon,
  categoryName: names[t.categoryId] ?? categoryById(t.categoryId)?.name ?? t.categoryId,
  subName: subcategoryName(t.categoryId, t.subcategoryId),
  fav,
});

const when = (ms: number) => {
  const mins = Math.round((Date.now() - ms) / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `قبل ${mins} دقيقة`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `قبل ${hours} ساعة`;
  return `قبل ${Math.round(hours / 24)} يوم`;
};

export function MyTools({ tools, categoryNames, serverFavorites, serverRecent, loggedIn }: Props) {
  const [localFavs, setLocalFavs] = useState<string[]>([]);
  const [recent, setRecent] = useState<{ slug: string; at: number }[]>(serverRecent);
  const [merged, setMerged] = useState<number | null>(null);

  useEffect(() => {
    void getLocalFavorites().then(setLocalFavs);
    // السجلُّ المحلّيُّ يكمّل الخادميّ ولا يحلّ محلّه
    void getRecent().then((local) => {
      setRecent((server) => {
        const map = new Map(server.map((r) => [r.slug, r]));
        for (const r of local) {
          const cur = map.get(r.slug);
          if (!cur || r.at > cur.at) map.set(r.slug, r);
        }
        return [...map.values()].sort((a, b) => b.at - a.at).slice(0, 12);
      });
    });
  }, []);

  /** عند الدخول: تُرفع مفضّلةُ الزائر إلى الحساب مرّةً ثمّ تُمسح محلّيّاً */
  useEffect(() => {
    if (!loggedIn || localFavs.length === 0) return;
    const missing = localFavs.filter((s) => !serverFavorites.includes(s));
    if (missing.length === 0) return;
    void mergeLocalFavoritesAction(missing).then((n) => {
      setMerged(n);
      void Promise.all(localFavs.map((s) => toggleLocalFavorite(s))).then(() => setLocalFavs([]));
    });
  }, [loggedIn, localFavs, serverFavorites]);

  const favSet = new Set(loggedIn ? serverFavorites : localFavs);
  const bySlug = new Map(tools.map((t) => [t.slug, t]));
  const favTools = [...favSet].map((s) => bySlug.get(s)).filter((t): t is ToolListing => !!t);
  const recentTools = recent.map((r) => ({ t: bySlug.get(r.slug), at: r.at })).filter((x) => x.t);

  return (
    <div className="flex flex-col gap-8">
      {merged !== null && merged > 0 && (
        <p role="status" className="form-ok">نُقلت {merged} أداةً من مفضّلة هذا المتصفّح إلى حسابك.</p>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold">المفضّلة <span className="text-muted">{favTools.length}</span></h2>
        {favTools.length === 0 ? (
          <div className="rounded-l border-[1.5px] border-dashed border-line px-6 py-8 text-center text-muted">
            <p className="font-bold text-ink">لا مفضّلةَ بعد</p>
            <p>اضغط النجمةَ على أيّ أداةٍ في <Link href="/" className="font-medium text-primary">الصفحة الرئيسة</Link>.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {favTools.map((t) => (
              <ToolCard key={t.slug} tool={card(t, categoryNames, true)} loggedIn={loggedIn}
                        onLocalFav={(s) => void toggleLocalFavorite(s).then(setLocalFavs)} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">آخرُ ما استعملت</h2>
        {recentTools.length === 0 ? (
          <p className="text-muted">لم تفتح أداةً بعد.</p>
        ) : (
          <ul className="card divide-y divide-line">
            {recentTools.map(({ t, at }) => (
              <li key={t!.slug} className="flex items-center gap-3 px-4 py-2.5">
                <Link href={`/tools/${t!.slug}`} className="font-medium text-ink hover:text-primary">{t!.title.ar}</Link>
                <span className="ms-auto text-[0.82rem] text-muted">{when(at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!loggedIn && (
        <p className="text-[0.86rem] text-muted">
          كلُّ ما في هذه الصفحة محفوظٌ في هذا المتصفّح وحده.
          <Link href="/register" className="mx-1 font-medium text-primary">أنشئ حساباً</Link>
          لتتبعك مفضّلتُك وسجلُّك بين أجهزتك — وسيُنقل ما هنا تلقائيّاً.
        </p>
      )}
    </div>
  );
}
