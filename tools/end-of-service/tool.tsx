"use client";

import { useMemo, useState } from "react";
import { ChipGroup, Field, NumberField, Note, Tiles, ToolLayout } from "@/components/tool-kit";
import { eosb, money, num, type EosbCountry } from "@/tools/finance-lib";

export default function EndOfService() {
  const [wage, setWage] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [country, setCountry] = useState<EosbCountry>("sa");
  const [days, setDays] = useState("30");

  const w = num(wage);
  const totalDays = useMemo(() => {
    const a = Date.parse(start);
    const b = Date.parse(end);
    if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return 0;
    return (b - a) / 86_400_000;
  }, [start, end]);

  const res = useMemo(
    () => (w === null || totalDays <= 0 ? null : eosb(w, totalDays, country, num(days) ?? 30)),
    [w, totalDays, country, days],
  );

  return (
    <ToolLayout>
      <div className="flex flex-wrap gap-3">
        <Field label="الأجرُ الشهريّ الأخير" htmlFor="e-w" className="min-w-40 flex-[2]">
          <NumberField id="e-w" value={wage} onChange={setWage} placeholder="10000" />
        </Field>
        <Field label="تاريخُ المباشرة" htmlFor="e-s" className="min-w-36 flex-1">
          <input id="e-s" type="date" dir="ltr" className="field font-mono" value={start} onChange={(e) => setStart(e.target.value)} />
        </Field>
        <Field label="تاريخُ الانتهاء" htmlFor="e-e" className="min-w-36 flex-1">
          <input id="e-e" type="date" dir="ltr" className="field font-mono" value={end} onChange={(e) => setEnd(e.target.value)} />
        </Field>
      </div>

      <ChipGroup
        label="النظام"
        value={country}
        onChange={setCountry}
        options={[
          { id: "sa", label: "السعوديّة" },
          { id: "ae", label: "الإمارات" },
          { id: "custom", label: "أيّامٌ لكلّ سنة" },
        ]}
      />
      {country === "custom" && (
        <Field label="عددُ الأيّام لكلّ سنةِ خدمة" htmlFor="e-d" className="max-w-56">
          <NumberField id="e-d" value={days} onChange={setDays} min={1} />
        </Field>
      )}

      <Tiles
        items={[
          { label: "المكافأةُ التقديريّة", value: res ? money(res.award) : "—", lit: true },
          { label: "مدّةُ الخدمة", value: res ? `${res.years.toFixed(2)} سنة` : "—" },
          { label: "أجرُ اليوم", value: w === null ? "—" : money(w / 30) },
        ]}
      />

      {res && (
        <ul className="flex flex-col gap-1.5 text-[0.9rem] text-muted">
          {res.breakdown.map((b, i) => <li key={i}>• {b}</li>)}
        </ul>
      )}

      <Note>
        <b className="font-semibold text-ink">تقديرٌ إرشاديٌّ لا فتوى قانونيّة.</b> الأنظمةُ تتغيّر،
        والمستحقُّ يختلف بسبب انتهاء الخدمة (استقالةٌ أم إنهاءٌ) وبما يدخل في «الأجر». راجع نظامَ
        بلدك وعقدَك قبل الاعتماد على أيّ رقمٍ هنا.
      </Note>
    </ToolLayout>
  );
}
