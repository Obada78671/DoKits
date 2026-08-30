"use client";

import { useMemo, useState } from "react";
import { Field, Note, ResultBox, Tiles, ToolLayout } from "@/components/tool-kit";
import { dateSpan, parseDate } from "@/tools/convert-lib";
import { useStrings } from "@/components/lang";

const today = () => new Date().toISOString().slice(0, 10);
const nf = new Intl.NumberFormat("en-US");

const S = {
  ar: {
    y: (n: number): string => (n === 1 ? "سنة" : n === 2 ? "سنتان" : "سنوات"),
    mo: (n: number): string => (n === 1 ? "شهر" : n === 2 ? "شهران" : "أشهر"),
    d: (n: number): string => (n === 1 ? "يوم" : n === 2 ? "يومان" : "أيّام"),
    join: " و", same: "اليومُ نفسُه",
    from: "من تاريخ", to: "إلى تاريخ", span: "المدّة",
    days: "أيّام", weeks: "أسابيع", months: "أشهر", hours: "ساعات",
    note: "الأشهرُ تُعدّ بالتقويم لا بمتوسّطٍ ثابت — و«٣١ كانون الثاني + شهر» تساوي آخرَ شباط، فالمدّةُ شهرٌ تامّ. أمّا «أشهر» في البلاطات فمجموعُ الأشهر الكاملة.",
  },
  en: {
    y: (n: number): string => (n === 1 ? "year" : "years"),
    mo: (n: number): string => (n === 1 ? "month" : "months"),
    d: (n: number): string => (n === 1 ? "day" : "days"),
    join: ", ", same: "The same day",
    from: "From", to: "To", span: "Span",
    days: "Days", weeks: "Weeks", months: "Months", hours: "Hours",
    note: "Months are counted by the calendar, not by a fixed average — \"31 January + 1 month\" lands on the last day of February, so the span is exactly one month. The Months tile is the total of whole months.",
  },
};

export default function DateDiff() {
  const s = useStrings(S);
  const [a, setA] = useState(today());
  const [b, setB] = useState(today());

  const span = useMemo(() => {
    const da = parseDate(a);
    const db = parseDate(b);
    return da && db ? dateSpan(da, db) : null;
  }, [a, b]);

  const prose = span
    ? [
        span.years ? `${nf.format(span.years)} ${s.y(span.years)}` : "",
        span.months ? `${nf.format(span.months)} ${s.mo(span.months)}` : "",
        span.days ? `${nf.format(span.days)} ${s.d(span.days)}` : "",
      ].filter(Boolean).join(s.join) || s.same
    : "";

  return (
    <ToolLayout>
      <div className="flex flex-wrap gap-3">
        <Field label={s.from} htmlFor="dd-a" className="min-w-40 flex-1">
          <input id="dd-a" type="date" dir="ltr" className="field font-mono" value={a} onChange={(e) => setA(e.target.value)} />
        </Field>
        <Field label={s.to} htmlFor="dd-b" className="min-w-40 flex-1">
          <input id="dd-b" type="date" dir="ltr" className="field font-mono" value={b} onChange={(e) => setB(e.target.value)} />
        </Field>
      </div>

      <ResultBox title={s.span} value={prose} />

      <Tiles
        items={[
          { label: s.days, value: span ? nf.format(span.totalDays) : "—", lit: true },
          { label: s.weeks, value: span ? nf.format(span.totalWeeks) : "—" },
          { label: s.months, value: span ? nf.format(span.totalMonths) : "—" },
          { label: s.hours, value: span ? nf.format(span.totalDays * 24) : "—" },
        ]}
      />

      <Note>
        {s.note}
      </Note>
    </ToolLayout>
  );
}
