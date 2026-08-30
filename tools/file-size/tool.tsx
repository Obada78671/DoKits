"use client";

import { useMemo, useState } from "react";
import { ChipGroup, Field, NumberField, Note, ResultBox, ToolLayout } from "@/components/tool-kit";
import { SIZE_UNITS_BIN, SIZE_UNITS_SI, fmt, humanSize, num, sizeToBytes, type SizeBase } from "@/tools/convert-lib";

export default function FileSize() {
  const [value, setValue] = useState("1");
  const [index, setIndex] = useState(3);
  const [base, setBase] = useState<SizeBase>(1024);

  const names = base === 1024 ? SIZE_UNITS_BIN : SIZE_UNITS_SI;
  const v = num(value);
  const bytes = v === null ? null : sizeToBytes(v, index, base);

  const rows = useMemo(() => {
    if (bytes === null) return [];
    return names.map((n, i) => ({ name: n, value: fmt(bytes / base ** i, 4) }));
  }, [bytes, names, base]);

  const other = useMemo(() => {
    if (bytes === null) return null;
    const o: SizeBase = base === 1024 ? 1000 : 1024;
    const h = humanSize(bytes, o);
    return `${fmt(h.value, 3)} ${h.unit}`;
  }, [bytes, base]);

  return (
    <ToolLayout>
      <div className="flex flex-wrap items-end gap-3">
        <Field label="القيمة" htmlFor="fs-v" className="min-w-32 flex-1">
          <NumberField id="fs-v" value={value} onChange={setValue} min={0} />
        </Field>
        <Field label="الوحدة" htmlFor="fs-u" className="min-w-40 flex-1">
          <select id="fs-u" className="field" value={index} onChange={(e) => setIndex(Number(e.target.value))}>
            {names.map((n, i) => <option key={n} value={i}>{n}</option>)}
          </select>
        </Field>
      </div>

      <ChipGroup
        label="الأساس"
        value={String(base)}
        onChange={(id) => setBase(Number(id) as SizeBase)}
        hint={base === 1024
          ? "الأساس ١٠٢٤ — ما يعرضه نظامُ التشغيل ومديرُ الملفّات."
          : "الأساس ١٠٠٠ — ما يكتبه صنّاعُ الأقراص على العلبة، ولهذا يبدو القرصُ أصغرَ بعد التركيب."}
        options={[
          { id: "1024", label: "١٠٢٤ (ثنائيّ)" },
          { id: "1000", label: "١٠٠٠ (عشريّ)" },
        ]}
      />

      <ResultBox
        title="بالبايتات"
        value={bytes === null ? "" : `${fmt(bytes, 0)} بايت`}
        dir="ltr"
        mono
        hint={other ? `بالأساس الآخر: ${other}` : undefined}
      />

      {rows.length > 0 && (
        <div className="rounded-m border border-line bg-surface">
          <ul className="divide-y divide-line">
            {rows.map((r) => (
              <li key={r.name} className="flex items-center gap-3 px-4 py-2">
                <span className="text-muted">{r.name}</span>
                <span dir="ltr" className="ms-auto font-mono tabular-nums">{r.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Note>
        قرصُ «١ تيرابايت» يُباع بالأساس ١٠٠٠ فيساوي ٩٣١ غيبيبايت في نظامك — والفرقُ ليس عطلاً.
      </Note>
    </ToolLayout>
  );
}
