"use client";

import { useMemo, useState } from "react";
import { ChipGroup, Field, NumberField, Note, Tiles, ToolLayout } from "@/components/tool-kit";
import { eosb, money, num, type EosbCountry } from "@/tools/finance-lib";
import { useStrings } from "@/components/lang";

const S = {
  ar: {
    wage: "الأجرُ الشهريّ الأخير", start: "تاريخُ المباشرة", end: "تاريخُ الانتهاء",
    system: "النظام", sa: "السعوديّة", ae: "الإمارات", custom: "أيّامٌ لكلّ سنة",
    days: "عددُ الأيّام لكلّ سنةِ خدمة",
    award: "المكافأةُ التقديريّة", service: "مدّةُ الخدمة", yearsUnit: (y: string): string => `${y} سنة`,
    daily: "أجرُ اليوم",
    b: "تقديرٌ إرشاديٌّ لا فتوى قانونيّة.",
    n: " الأنظمةُ تتغيّر، والمستحقُّ يختلف بسبب انتهاء الخدمة (استقالةٌ أم إنهاءٌ) وبما يدخل في «الأجر». راجع نظامَ بلدك وعقدَك قبل الاعتماد على أيّ رقمٍ هنا.",
  },
  en: {
    wage: "Last monthly wage", start: "Start date", end: "End date",
    system: "System", sa: "Saudi Arabia", ae: "UAE", custom: "Days per year",
    days: "Days per year of service",
    award: "Estimated award", service: "Length of service", yearsUnit: (y: string): string => `${y} years`,
    daily: "Daily wage",
    b: "An indicative estimate, not legal advice.",
    n: " Regulations change, and the entitlement varies with the reason for leaving (resignation or termination) and with what counts as \"wage\". Check your country's law and your contract before relying on any figure here.",
  },
};

export default function EndOfService() {
  const s = useStrings(S);
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
        <Field label={s.wage} htmlFor="e-w" className="min-w-40 flex-[2]">
          <NumberField id="e-w" value={wage} onChange={setWage} placeholder="10000" />
        </Field>
        <Field label={s.start} htmlFor="e-s" className="min-w-36 flex-1">
          <input id="e-s" type="date" dir="ltr" className="field font-mono" value={start} onChange={(e) => setStart(e.target.value)} />
        </Field>
        <Field label={s.end} htmlFor="e-e" className="min-w-36 flex-1">
          <input id="e-e" type="date" dir="ltr" className="field font-mono" value={end} onChange={(e) => setEnd(e.target.value)} />
        </Field>
      </div>

      <ChipGroup
        label={s.system}
        value={country}
        onChange={setCountry}
        options={[
          { id: "sa", label: s.sa },
          { id: "ae", label: s.ae },
          { id: "custom", label: s.custom },
        ]}
      />
      {country === "custom" && (
        <Field label={s.days} htmlFor="e-d" className="max-w-56">
          <NumberField id="e-d" value={days} onChange={setDays} min={1} />
        </Field>
      )}

      <Tiles
        items={[
          { label: s.award, value: res ? money(res.award) : "—", lit: true },
          { label: s.service, value: res ? s.yearsUnit(res.years.toFixed(2)) : "—" },
          { label: s.daily, value: w === null ? "—" : money(w / 30) },
        ]}
      />

      {res && (
        <ul className="flex flex-col gap-1.5 text-[0.9rem] text-muted">
          {res.breakdown.map((b, i) => <li key={i}>• {b}</li>)}
        </ul>
      )}

      <Note>
        <b className="font-semibold text-ink">{s.b}</b>{s.n}
      </Note>
    </ToolLayout>
  );
}
