"use client";

import { useMemo, useState } from "react";
import { ChipGroup, Field, NumberField, Note, ResultBox, ToolLayout } from "@/components/tool-kit";
import { money, num, percent, type PercentMode } from "@/tools/finance-lib";

const MODES: { id: PercentMode; label: string; a: string; b: string; sentence: (a: string, b: string, r: string) => string }[] = [
  { id: "of", label: "كم يساوي ٪ من مبلغ", a: "النسبة ٪", b: "المبلغ", sentence: (a, b, r) => `${a}٪ من ${b} تساوي ${r}` },
  { id: "isWhatPct", label: "مبلغٌ هو كم ٪ من آخر", a: "الجزء", b: "الكلّ", sentence: (a, b, r) => `${a} من ${b} تساوي ${r}٪` },
  { id: "change", label: "نسبةُ التغيّر", a: "من", b: "إلى", sentence: (a, b, r) => `التغيّرُ من ${a} إلى ${b} هو ${r}٪` },
  { id: "increase", label: "زيادةُ مبلغٍ بنسبة", a: "المبلغ", b: "الزيادة ٪", sentence: (a, b, r) => `${a} بعد زيادة ${b}٪ تصير ${r}` },
  { id: "decrease", label: "نقصانُ مبلغٍ بنسبة", a: "المبلغ", b: "النقص ٪", sentence: (a, b, r) => `${a} بعد نقص ${b}٪ تصير ${r}` },
  { id: "reverse", label: "مبلغٌ هو ٪ من ماذا", a: "الجزء", b: "النسبة ٪", sentence: (a, b, r) => `${a} هو ${b}٪ من ${r}` },
];

export default function Percentage() {
  const [mode, setMode] = useState<PercentMode>("of");
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const def = MODES.find((m) => m.id === mode)!;
  const na = num(a);
  const nb = num(b);

  const out = useMemo(() => {
    if (na === null || nb === null) return "";
    const r = percent(mode, na, nb);
    if (!Number.isFinite(r)) return "";
    return def.sentence(money(na), money(nb), money(r));
  }, [mode, na, nb, def]);

  return (
    <ToolLayout>
      <ChipGroup label="السؤال" value={mode} onChange={setMode} options={MODES.map((m) => ({ id: m.id, label: m.label }))} />
      <div className="flex flex-wrap gap-3">
        <Field label={def.a} htmlFor="p-a" className="min-w-36 flex-1">
          <NumberField id="p-a" value={a} onChange={setA} />
        </Field>
        <Field label={def.b} htmlFor="p-b" className="min-w-36 flex-1">
          <NumberField id="p-b" value={b} onChange={setB} />
        </Field>
      </div>
      <ResultBox title="الجواب" value={out} />
      <Note>الخانتان تتبدّل تسميتُهما بحسب السؤال، فلا تخلط الجزءَ بالكلّ.</Note>
    </ToolLayout>
  );
}
