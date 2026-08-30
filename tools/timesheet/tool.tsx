"use client";

import { useMemo, useState } from "react";
import { Field, NumberField, Note, TextField, Tiles, ToolLayout } from "@/components/tool-kit";
import { money, num, shiftHours, type Shift } from "@/tools/finance-lib";
import { useStrings } from "@/components/lang";

let seq = 0;
const blank = (): Shift => ({ id: `s${++seq}`, label: "", from: "09:00", to: "17:00", breakMin: 0 });

const S = {
  ar: {
    shifts: "الورديّات", addRow: "+ سطر", desc: "الوصف", dayN: (n: number): string => `يوم ${n}`,
    from: "من", to: "إلى", breakMin: "استراحة د", hour: "ساعة",
    del: "حذف", delRow: "حذف السطر", rate: "أجرُ الساعة",
    totalHours: "مجموعُ الساعات", hm: "بالساعات والدقائق", pay: "الأجرُ المستحقّ",
    note: "الورديّةُ العابرةُ منتصفَ الليل (٢٢:٠٠ ← ٠٦:٠٠) تُحسب ثماني ساعاتٍ لا سالباً.",
  },
  en: {
    shifts: "Shifts", addRow: "+ Row", desc: "Description", dayN: (n: number): string => `Day ${n}`,
    from: "From", to: "To", breakMin: "Break min", hour: "hours",
    del: "Delete", delRow: "Delete row", rate: "Hourly rate",
    totalHours: "Total hours", hm: "Hours and minutes", pay: "Pay due",
    note: "A shift crossing midnight (22:00 → 06:00) counts as eight hours, not a negative.",
  },
};

export default function Timesheet() {
  const s = useStrings(S);
  const [rows, setRows] = useState<Shift[]>(() => [blank(), blank()]);
  const [rate, setRate] = useState("");

  const patch = (id: string, p: Partial<Shift>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));

  const hours = useMemo(() => rows.map(shiftHours), [rows]);
  const total = hours.reduce((s, h) => s + h, 0);
  const r = num(rate);

  return (
    <ToolLayout>
      <div className="rounded-m border border-line bg-surface">
        <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
          <span className="text-[0.78rem] font-bold tracking-wide text-primary">{s.shifts}</span>
          <button className="btn btn-ghost ms-auto !px-3 !py-1 !text-[0.82rem]" onClick={() => setRows((rs) => [...rs, blank()])}>
            {s.addRow}
          </button>
        </div>
        <ul className="divide-y divide-line">
          {rows.map((row, i) => (
            <li key={row.id} className="flex flex-wrap items-end gap-2.5 px-4 py-3">
              <div className="min-w-28 flex-[2]">
                <label className="label" htmlFor={`ts-l-${row.id}`}>{s.desc}</label>
                <TextField id={`ts-l-${row.id}`} value={row.label} onChange={(v) => patch(row.id, { label: v })} placeholder={s.dayN(i + 1)} />
              </div>
              <div className="min-w-24 flex-1">
                <label className="label" htmlFor={`ts-f-${row.id}`}>{s.from}</label>
                <input id={`ts-f-${row.id}`} type="time" dir="ltr" className="field font-mono"
                       value={row.from} onChange={(e) => patch(row.id, { from: e.target.value })} />
              </div>
              <div className="min-w-24 flex-1">
                <label className="label" htmlFor={`ts-t-${row.id}`}>{s.to}</label>
                <input id={`ts-t-${row.id}`} type="time" dir="ltr" className="field font-mono"
                       value={row.to} onChange={(e) => patch(row.id, { to: e.target.value })} />
              </div>
              <div className="min-w-20 flex-1">
                <label className="label" htmlFor={`ts-b-${row.id}`}>{s.breakMin}</label>
                <NumberField id={`ts-b-${row.id}`} value={row.breakMin} onChange={(v) => patch(row.id, { breakMin: Number(v) || 0 })} min={0} />
              </div>
              <div className="min-w-16 shrink-0 pb-2 text-center">
                <div dir="ltr" className="font-mono tabular-nums">{money(hours[i], 2)}</div>
                <div className="text-[0.72rem] text-muted">{s.hour}</div>
              </div>
              <button
                className="btn btn-ghost !px-2.5 !py-1 text-danger"
                onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((x) => x.id !== row.id) : rs))}
                aria-label={s.delRow}
              >
                {s.del}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Field label={s.rate} htmlFor="ts-rate" className="max-w-48">
        <NumberField id="ts-rate" value={rate} onChange={setRate} placeholder="50" />
      </Field>

      <Tiles
        items={[
          { label: s.totalHours, value: money(total, 2), lit: true },
          { label: s.hm, value: `${Math.floor(total)}:${String(Math.round((total % 1) * 60)).padStart(2, "0")}` },
          { label: s.pay, value: r === null ? "—" : money(total * r) },
        ]}
      />
      <Note>{s.note}</Note>
    </ToolLayout>
  );
}
