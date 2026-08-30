"use client";

import { useMemo, useState } from "react";
import { Field, Note, ResultBox, Tiles, ToolLayout } from "@/components/tool-kit";
import { dateSpan, parseDate } from "@/tools/convert-lib";

const today = () => new Date().toISOString().slice(0, 10);
const nf = new Intl.NumberFormat("en-US");

export default function DateDiff() {
  const [a, setA] = useState(today());
  const [b, setB] = useState(today());

  const span = useMemo(() => {
    const da = parseDate(a);
    const db = parseDate(b);
    return da && db ? dateSpan(da, db) : null;
  }, [a, b]);

  const prose = span
    ? [
        span.years ? `${nf.format(span.years)} ${span.years === 1 ? "سنة" : span.years === 2 ? "سنتان" : "سنوات"}` : "",
        span.months ? `${nf.format(span.months)} ${span.months === 1 ? "شهر" : span.months === 2 ? "شهران" : "أشهر"}` : "",
        span.days ? `${nf.format(span.days)} ${span.days === 1 ? "يوم" : span.days === 2 ? "يومان" : "أيّام"}` : "",
      ].filter(Boolean).join(" و") || "اليومُ نفسُه"
    : "";

  return (
    <ToolLayout>
      <div className="flex flex-wrap gap-3">
        <Field label="من تاريخ" htmlFor="dd-a" className="min-w-40 flex-1">
          <input id="dd-a" type="date" dir="ltr" className="field font-mono" value={a} onChange={(e) => setA(e.target.value)} />
        </Field>
        <Field label="إلى تاريخ" htmlFor="dd-b" className="min-w-40 flex-1">
          <input id="dd-b" type="date" dir="ltr" className="field font-mono" value={b} onChange={(e) => setB(e.target.value)} />
        </Field>
      </div>

      <ResultBox title="المدّة" value={prose} />

      <Tiles
        items={[
          { label: "أيّام", value: span ? nf.format(span.totalDays) : "—", lit: true },
          { label: "أسابيع", value: span ? nf.format(span.totalWeeks) : "—" },
          { label: "أشهر", value: span ? nf.format(span.totalMonths) : "—" },
          { label: "ساعات", value: span ? nf.format(span.totalDays * 24) : "—" },
        ]}
      />

      <Note>
        الأشهرُ تُعدّ بالتقويم لا بمتوسّطٍ ثابت — و«٣١ كانون الثاني + شهر» تساوي آخرَ شباط،
        فالمدّةُ شهرٌ تامّ. أمّا «أشهر» في البلاطات فمجموعُ الأشهر الكاملة.
      </Note>
    </ToolLayout>
  );
}
