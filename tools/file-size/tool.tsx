"use client";

import { useMemo, useState } from "react";
import { useStrings } from "@/components/lang";
import { ChipGroup, Field, NumberField, Note, ResultBox, ToolLayout } from "@/components/tool-kit";
import { SIZE_UNITS_BIN, SIZE_UNITS_SI, fmt, humanSize, num, sizeToBytes, type SizeBase } from "@/tools/convert-lib";

const S = {
  ar: {
    value: "القيمة", unit: "الوحدة", base: "الأساس",
    h1024: "الأساس ١٠٢٤ — ما يعرضه نظامُ التشغيل ومديرُ الملفّات.",
    h1000: "الأساس ١٠٠٠ — ما يكتبه صنّاعُ الأقراص على العلبة، ولهذا يبدو القرصُ أصغرَ بعد التركيب.",
    b1024: "١٠٢٤ (ثنائيّ)", b1000: "١٠٠٠ (عشريّ)",
    inBytes: "بالبايتات", bytes: "بايت", otherBase: (v: string) => `بالأساس الآخر: ${v}`,
    note: "قرصُ «١ تيرابايت» يُباع بالأساس ١٠٠٠ فيساوي ٩٣١ غيبيبايت في نظامك — والفرقُ ليس عطلاً.",
  },
  en: {
    value: "Value", unit: "Unit", base: "Base",
    h1024: "Base 1024 — what your operating system and file manager show.",
    h1000: "Base 1000 — what drive makers print on the box, which is why a disk looks smaller once installed.",
    b1024: "1024 (binary)", b1000: "1000 (decimal)",
    inBytes: "In bytes", bytes: "bytes", otherBase: (v: string) => `In the other base: ${v}`,
    note: "A \"1 TB\" drive is sold in base 1000, so it is 931 GiB in your system — the difference is not a fault.",
  },
};

export default function FileSize() {
  const s = useStrings(S);
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
        <Field label={s.value} htmlFor="fs-v" className="min-w-32 flex-1">
          <NumberField id="fs-v" value={value} onChange={setValue} min={0} />
        </Field>
        <Field label={s.unit} htmlFor="fs-u" className="min-w-40 flex-1">
          <select id="fs-u" className="field" value={index} onChange={(e) => setIndex(Number(e.target.value))}>
            {names.map((n, i) => <option key={n} value={i}>{n}</option>)}
          </select>
        </Field>
      </div>

      <ChipGroup
        label={s.base}
        value={String(base)}
        onChange={(id) => setBase(Number(id) as SizeBase)}
        hint={base === 1024
          ? s.h1024
          : s.h1000}
        options={[
          { id: "1024", label: s.b1024 },
          { id: "1000", label: s.b1000 },
        ]}
      />

      <ResultBox
        title={s.inBytes}
        value={bytes === null ? "" : `${fmt(bytes, 0)} ${s.bytes}`}
        dir="ltr"
        mono
        hint={other ? s.otherBase(other) : undefined}
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
        {s.note}
      </Note>
    </ToolLayout>
  );
}
