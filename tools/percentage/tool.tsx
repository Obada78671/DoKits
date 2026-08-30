"use client";

import { useMemo, useState } from "react";
import { useLang, useStrings } from "@/components/lang";
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

const MODES_EN: Record<string, { label: string; a: string; b: string; sentence: (a: string, b: string, r: string) => string }> = {
  of: { label: "What is X% of an amount", a: "Percentage %", b: "Amount", sentence: (a, b, r) => `${a}% of ${b} is ${r}` },
  isWhatPct: { label: "One amount is what % of another", a: "Part", b: "Whole", sentence: (a, b, r) => `${a} out of ${b} is ${r}%` },
  change: { label: "Percentage change", a: "From", b: "To", sentence: (a, b, r) => `The change from ${a} to ${b} is ${r}%` },
  increase: { label: "Increase an amount by %", a: "Amount", b: "Increase %", sentence: (a, b, r) => `${a} increased by ${b}% becomes ${r}` },
  decrease: { label: "Decrease an amount by %", a: "Amount", b: "Decrease %", sentence: (a, b, r) => `${a} decreased by ${b}% becomes ${r}` },
  reverse: { label: "An amount is X% of what", a: "Part", b: "Percentage %", sentence: (a, b, r) => `${a} is ${b}% of ${r}` },
};

const S = {
  ar: { question: "السؤال", answer: "الجواب", note: "الخانتان تتبدّل تسميتُهما بحسب السؤال، فلا تخلط الجزءَ بالكلّ." },
  en: { question: "Question", answer: "Answer", note: "The two fields are renamed for each question, so the part is never confused with the whole." },
};

export default function Percentage() {
  const s = useStrings(S);
  const isEn = useLang() === "en";
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
      <ChipGroup label={s.question} value={mode} onChange={setMode}
        options={MODES.map((m) => ({ id: m.id, label: isEn ? MODES_EN[m.id].label : m.label }))} />
      <div className="flex flex-wrap gap-3">
        <Field label={def.a} htmlFor="p-a" className="min-w-36 flex-1">
          <NumberField id="p-a" value={a} onChange={setA} />
        </Field>
        <Field label={def.b} htmlFor="p-b" className="min-w-36 flex-1">
          <NumberField id="p-b" value={b} onChange={setB} />
        </Field>
      </div>
      <ResultBox title={s.answer} value={out} />
      <Note>{s.note}</Note>
    </ToolLayout>
  );
}
