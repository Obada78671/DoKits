"use client";

import { useMemo, useState } from "react";
import { ChipGroup, CopyButton, ErrorNote, Field, Note, TextField, ToolLayout } from "@/components/tool-kit";
import { parseInBase, toBase } from "@/tools/convert-lib";

const COMMON = [
  { id: "2", label: "ثنائيّ ٢" },
  { id: "8", label: "ثمانيّ ٨" },
  { id: "10", label: "عشريّ ١٠" },
  { id: "16", label: "ستّ عشريّ ١٦" },
];

export default function NumberBase() {
  const [input, setInput] = useState("255");
  const [base, setBase] = useState(10);

  const parsed = useMemo(() => parseInBase(input, base), [input, base]);

  const rows = useMemo(() => {
    if (!parsed.ok) return [];
    return [2, 8, 10, 16, 32, 36].map((b) => ({
      base: b,
      value: toBase(parsed.value, b),
      prefix: b === 2 ? "0b" : b === 8 ? "0o" : b === 16 ? "0x" : "",
    }));
  }, [parsed]);

  return (
    <ToolLayout>
      <ChipGroup
        label="أساسُ المدخل"
        value={String(base)}
        onChange={(id) => setBase(Number(id))}
        options={COMMON}
      />
      <Field label="العدد" htmlFor="nb-in" hint="تُقبل البادئات 0x و0b و0o وتُهمَل.">
        <TextField id="nb-in" value={input} onChange={setInput} dir="ltr" mono placeholder="255" />
      </Field>

      {!parsed.ok && parsed.error ? <ErrorNote>{parsed.error}</ErrorNote> : null}

      {rows.length > 0 && (
        <div className="rounded-m border border-line bg-surface">
          <div className="border-b border-line px-4 py-2.5">
            <span className="text-[0.78rem] font-bold tracking-wide text-primary">بكلّ الأسس</span>
          </div>
          <ul className="divide-y divide-line">
            {rows.map((r) => (
              <li key={r.base} className={`flex items-center gap-3 px-4 py-2 ${r.base === base ? "bg-accent-soft" : ""}`}>
                <span className="w-16 shrink-0 text-muted">أساس {r.base}</span>
                <span dir="ltr" className="min-w-0 flex-1 truncate font-mono tabular-nums">
                  <span className="text-muted">{r.prefix}</span>{r.value}
                </span>
                <CopyButton value={r.value} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <Note>
        الحسابُ بأعدادٍ صحيحةٍ غيرِ محدودة (BigInt) — فالأعدادُ الكبيرةُ تُحوَّل بلا فقدِ دقّة.
      </Note>
    </ToolLayout>
  );
}
