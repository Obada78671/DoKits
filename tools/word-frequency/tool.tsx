"use client";

import { useMemo, useState } from "react";
import { ChipGroup, CopyButton, Field, Note, TextArea, Tiles, ToolLayout } from "@/components/tool-kit";
import { wordFrequency } from "@/tools/text-lib";

const fmt = new Intl.NumberFormat("en-US");

export default function WordFrequency() {
  const [text, setText] = useState("");
  const [norm, setNorm] = useState<"on" | "off">("on");

  const rows = useMemo(
    () => wordFrequency(text, { ignoreDiacritics: norm === "on" }),
    [text, norm],
  );

  const top = rows.slice(0, 60);
  const total = rows.reduce((s, r) => s + r.count, 0);
  const asText = rows.map((r) => `${r.word}\t${r.count}`).join("\n");
  const max = rows[0]?.count ?? 1;

  return (
    <ToolLayout>
      <Field label="النصّ" htmlFor="wf-in">
        <TextArea id="wf-in" value={text} onChange={setText} placeholder="ألصق نصّاً…" />
      </Field>
      <ChipGroup
        label="المطابقة"
        value={norm}
        onChange={setNorm}
        hint="التوحيدُ يجمع «الكتاب» و«الكِتَاب» و«ٱلكتاب» كلمةً واحدة."
        options={[
          { id: "on", label: "توحيدُ التشكيل والألف" },
          { id: "off", label: "كما كُتبت" },
        ]}
      />
      <Tiles
        items={[
          { label: "كلماتٌ مختلفة", value: fmt.format(rows.length), lit: true },
          { label: "مجموعُ الكلمات", value: fmt.format(total) },
          { label: "أكثرُها ورودًا", value: fmt.format(max) },
        ]}
      />
      <div className="rounded-m border border-line bg-surface">
        <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
          <span className="text-[0.78rem] font-bold tracking-wide text-primary">الجدول</span>
          <span className="ms-auto"><CopyButton value={asText} /></span>
        </div>
        {top.length === 0 ? (
          <p className="px-4 py-6 text-center text-muted">—</p>
        ) : (
          <ul className="max-h-96 divide-y divide-line overflow-y-auto">
            {top.map((r) => (
              <li key={r.word} className="flex items-center gap-3 px-4 py-2">
                <span className="min-w-0 flex-1 truncate">{r.word}</span>
                <span className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-surface2" aria-hidden="true">
                  <span className="block h-full rounded-full bg-primary" style={{ width: `${(r.count / max) * 100}%` }} />
                </span>
                <span dir="ltr" className="w-10 shrink-0 text-end font-mono text-[0.86rem] tabular-nums text-muted">
                  {fmt.format(r.count)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {rows.length > 60 && <Note>يُعرض أكثرُ ٦٠ كلمة — وزرُّ النسخ يأخذ الجدولَ كاملاً.</Note>}
    </ToolLayout>
  );
}
