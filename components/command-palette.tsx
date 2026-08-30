"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { matchIntents } from "@/lib/intents";
import { searchTools } from "@/lib/search";
import type { ToolSummary } from "@/tools";
import { getRecent } from "@/lib/storage";
import { NamedIcon, SearchIcon } from "@/components/icons";

/** لوحةُ الأوامر: ⌘K أو Ctrl+K في أيّ صفحة، وزرٌّ ثابتٌ على الهاتف */
export function CommandPalette({ tools }: { tools: ToolSummary[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);

  const bySlug = useMemo(() => new Map(tools.map((t) => [t.slug, t])), [tools]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) void getRecent().then((r) => setRecent(r.map((x) => x.slug)));
    else { setQ(""); setActive(0); }
  }, [open]);

  const list = useMemo(() => {
    if (!q.trim()) {
      const rec = recent.map((s) => bySlug.get(s)).filter((t): t is ToolSummary => !!t).slice(0, 6);
      return rec.length > 0 ? rec : tools.slice(0, 6);
    }
    const intents = matchIntents(q, 2).map((m) => bySlug.get(m.intent.toolSlug)).filter((t): t is ToolSummary => !!t);
    const taken = new Set(intents.map((t) => t.slug));
    return [...intents, ...searchTools(tools, q).map((h) => h.tool).filter((t) => !taken.has(t.slug))].slice(0, 8);
  }, [q, tools, recent, bySlug]);

  useEffect(() => setActive(0), [q]);

  const go = (slug: string) => { setOpen(false); router.push(`/tools/${slug}`); };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="بحث سريع"
        className="fixed bottom-5 start-5 z-30 grid size-12 place-items-center rounded-full bg-primary text-primary-ink shadow-card sm:hidden print:hidden"
      >
        <SearchIcon size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 p-4 pt-[12vh] print:hidden"
             onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div role="dialog" aria-modal="true" aria-label="لوحة الأوامر"
               className="w-full max-w-lg overflow-hidden rounded-l border border-line bg-surface shadow-card">
            <label className="flex items-center gap-3 border-b border-line px-4 py-3">
              <SearchIcon size={20} className="shrink-0 text-muted" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, list.length - 1)); }
                  else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
                  else if (e.key === "Enter" && list[active]) { e.preventDefault(); go(list[active].slug); }
                }}
                placeholder="اكتب ما تريد إنجازه أو اسمَ أداة…"
                aria-label="بحث"
                className="w-full bg-transparent text-lg outline-none placeholder:text-muted"
              />
              <kbd className="hidden shrink-0 rounded border border-line px-1.5 py-0.5 font-mono text-[0.7rem] text-muted sm:block">Esc</kbd>
            </label>

            {list.length === 0 ? (
              <p className="px-4 py-6 text-center text-muted">لا نتائج — جرّب كلمةً أقصر.</p>
            ) : (
              <>
                {!q.trim() && (
                  <p className="px-4 pt-3 text-[0.75rem] font-bold tracking-wide text-muted">
                    {recent.length > 0 ? "آخرُ ما استعملت" : "ابدأ من هنا"}
                  </p>
                )}
                <ul className="max-h-80 overflow-y-auto p-2">
                  {list.map((t, i) => (
                    <li key={t.slug}>
                      <button
                        onMouseEnter={() => setActive(i)}
                        onClick={() => go(t.slug)}
                        className={`flex w-full items-center gap-3 rounded-s px-3 py-2.5 text-start ${i === active ? "bg-surface2" : ""}`}
                      >
                        <NamedIcon name={t.icon} size={18} className="shrink-0 text-primary" />
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium text-ink">{t.title.ar}</span>
                          <span className="block truncate text-[0.8rem] text-muted">{t.description.ar}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
