"use client";

import { useMemo, useState } from "react";
import { Field, Note, ResultBox, ToolLayout } from "@/components/tool-kit";
import { TIMEZONES, convertZone, zoneOffsetMinutes } from "@/tools/convert-lib";
import { useLang, useStrings } from "@/components/lang";
import { TZ_EN } from "@/tools/names-en";

const now = () => new Date();
const pad = (n: number) => String(n).padStart(2, "0");

const S = {
  ar: {
    date: "التاريخ", time: "الساعة", inCity: "في مدينة", swap: "بدّل", toCity: "كم في مدينة",
    result: "النتيجة", diff: (h: number) => `الفرق: ${h > 0 ? "+" : ""}${h} ساعة`,
    sameMoment: "اللحظةُ نفسُها حول العالم",
    n1: "الإزاحاتُ يحسبها متصفّحك بجدول المناطق المدمج، فيراعي ", b: "التوقيتَ الصيفيّ", n2: " في تاريخ السؤال لا في تاريخ اليوم.",
  },
  en: {
    date: "Date", time: "Time", inCity: "In", swap: "Swap", toCity: "What time in",
    result: "Result", diff: (h: number) => `Difference: ${h > 0 ? "+" : ""}${h} h`,
    sameMoment: "The same moment around the world",
    n1: "Offsets are computed by your browser from its built-in timezone table, so ", b: "daylight saving", n2: " is applied for the date you ask about, not for today.",
  },
};

export default function Timezones() {
  const s = useStrings(S);
  const isEn = useLang() === "en";
  const city = (id: string, ar: string) => (isEn ? TZ_EN[id] ?? ar : ar);
  const [date, setDate] = useState(() => now().toISOString().slice(0, 10));
  const [time, setTime] = useState(() => `${pad(now().getHours())}:${pad(now().getMinutes())}`);
  const [from, setFrom] = useState("Asia/Damascus");
  const [to, setTo] = useState("Europe/London");

  const res = useMemo(() => convertZone(date, time, from, to), [date, time, from, to]);

  const world = useMemo(() => {
    if (!res) return [];
    return TIMEZONES.map((z) => ({
      name: city(z.id, z.name),
      text: new Intl.DateTimeFormat("en-GB", {
        timeZone: z.id, hour12: false, weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
      }).format(res.instant),
      offset: zoneOffsetMinutes(z.id, res.instant) / 60,
    })).sort((a, b) => a.offset - b.offset);
  }, [res]);

  const fz = TIMEZONES.find((z) => z.id === from);
  const fromName = fz ? city(fz.id, fz.name) : from;
  const tz2 = TIMEZONES.find((z) => z.id === to);
  const toName = tz2 ? city(tz2.id, tz2.name) : to;

  return (
    <ToolLayout>
      <div className="flex flex-wrap gap-3">
        <Field label={s.date} htmlFor="tz-d" className="min-w-36 flex-1">
          <input id="tz-d" type="date" dir="ltr" className="field font-mono" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label={s.time} htmlFor="tz-t" className="min-w-28 flex-1">
          <input id="tz-t" type="time" dir="ltr" className="field font-mono" value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <Field label={s.inCity} htmlFor="tz-f" className="min-w-40 flex-1">
          <select id="tz-f" className="field" value={from} onChange={(e) => setFrom(e.target.value)}>
            {TIMEZONES.map((z) => <option key={z.id} value={z.id}>{city(z.id, z.name)}</option>)}
          </select>
        </Field>
        <button className="btn btn-ghost" onClick={() => { setFrom(to); setTo(from); }} aria-label={s.swap}>⇄</button>
        <Field label={s.toCity} htmlFor="tz-to" className="min-w-40 flex-1">
          <select id="tz-to" className="field" value={to} onChange={(e) => setTo(e.target.value)}>
            {TIMEZONES.map((z) => <option key={z.id} value={z.id}>{city(z.id, z.name)}</option>)}
          </select>
        </Field>
      </div>

      <ResultBox
        title={s.result}
        value={res ? `${fromName} ${res.fromText}\n${toName} ${res.toText}` : ""}
        dir="ltr"
        mono
        hint={res ? s.diff(res.diffHours) : undefined}
      />

      {world.length > 0 && (
        <div className="rounded-m border border-line bg-surface">
          <div className="border-b border-line px-4 py-2.5">
            <span className="text-[0.78rem] font-bold tracking-wide text-primary">{s.sameMoment}</span>
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
        {s.n1}<b className="font-semibold text-ink">{s.b}</b>{s.n2}
      </Note>
    </ToolLayout>
  );
}
