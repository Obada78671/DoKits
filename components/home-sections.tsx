"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRecent } from "@/lib/storage";
import type { ToolSummary } from "@/tools";
import { NamedIcon } from "@/components/icons";

/** «أكمل ما بدأت» — يظهر فقط لمن له سجلّ، فلا يواجه الزائرُ الجديدُ قسماً فارغاً */
export function ResumeSection({
  tools, serverRecent,
}: { tools: ToolSummary[]; serverRecent: { slug: string; at: number }[] }) {
  const [items, setItems] = useState<{ slug: string; at: number }[]>(serverRecent);

  useEffect(() => {
    void getRecent().then((local) => {
      setItems((server) => {
        const map = new Map(server.map((r) => [r.slug, r]));
        for (const r of local) {
          const cur = map.get(r.slug);
          if (!cur || r.at > cur.at) map.set(r.slug, r);
        }
        return [...map.values()].sort((a, b) => b.at - a.at).slice(0, 4);
      });
    });
  }, []);

  const bySlug = new Map(tools.map((t) => [t.slug, t]));
  const shown = items.map((r) => bySlug.get(r.slug)).filter((t): t is ToolSummary => !!t);
  if (shown.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-lg font-bold">أكمل ما بدأت</h2>
      <div className="flex flex-wrap gap-2.5">
        {shown.map((t) => (
          <Link key={t.slug} href={t.route}
                className="card flex items-center gap-2.5 px-3.5 py-2.5 hover:border-primary">
            <NamedIcon name={t.icon} size={18} className="shrink-0 text-primary" />
            <span className="font-medium text-ink">{t.title.ar}</span>
            <span className="text-[0.8rem] text-primary">متابعة ←</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** اقتراحاتٌ يظهر سببُها دائماً — لا صندوقَ أسودَ يقترح بلا تفسير */
export function SuggestionsSection({
  suggestions,
}: { suggestions: { tool: ToolSummary; reason: string }[] }) {
  if (suggestions.length === 0) return null;
  return (
    <section>
      <h2 className="mb-3 text-lg font-bold">الأكثرُ فائدةً الآن</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {suggestions.map(({ tool, reason }) => (
          <Link key={tool.slug} href={tool.route} className="card flex items-start gap-3 p-4 hover:border-primary">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
              <NamedIcon name={tool.icon} size={20} />
            </span>
            <span className="min-w-0">
              <span className="block font-bold text-ink">{tool.title.ar}</span>
              <span className="block text-[0.84rem] leading-snug text-muted">{tool.description.ar}</span>
              <span className="mt-1.5 block text-[0.75rem] text-muted">{reason}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
