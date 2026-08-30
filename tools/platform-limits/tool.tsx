"use client";

import { useMemo, useState } from "react";
import { Field, Note, TextArea, ToolLayout } from "@/components/tool-kit";
import { PLATFORMS, countChars } from "@/tools/text-lib";

const fmt = new Intl.NumberFormat("en-US");

export default function PlatformLimits() {
  const [text, setText] = useState("");
  const n = useMemo(() => countChars(text), [text]);

  return (
    <ToolLayout>
      <Field label="المنشور" htmlFor="pl-in">
        <TextArea id="pl-in" value={text} onChange={setText} rows={6} placeholder="اكتب منشورك…" />
      </Field>

      <div className="rounded-m border border-line bg-surface">
        <div className="border-b border-line px-4 py-2.5">
          <span className="text-[0.78rem] font-bold tracking-wide text-primary">
            {fmt.format(n)} محرفاً
          </span>
        </div>
        <ul className="divide-y divide-line">
          {PLATFORMS.map((p) => {
            const left = p.limit - n;
            const over = left < 0;
            const pct = Math.min(100, (n / p.limit) * 100);
            return (
              <li key={p.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-2.5">
                <span className="min-w-32 flex-1">{p.name}</span>
                <span className="h-1.5 w-28 shrink-0 overflow-hidden rounded-full bg-surface2" aria-hidden="true">
                  <span
                    className={`block h-full rounded-full ${over ? "bg-danger" : "bg-primary"}`}
                    style={{ width: `${pct}%` }}
                  />
                </span>
                <span
                  dir="ltr"
                  className={`w-24 shrink-0 text-end font-mono text-[0.86rem] tabular-nums ${over ? "text-danger" : "text-muted"}`}
                >
                  {over ? `+${fmt.format(-left)}` : fmt.format(left)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <Note>
        العددُ بنقاط الترميز لا بالبايتات — وهو ما تعدّه المنصّات. والرسالةُ النصّيّة العربيّة
        <b className="font-semibold text-ink"> ٧٠ محرفاً</b> لا ١٦٠، لأنّها تُرسَل بترميز UCS-2.
      </Note>
    </ToolLayout>
  );
}
