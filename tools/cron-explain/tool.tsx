"use client";

import { useEffect, useMemo, useState } from "react";
import { ChipGroup, ErrorNote, Field, Note, TextField, ToolLayout } from "@/components/tool-kit";
import { nextRuns, parseCron } from "@/tools/dev-lib";

const PRESETS = [
  { id: "*/5 * * * *", label: "كلَّ ٥ دقائق" },
  { id: "0 * * * *", label: "كلَّ ساعة" },
  { id: "0 3 * * *", label: "يوميّاً ٣ فجراً" },
  { id: "0 9 * * 0", label: "أسبوعيّاً الأحد" },
  { id: "0 0 1 * *", label: "أوّلَ كلِّ شهر" },
  { id: "30 8 * * 1-5", label: "أيّامَ العمل" },
];

const FIELDS = ["دقيقة", "ساعة", "يومُ الشهر", "الشهر", "يومُ الأسبوع"];
const RANGES = ["0–59", "0–23", "1–31", "1–12", "0–7"];

const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ` +
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

const DAY_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export default function CronExplain() {
  const [expr, setExpr] = useState("30 8 * * 1-5");
  // «الآن» يُقرأ بعد التركيب — لا أثناء الرسم على الخادم
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const res = useMemo(() => parseCron(expr), [expr]);
  const runs = useMemo(() => (res.ok && now ? nextRuns(res.cron, now, 6) : []), [res, now]);
  const parts = expr.trim().split(/\s+/);

  return (
    <ToolLayout>
      <Field label="تعبيرُ cron" htmlFor="cr-in" hint="خمسةُ حقولٍ يفصلها فراغ. تُقبل @daily و@hourly وأخواتُها.">
        <TextField id="cr-in" value={expr} onChange={setExpr} dir="ltr" mono placeholder="30 8 * * 1-5" />
      </Field>

      <ChipGroup label="جاهزة" value={expr} onChange={setExpr} options={PRESETS} />

      {parts.length === 5 && (
        <div className="grid grid-cols-5 gap-2 text-center">
          {FIELDS.map((f, i) => (
            <div key={f} className="rounded-m border border-line bg-surface px-1 py-2">
              <div dir="ltr" className="font-mono text-lg">{parts[i]}</div>
              <div className="mt-0.5 text-[0.72rem] leading-tight text-muted">{f}</div>
              <div dir="ltr" className="text-[0.68rem] text-muted">{RANGES[i]}</div>
            </div>
          ))}
        </div>
      )}

      {!res.ok ? (
        <ErrorNote>{res.error}</ErrorNote>
      ) : (
        <div className="rounded-m border border-accent bg-accent-soft px-4 py-3.5">
          <p className="text-[0.78rem] font-bold tracking-wide text-primary">بالعربيّة</p>
          <p className="mt-1 text-[1.05rem] leading-relaxed text-ink">{res.text}</p>
        </div>
      )}

      {res.ok && (
        <div className="rounded-m border border-line bg-surface">
          <div className="border-b border-line px-4 py-2.5">
            <span className="text-[0.78rem] font-bold tracking-wide text-primary">المواعيدُ الستّةُ القادمة</span>
            <span className="ms-2 text-[0.78rem] text-muted">بتوقيت جهازك</span>
          </div>
          {!now ? (
            <p className="px-4 py-3 text-[0.9rem] text-muted">…</p>
          ) : runs.length === 0 ? (
            <p className="px-4 py-3 text-[0.9rem] text-muted">
              لا موعدَ خلال السنوات القادمة — التعبيرُ صالحٌ نحويّاً لكنّه لا يقع أبداً (كـ٣٠ شباط).
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {runs.map((d) => (
                <li key={d.getTime()} className="flex items-center gap-3 px-4 py-2">
                  <span className="text-muted">{DAY_AR[d.getDay()]}</span>
                  <span dir="ltr" className="ms-auto font-mono tabular-nums">{fmt(d)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Note>
        فخُّ cron الشهير: متى قُيّد <b className="font-semibold text-ink">يومُ الشهر ويومُ الأسبوع معاً</b> فالشرطان
        يُجمعان بـ«أو» لا بـ«و» — فـ<code dir="ltr" className="font-mono text-[0.85rem]">0 0 1 * 1</code> يعمل أوّلَ
        الشهر <b className="font-semibold text-ink">وكلَّ اثنين</b>. والمواعيدُ أعلاه محسوبةٌ بتوقيت جهازك،
        بينما خادمُك غالباً بتوقيت UTC.
      </Note>
    </ToolLayout>
  );
}
