"use client";

import { useMemo, useState } from "react";
import { Field, Note, ResultBox, ToolLayout } from "@/components/tool-kit";
import { TIMEZONES, convertZone, zoneOffsetMinutes } from "@/tools/convert-lib";

const now = () => new Date();
const pad = (n: number) => String(n).padStart(2, "0");

export default function Timezones() {
  const [date, setDate] = useState(() => now().toISOString().slice(0, 10));
  const [time, setTime] = useState(() => `${pad(now().getHours())}:${pad(now().getMinutes())}`);
  const [from, setFrom] = useState("Asia/Damascus");
  const [to, setTo] = useState("Europe/London");

  const res = useMemo(() => convertZone(date, time, from, to), [date, time, from, to]);

  const world = useMemo(() => {
    if (!res) return [];
    return TIMEZONES.map((z) => ({
      name: z.name,
      text: new Intl.DateTimeFormat("en-GB", {
        timeZone: z.id, hour12: false, weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
      }).format(res.instant),
      offset: zoneOffsetMinutes(z.id, res.instant) / 60,
    })).sort((a, b) => a.offset - b.offset);
  }, [res]);

  const fromName = TIMEZONES.find((z) => z.id === from)?.name ?? from;
  const toName = TIMEZONES.find((z) => z.id === to)?.name ?? to;

  return (
    <ToolLayout>
      <div className="flex flex-wrap gap-3">
        <Field label="التاريخ" htmlFor="tz-d" className="min-w-36 flex-1">
          <input id="tz-d" type="date" dir="ltr" className="field font-mono" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="الساعة" htmlFor="tz-t" className="min-w-28 flex-1">
          <input id="tz-t" type="time" dir="ltr" className="field font-mono" value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <Field label="في مدينة" htmlFor="tz-f" className="min-w-40 flex-1">
          <select id="tz-f" className="field" value={from} onChange={(e) => setFrom(e.target.value)}>
            {TIMEZONES.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
          </select>
        </Field>
        <button className="btn btn-ghost" onClick={() => { setFrom(to); setTo(from); }} aria-label="بدّل">⇄</button>
        <Field label="كم في مدينة" htmlFor="tz-to" className="min-w-40 flex-1">
          <select id="tz-to" className="field" value={to} onChange={(e) => setTo(e.target.value)}>
            {TIMEZONES.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
          </select>
        </Field>
      </div>

      <ResultBox
        title="النتيجة"
        value={res ? `${fromName} ${res.fromText}\n${toName} ${res.toText}` : ""}
        dir="ltr"
        mono
        hint={res ? `الفرق: ${res.diffHours > 0 ? "+" : ""}${res.diffHours} ساعة` : undefined}
      />

      {world.length > 0 && (
        <div className="rounded-m border border-line bg-surface">
          <div className="border-b border-line px-4 py-2.5">
            <span className="text-[0.78rem] font-bold tracking-wide text-primary">اللحظةُ نفسُها حول العالم</span>
          </div>
          <ul className="max-h-72 divide-y divide-line overflow-y-auto">
            {world.map((z) => (
              <li key={z.name} className="flex items-center gap-3 px-4 py-1.5">
                <span className={z.name === fromName || z.name === toName ? "font-bold text-ink" : "text-muted"}>{z.name}</span>
                <span dir="ltr" className="ms-auto font-mono text-[0.88rem] tabular-nums">{z.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Note>
        الإزاحاتُ يحسبها متصفّحك بجدول المناطق المدمج، فيراعي <b className="font-semibold text-ink">التوقيتَ الصيفيّ</b>
        في تاريخ السؤال لا في تاريخ اليوم.
      </Note>
    </ToolLayout>
  );
}
