"use client";

import { useMemo, useState } from "react";
import { ChipGroup, Field, Note, TextArea, Tiles, ToolLayout } from "@/components/tool-kit";
import { WEEKENDS, businessDays, parseDate, type WeekendId } from "@/tools/convert-lib";

const nf = new Intl.NumberFormat("en-US");
const today = () => new Date().toISOString().slice(0, 10);

export default function BusinessDays() {
  const [a, setA] = useState(today());
  const [b, setB] = useState(today());
  const [weekend, setWeekend] = useState<WeekendId>("fri-sat");
  const [holidays, setHolidays] = useState("");

  const res = useMemo(() => {
    const da = parseDate(a);
    const db = parseDate(b);
    if (!da || !db) return null;
    const days = WEEKENDS.find((w) => w.id === weekend)!.days;
    const set = new Set(
      holidays.split(/[\s,،]+/).map((s) => s.trim()).filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s)),
    );
    return { ...businessDays(da, db, days, set), holidayCount: set.size };
  }, [a, b, weekend, holidays]);

  return (
    <ToolLayout>
      <div className="flex flex-wrap gap-3">
        <Field label="من" htmlFor="bd-a" className="min-w-40 flex-1">
          <input id="bd-a" type="date" dir="ltr" className="field font-mono" value={a} onChange={(e) => setA(e.target.value)} />
        </Field>
        <Field label="إلى" htmlFor="bd-b" className="min-w-40 flex-1">
          <input id="bd-b" type="date" dir="ltr" className="field font-mono" value={b} onChange={(e) => setB(e.target.value)} />
        </Field>
      </div>

      <ChipGroup
        label="عطلةُ نهاية الأسبوع"
        value={weekend}
        onChange={setWeekend}
        options={WEEKENDS.map((w) => ({ id: w.id, label: w.name }))}
      />

      <Field
        label="عطلٌ رسميّة (اختياريّ)"
        htmlFor="bd-h"
        hint="تاريخٌ في كلّ سطر بصيغة 2026-09-23 — تُطرح إن لم تصادف نهاية الأسبوع."
      >
        <TextArea id="bd-h" value={holidays} onChange={setHolidays} rows={3} dir="ltr" placeholder={"2026-09-23\n2027-01-01"} />
      </Field>

      <Tiles
        items={[
          { label: "أيّامُ عمل", value: res ? nf.format(res.working) : "—", lit: true },
          { label: "الأيّامُ كلُّها", value: res ? nf.format(res.total) : "—" },
          { label: "نهاياتُ أسبوع", value: res ? nf.format(res.weekend) : "—" },
          { label: "عطلٌ مطروحة", value: res ? nf.format(res.holidays) : "—" },
        ]}
      />

      <Note>الطرفان محسوبان ضمن المدّة. والعطلةُ التي تصادف نهايةَ الأسبوع لا تُطرح مرّتين.</Note>
    </ToolLayout>
  );
}
