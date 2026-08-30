"use client";

import { useMemo, useState } from "react";
import { Field, NumberField, Note, TextField, Tiles, ToolLayout } from "@/components/tool-kit";
import { money, num, shiftHours, type Shift } from "@/tools/finance-lib";

let seq = 0;
const blank = (): Shift => ({ id: `s${++seq}`, label: "", from: "09:00", to: "17:00", breakMin: 0 });

export default function Timesheet() {
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
          <span className="text-[0.78rem] font-bold tracking-wide text-primary">الورديّات</span>
          <button className="btn btn-ghost ms-auto !px-3 !py-1 !text-[0.82rem]" onClick={() => setRows((rs) => [...rs, blank()])}>
            + سطر
          </button>
        </div>
        <ul className="divide-y divide-line">
          {rows.map((row, i) => (
            <li key={row.id} className="flex flex-wrap items-end gap-2.5 px-4 py-3">
              <div className="min-w-28 flex-[2]">
                <label className="label" htmlFor={`ts-l-${row.id}`}>الوصف</label>
                <TextField id={`ts-l-${row.id}`} value={row.label} onChange={(v) => patch(row.id, { label: v })} placeholder={`يوم ${i + 1}`} />
              </div>
              <div className="min-w-24 flex-1">
                <label className="label" htmlFor={`ts-f-${row.id}`}>من</label>
                <input id={`ts-f-${row.id}`} type="time" dir="ltr" className="field font-mono"
                       value={row.from} onChange={(e) => patch(row.id, { from: e.target.value })} />
              </div>
              <div className="min-w-24 flex-1">
                <label className="label" htmlFor={`ts-t-${row.id}`}>إلى</label>
                <input id={`ts-t-${row.id}`} type="time" dir="ltr" className="field font-mono"
                       value={row.to} onChange={(e) => patch(row.id, { to: e.target.value })} />
              </div>
              <div className="min-w-20 flex-1">
                <label className="label" htmlFor={`ts-b-${row.id}`}>استراحة د</label>
                <NumberField id={`ts-b-${row.id}`} value={row.breakMin} onChange={(v) => patch(row.id, { breakMin: Number(v) || 0 })} min={0} />
              </div>
              <div className="min-w-16 shrink-0 pb-2 text-center">
                <div dir="ltr" className="font-mono tabular-nums">{money(hours[i], 2)}</div>
                <div className="text-[0.72rem] text-muted">ساعة</div>
              </div>
              <button
                className="btn btn-ghost !px-2.5 !py-1 text-danger"
                onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((x) => x.id !== row.id) : rs))}
                aria-label="حذف السطر"
              >
                حذف
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Field label="أجرُ الساعة" htmlFor="ts-rate" className="max-w-48">
        <NumberField id="ts-rate" value={rate} onChange={setRate} placeholder="50" />
      </Field>

      <Tiles
        items={[
          { label: "مجموعُ الساعات", value: money(total, 2), lit: true },
          { label: "بالساعات والدقائق", value: `${Math.floor(total)}:${String(Math.round((total % 1) * 60)).padStart(2, "0")}` },
          { label: "الأجرُ المستحقّ", value: r === null ? "—" : money(total * r) },
        ]}
      />
      <Note>الورديّةُ العابرةُ منتصفَ الليل (٢٢:٠٠ ← ٠٦:٠٠) تُحسب ثماني ساعاتٍ لا سالباً.</Note>
    </ToolLayout>
  );
}
