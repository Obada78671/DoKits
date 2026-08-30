"use client";

import { useEffect, useMemo, useState } from "react";
import { ChipGroup, ErrorNote, Field, Note, TextField, ToolLayout } from "@/components/tool-kit";
import { describeCronEn, nextRuns, parseCron } from "@/tools/dev-lib";
import { useLang, useStrings } from "@/components/lang";

const S = {
  ar: {
    expr: "تعبيرُ cron", hint: "خمسةُ حقولٍ يفصلها فراغ. تُقبل @daily و@hourly وأخواتُها.",
    ready: "جاهزة",
    presets: ["كلَّ ٥ دقائق", "كلَّ ساعة", "يوميّاً ٣ فجراً", "أسبوعيّاً الأحد", "أوّلَ كلِّ شهر", "أيّامَ العمل"],
    fields: ["دقيقة", "ساعة", "يومُ الشهر", "الشهر", "يومُ الأسبوع"],
    inWords: "بالعربيّة", next: "المواعيدُ الستّةُ القادمة", tz: "بتوقيت جهازك",
    never: "لا موعدَ خلال السنوات القادمة — التعبيرُ صالحٌ نحويّاً لكنّه لا يقع أبداً (كـ٣٠ شباط).",
    days: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
    err: {
      empty: "اكتب تعبيرَ cron.",
      seconds: "ستّةُ حقول: هذا نمطُ الثواني (Quartz/Spring) — أزل حقلَ الثواني الأوّل.",
      fields: (n: number) => `يُتوقَّع خمسةُ حقول (دقيقة ساعة يوم شهر يوم-أسبوع) — وجدتُ ${n}.`,
      field: (f: string) => `حقلُ ${f} غيرُ صالح.`,
    },
    n1: "فخُّ cron الشهير: متى قُيّد ", b1: "يومُ الشهر ويومُ الأسبوع معاً", n2: " فالشرطان يُجمعان بـ«أو» لا بـ«و» — فـ",
    n3: " يعمل أوّلَ الشهر ", b2: "وكلَّ اثنين", n4: ". والمواعيدُ أعلاه محسوبةٌ بتوقيت جهازك، بينما خادمُك غالباً بتوقيت UTC.",
  },
  en: {
    expr: "cron expression", hint: "Five space-separated fields. @daily, @hourly and friends are accepted.",
    ready: "Presets",
    presets: ["Every 5 minutes", "Hourly", "Daily at 3am", "Weekly on Sunday", "First of the month", "Weekdays"],
    fields: ["Minute", "Hour", "Day of month", "Month", "Day of week"],
    inWords: "In plain English", next: "The next six runs", tz: "in your device's timezone",
    never: "No run in the coming years — the expression is syntactically valid but never occurs (like 30 February).",
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    err: {
      empty: "Type a cron expression.",
      seconds: "Six fields: that is the Quartz/Spring seconds form — drop the leading seconds field.",
      fields: (n: number) => `Five fields expected (minute hour day month weekday) — found ${n}.`,
      field: (f: string) => `The ${f} field is not valid.`,
    },
    n1: "The classic cron trap: when ", b1: "day-of-month and day-of-week are both restricted", n2: ", the two are joined with OR, not AND — so ",
    n3: " runs on the first of the month ", b2: "and every Monday", n4: ". And the runs above use your device's clock, while your server is most likely on UTC.",
  },
};

const PRESETS = [
  { id: "*/5 * * * *", label: "كلَّ ٥ دقائق" },
  { id: "0 * * * *", label: "كلَّ ساعة" },
  { id: "0 3 * * *", label: "يوميّاً ٣ فجراً" },
  { id: "0 9 * * 0", label: "أسبوعيّاً الأحد" },
  { id: "0 0 1 * *", label: "أوّلَ كلِّ شهر" },
  { id: "30 8 * * 1-5", label: "أيّامَ العمل" },
];

const FIELD_EN = { minute: "minute", hour: "hour", dom: "day", month: "month", dow: "weekday" } as const;
const AR_FIELD: Record<string, keyof typeof FIELD_EN> = {
  "الدقيقة": "minute", "الساعة": "hour", "اليوم": "dom", "الشهر": "month", "يوم الأسبوع": "dow",
};
const RANGES = ["0–59", "0–23", "1–31", "1–12", "0–7"];

const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ` +
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;


export default function CronExplain() {
  const s = useStrings(S);
  const isEn = useLang() === "en";
  const [expr, setExpr] = useState("30 8 * * 1-5");
  // «الآن» يُقرأ بعد التركيب — لا أثناء الرسم على الخادم
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const res = useMemo(() => parseCron(expr), [expr]);
  const runs = useMemo(() => (res.ok && now ? nextRuns(res.cron, now, 6) : []), [res, now]);
  const parts = expr.trim().split(/\s+/);

  return (
    <ToolLayout>
      <Field label={s.expr} htmlFor="cr-in" hint={s.hint}>
        <TextField id="cr-in" value={expr} onChange={setExpr} dir="ltr" mono placeholder="30 8 * * 1-5" />
      </Field>

      <ChipGroup label={s.ready} value={expr} onChange={setExpr} options={PRESETS.map((p, i) => ({ id: p.id, label: s.presets[i] }))} />

      {parts.length === 5 && (
        <div className="grid grid-cols-5 gap-2 text-center">
          {s.fields.map((f, i) => (
            <div key={f} className="rounded-m border border-line bg-surface px-1 py-2">
              <div dir="ltr" className="font-mono text-lg">{parts[i]}</div>
              <div className="mt-0.5 text-[0.72rem] leading-tight text-muted">{f}</div>
              <div dir="ltr" className="text-[0.68rem] text-muted">{RANGES[i]}</div>
            </div>
          ))}
        </div>
      )}

      {!res.ok ? (
        <ErrorNote>
          {res.code === "fields"
            ? s.err.fields(res.count ?? 0)
            : res.code === "field"
              ? s.err.field(isEn ? FIELD_EN[AR_FIELD[res.field ?? ""] ?? "minute"] : res.field ?? "")
              : s.err[res.code]}
        </ErrorNote>
      ) : (
        <div className="rounded-m border border-accent bg-accent-soft px-4 py-3.5">
          <p className="text-[0.78rem] font-bold tracking-wide text-primary">{s.inWords}</p>
          <p className="mt-1 text-[1.05rem] leading-relaxed text-ink">{isEn ? describeCronEn(res.cron) : res.text}</p>
        </div>
      )}

      {res.ok && (
        <div className="rounded-m border border-line bg-surface">
          <div className="border-b border-line px-4 py-2.5">
            <span className="text-[0.78rem] font-bold tracking-wide text-primary">{s.next}</span>
            <span className="ms-2 text-[0.78rem] text-muted">{s.tz}</span>
          </div>
          {!now ? (
            <p className="px-4 py-3 text-[0.9rem] text-muted">…</p>
          ) : runs.length === 0 ? (
            <p className="px-4 py-3 text-[0.9rem] text-muted">
              {s.never}
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {runs.map((d) => (
                <li key={d.getTime()} className="flex items-center gap-3 px-4 py-2">
                  <span className="text-muted">{s.days[d.getDay()]}</span>
                  <span dir="ltr" className="ms-auto font-mono tabular-nums">{fmt(d)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Note>
        {s.n1}<b className="font-semibold text-ink">{s.b1}</b>{s.n2}
        <code dir="ltr" className="font-mono text-[0.85rem]">0 0 1 * 1</code>{s.n3}
        <b className="font-semibold text-ink">{s.b2}</b>{s.n4}
      </Note>
    </ToolLayout>
  );
}
