"use client";

import { useMemo, useState } from "react";
import { ChipGroup, Field, Note, TextArea, Tiles, ToolLayout } from "@/components/tool-kit";
import { WEEKENDS, businessDays, parseDate, type WeekendId } from "@/tools/convert-lib";
import { useStrings } from "@/components/lang";

const nf = new Intl.NumberFormat("en-US");
const today = () => new Date().toISOString().slice(0, 10);

const S = {
  ar: {
    from: "من", to: "إلى", weekend: "عطلةُ نهاية الأسبوع",
    holidays: "عطلٌ رسميّة (اختياريّ)",
    holHint: "تاريخٌ في كلّ سطر بصيغة 2026-09-23 — تُطرح إن لم تصادف نهاية الأسبوع.",
    working: "أيّامُ عمل", total: "الأيّامُ كلُّها", we: "نهاياتُ أسبوع", off: "عطلٌ مطروحة",
    note: "الطرفان محسوبان ضمن المدّة. والعطلةُ التي تصادف نهايةَ الأسبوع لا تُطرح مرّتين.",
  },
  en: {
    from: "From", to: "To", weekend: "Weekend",
    holidays: "Public holidays (optional)",
    holHint: "One date per line as 2026-09-23 — subtracted unless it already falls on a weekend.",
    working: "Working days", total: "All days", we: "Weekend days", off: "Holidays subtracted",
    note: "Both endpoints are included. A holiday that falls on a weekend is not subtracted twice.",
  },
};

export default function BusinessDays() {
  const s = useStrings(S);
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
        <Field label={s.from} htmlFor="bd-a" className="min-w-40 flex-1">
          <input id="bd-a" type="date" dir="ltr" className="field font-mono" value={a} onChange={(e) => setA(e.target.value)} />
        </Field>
        <Field label={s.to} htmlFor="bd-b" className="min-w-40 flex-1">
          <input id="bd-b" type="date" dir="ltr" className="field font-mono" value={b} onChange={(e) => setB(e.target.value)} />
        </Field>
      </div>

      <ChipGroup
        label={s.weekend}
        value={weekend}
        onChange={setWeekend}
        options={WEEKENDS.map((w) => ({ id: w.id, label: w.name }))}
      />

      <Field
        label={s.holidays}
        htmlFor="bd-h"
        hint={s.holHint}
      >
        <TextArea id="bd-h" value={holidays} onChange={setHolidays} rows={3} dir="ltr" placeholder={"2026-09-23\n2027-01-01"} />
      </Field>

      <Tiles
        items={[
          { label: s.working, value: res ? nf.format(res.working) : "—", lit: true },
          { label: s.total, value: res ? nf.format(res.total) : "—" },
          { label: s.we, value: res ? nf.format(res.weekend) : "—" },
          { label: s.off, value: res ? nf.format(res.holidays) : "—" },
        ]}
      />

      <Note>{s.note}</Note>
    </ToolLayout>
  );
}
