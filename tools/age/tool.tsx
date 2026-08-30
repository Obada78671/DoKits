"use client";

import { useMemo, useState } from "react";
import { Field, Note, ResultBox, Tiles, ToolLayout } from "@/components/tool-kit";
import { dateSpan, nextAnniversary, parseDate } from "@/tools/convert-lib";
import { useLang, useStrings } from "@/components/lang";
import { WEEKDAY_EN } from "@/tools/names-en";

const nf = new Intl.NumberFormat("en-US");
const WEEKDAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

const S = {
  ar: {
    age: (y: string, m: string, d: string) => `${y} سنة و${m} شهراً و${d} يوماً`,
    birth: "تاريخ الميلاد", until: "احسب حتّى", title: "العمر",
    bornOn: (d: string) => `وُلد يومَ ${d}`,
    lived: "أيّام عشتَها", weeks: "أسابيع", months: "أشهر",
    nextIn: "الميلادُ القادم بعد", inDays: (n: string) => `${n} يوماً`,
    n1: "العمرُ ميلاديٌّ هنا. لعمرك بالتقويم الهجريّ حوّل تاريخَ ميلادك ثمّ اليومَ بأداة ",
    b: "التقويم الهجريّ والميلاديّ", n2: " واطرح.",
  },
  en: {
    age: (y: string, m: string, d: string) => `${y} years, ${m} months and ${d} days`,
    birth: "Date of birth", until: "Calculate until", title: "Age",
    bornOn: (d: string) => `Born on a ${d}`,
    lived: "Days lived", weeks: "Weeks", months: "Months",
    nextIn: "Next birthday in", inDays: (n: string) => `${n} days`,
    n1: "This age is Gregorian. For your age in the Hijri calendar, convert your birth date and today with the ",
    b: "Hijri ↔ Gregorian", n2: " tool and subtract.",
  },
};

export default function Age() {
  const s = useStrings(S);
  const isEn = useLang() === "en";
  const [birth, setBirth] = useState("");
  const [asOf, setAsOf] = useState(() => new Date().toISOString().slice(0, 10));

  const res = useMemo(() => {
    const b = parseDate(birth);
    const t = parseDate(asOf);
    if (!b || !t || b > t) return null;
    const span = dateSpan(b, t);
    const next = nextAnniversary(b, t);
    return { span, next, bornOn: (isEn ? WEEKDAY_EN : WEEKDAYS_AR)[b.getUTCDay()] };
  }, [birth, asOf]);

  const prose = res
    ? s.age(nf.format(res.span.years), nf.format(res.span.months), nf.format(res.span.days))
    : "";

  return (
    <ToolLayout>
      <div className="flex flex-wrap gap-3">
        <Field label={s.birth} htmlFor="ag-b" className="min-w-40 flex-1">
          <input id="ag-b" type="date" dir="ltr" className="field font-mono" value={birth} onChange={(e) => setBirth(e.target.value)} />
        </Field>
        <Field label={s.until} htmlFor="ag-t" className="min-w-40 flex-1">
          <input id="ag-t" type="date" dir="ltr" className="field font-mono" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
        </Field>
      </div>

      <ResultBox
        title={s.title}
        value={prose}
        hint={res ? s.bornOn(res.bornOn) : undefined}
      />

      <Tiles
        items={[
          { label: s.lived, value: res ? nf.format(res.span.totalDays) : "—", lit: true },
          { label: s.weeks, value: res ? nf.format(res.span.totalWeeks) : "—" },
          { label: s.months, value: res ? nf.format(res.span.totalMonths) : "—" },
          { label: s.nextIn, value: res ? s.inDays(nf.format(res.next.inDays)) : "—" },
        ]}
      />

      <Note>
        {s.n1}<b className="font-semibold text-ink">{s.b}</b>{s.n2}
      </Note>
    </ToolLayout>
  );
}
