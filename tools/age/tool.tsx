"use client";

import { useMemo, useState } from "react";
import { Field, Note, ResultBox, Tiles, ToolLayout } from "@/components/tool-kit";
import { dateSpan, nextAnniversary, parseDate } from "@/tools/convert-lib";

const nf = new Intl.NumberFormat("en-US");
const WEEKDAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default function Age() {
  const [birth, setBirth] = useState("");
  const [asOf, setAsOf] = useState(() => new Date().toISOString().slice(0, 10));

  const res = useMemo(() => {
    const b = parseDate(birth);
    const t = parseDate(asOf);
    if (!b || !t || b > t) return null;
    const span = dateSpan(b, t);
    const next = nextAnniversary(b, t);
    return { span, next, bornOn: WEEKDAYS[b.getUTCDay()] };
  }, [birth, asOf]);

  const prose = res
    ? `${nf.format(res.span.years)} سنة و${nf.format(res.span.months)} شهراً و${nf.format(res.span.days)} يوماً`
    : "";

  return (
    <ToolLayout>
      <div className="flex flex-wrap gap-3">
        <Field label="تاريخ الميلاد" htmlFor="ag-b" className="min-w-40 flex-1">
          <input id="ag-b" type="date" dir="ltr" className="field font-mono" value={birth} onChange={(e) => setBirth(e.target.value)} />
        </Field>
        <Field label="احسب حتّى" htmlFor="ag-t" className="min-w-40 flex-1">
          <input id="ag-t" type="date" dir="ltr" className="field font-mono" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
        </Field>
      </div>

      <ResultBox
        title="العمر"
        value={prose}
        hint={res ? `وُلد يومَ ${res.bornOn}` : undefined}
      />

      <Tiles
        items={[
          { label: "أيّام عشتَها", value: res ? nf.format(res.span.totalDays) : "—", lit: true },
          { label: "أسابيع", value: res ? nf.format(res.span.totalWeeks) : "—" },
          { label: "أشهر", value: res ? nf.format(res.span.totalMonths) : "—" },
          { label: "الميلادُ القادم بعد", value: res ? `${nf.format(res.next.inDays)} يوماً` : "—" },
        ]}
      />

      <Note>
        العمرُ ميلاديٌّ هنا. لعمرك بالتقويم الهجريّ حوّل تاريخَ ميلادك ثمّ اليومَ
        بأداة <b className="font-semibold text-ink">التقويم الهجريّ والميلاديّ</b> واطرح.
      </Note>
    </ToolLayout>
  );
}
