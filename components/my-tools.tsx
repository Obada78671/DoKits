"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  allTemplates, getLocalFavorites, getRecent, listDrafts, removeDraft, toggleLocalFavorite,
  type DraftEntry,
} from "@/lib/storage";
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
  const [drafts, setDrafts] = useState<DraftEntry[]>([]);

  const [tpls, setTpls] = useState<{ slug: string; count: number }[]>([]);

  useEffect(() => {
    void listDrafts().then(setDrafts);
    void allTemplates().then(setTpls);
  }, []);

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

      {tpls.length > 0 && (
        <section>
          <h2 className="mb-1 text-lg font-bold">قوالبي <span className="text-muted">{tpls.reduce((n, x) => n + x.count, 0)}</span></h2>
          <p className="mb-3 text-[0.9rem] text-muted">
            القالبُ حالةٌ مسمّاةٌ تُعيد استعمالَها — افتح الأداةَ واضغط اسمَ القالب.
          </p>
          <div className="flex flex-wrap gap-2">
            {tpls.map((x) => (
              <Link key={x.slug} href={`/tools/${x.slug}`}
                    className="rounded-full border border-line bg-surface px-3 py-1.5 text-[0.86rem] text-ink hover:border-primary hover:text-primary">
                {bySlug.get(x.slug)?.title.ar ?? x.slug}
                <span className="ms-1.5 text-[0.78rem] text-muted">{x.count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {drafts.length > 0 && (
        <section>
          <h2 className="mb-1 text-lg font-bold">مسودّاتُك <span className="text-muted">{drafts.length}</span></h2>
          <p className="mb-3 text-[0.9rem] text-muted">
            محفوظةٌ في هذا الجهاز وحدَه — افتح الأداةَ واضغط «استعِدها».
          </p>
          <ul className="divide-y divide-line rounded-m border border-line bg-surface">
            {drafts.map((d) => {
              const t = bySlug.get(d.slug);
              return (
                <li key={d.slug} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                  <Link href={`/tools/${d.slug}`} className="font-medium text-ink hover:text-primary">
                    {t?.title.ar ?? d.slug}
                  </Link>
                  <span className="text-[0.82rem] text-muted">{when(d.at)}</span>
                  <button
                    className="btn btn-ghost !px-3 !py-1 !text-[0.8rem] ms-auto"
                    onClick={() => void removeDraft(d.slug).then(() => setDrafts((p) => p.filter((x) => x.slug !== d.slug)))}
                  >
                    احذف
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
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
