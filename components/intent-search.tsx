"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EXAMPLE_QUERIES, matchIntents } from "@/lib/intents";
import { searchTools } from "@/lib/search";
import type { ToolSummary } from "@/tools";
import { NamedIcon, SearchIcon } from "@/components/icons";

/**
 * حقلُ البداية: يفهم المقصدَ لا اسمَ الأداة.
 * «كم أربح من المنتج؟» تعطي حاسبةَ التسعير مع سببِ الاقتراح وزرِّ بدءٍ مباشر.
 */
export function IntentSearch({
  tools, popularity,
}: { tools: ToolSummary[]; popularity: Record<string, number> }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const bySlug = useMemo(() => new Map(tools.map((t) => [t.slug, t])), [tools]);

  const results = useMemo(() => {
    if (!q.trim()) return { intents: [], tools: [] as ToolSummary[] };
    const intents = matchIntents(q).filter((m) => bySlug.has(m.intent.toolSlug));
    const taken = new Set(intents.map((i) => i.intent.toolSlug));
    const rest = searchTools(tools, q, { popularity })
      .map((h) => h.tool)
      .filter((t) => !taken.has(t.slug))
      .slice(0, 4);
    return { intents, tools: rest };
  }, [q, tools, popularity, bySlug]);

  const flat = useMemo(
    () => [
      ...results.intents.map((m) => ({ slug: m.intent.toolSlug, reason: m.intent.reason, answer: m.intent.answer })),
      ...results.tools.map((t) => ({ slug: t.slug, reason: "", answer: t.description.ar })),
    ],
    [results],
  );

  useEffect(() => setActive(0), [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const go = (slug: string) => router.push(`/tools/${slug}`);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, flat.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (flat[active]) go(flat[active].slug);
      else if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    } else if (e.key === "Escape") setOpen(false);
  };

  return (
    <div ref={boxRef} className="relative">
      <label className="field flex items-center gap-3 !py-3.5 !text-lg shadow-card">
        <SearchIcon size={22} className="shrink-0 text-muted" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder="اكتب ما تريد إنجازه…"
          aria-label="ماذا تريد أن تنجز"
          aria-expanded={open && flat.length > 0}
          aria-controls="intent-results"
          className="w-full bg-transparent outline-none placeholder:text-muted"
        />
        {q && (
          <button className="btn btn-primary !py-1.5 shrink-0"
                  onClick={() => (flat[0] ? go(flat[0].slug) : router.push(`/search?q=${encodeURIComponent(q)}`))}>
            ابدأ
          </button>
        )}
      </label>

      {!q && (
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.map((ex) => (
            <button key={ex} className="chip !text-[0.84rem]" onClick={() => { setQ(ex); setOpen(true); }}>
              {ex}
            </button>
          ))}
        </div>
      )}

      {open && q.trim() && (
        <div id="intent-results" role="listbox"
             className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-m border border-line bg-surface shadow-card">
          {flat.length === 0 ? (
            <div className="px-4 py-5 text-center">
              <p className="font-bold text-ink">لم نجد أداةً مطابقة</p>
              <p className="mt-1 text-[0.9rem] text-muted">جرّب كلماتٍ أقلّ، أو تصفّح الدليل — قد تكون الأداةُ باسمٍ آخر.</p>
              <Link href="/tools" className="btn btn-ghost mt-3">افتح دليل الأدوات</Link>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {flat.map((item, i) => {
                const t = bySlug.get(item.slug)!;
                return (
                  <li key={item.slug}>
                    <button
                      role="option"
                      aria-selected={i === active}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(item.slug)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-start ${i === active ? "bg-surface2" : ""}`}
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                        <NamedIcon name={t.icon} size={20} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold text-ink">{t.title.ar}</span>
                        <span className="block text-[0.86rem] leading-snug text-muted">{item.answer}</span>
                        {item.reason && (
                          <span className="mt-1 inline-block rounded-full bg-accent-soft px-2 py-0.5 text-[0.72rem] text-ink">
                            {item.reason}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 self-center text-[0.82rem] font-medium text-primary">ابدأ ←</span>
                    </button>
                  </li>
                );
              })}
              <li>
                <Link href={`/search?q=${encodeURIComponent(q.trim())}`}
                      className="block px-4 py-2.5 text-center text-[0.86rem] text-muted hover:text-primary">
                  عرضُ كلّ النتائج
                </Link>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
