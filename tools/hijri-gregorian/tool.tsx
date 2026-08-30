"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CALENDARS, GREG_MAX_YEAR, GREG_MIN_YEAR, GREG_MONTHS_ALT, GREG_MONTHS_AR,
  HIJRI_MAX_YEAR, HIJRI_MIN_YEAR, HIJRI_MONTHS, formatGregorian, formatHijri,
  gregorianMonthLength, hijriMonthLength, toGregorian, toHijri, todayUtc,
  type HijriCalendar,
} from "@/tools/hijri-gregorian/convert";

type Direction = "g2h" | "h2g";

export default function HijriGregorian() {
  const [dir, setDir] = useState<Direction>("g2h");
  const [cal, setCal] = useState<HijriCalendar>("islamic-umalqura");
  const [d, setD] = useState(1);
  const [m, setM] = useState(1);
  const [y, setY] = useState(2026);
  const [copied, setCopied] = useState(false);

  const fromHijri = dir === "h2g";

  // اليومَ في التقويم المطلوب — يُملأ عند الفتح
  useEffect(() => {
    const t = todayUtc();
    setD(t.getUTCDate());
    setM(t.getUTCMonth() + 1);
    setY(t.getUTCFullYear());
  }, []);

  const months = fromHijri
    ? HIJRI_MONTHS
    : GREG_MONTHS_AR.map((n, i) => `${n} · ${GREG_MONTHS_ALT[i]}`);

  const minYear = fromHijri ? HIJRI_MIN_YEAR : GREG_MIN_YEAR;
  const maxYear = fromHijri ? HIJRI_MAX_YEAR : GREG_MAX_YEAR;
  const yearOk = y >= minYear && y <= maxYear;

  const maxDay = useMemo(() => {
    if (!yearOk) return 30;
    return fromHijri ? hijriMonthLength(y, m, cal) : gregorianMonthLength(y, m);
  }, [fromHijri, y, m, cal, yearOk]);

  // اليومُ ٣٠ في شهرٍ من ٢٩ يُقصَر بدل أن يبقى خطأً معلّقاً
  useEffect(() => {
    if (d > maxDay) setD(maxDay);
  }, [d, maxDay]);

  /** يبدّل الاتجاه ويحوّل المُدخل معه، فلا يضيع ما كتبه المستخدم */
  const flip = () => {
    if (fromHijri) {
      const g = toGregorian({ y, m, d }, cal);
      if (g) {
        setY(g.getUTCFullYear());
        setM(g.getUTCMonth() + 1);
        setD(g.getUTCDate());
      }
    } else if (yearOk) {
      const h = toHijri(new Date(Date.UTC(y, m - 1, d)), cal);
      setY(h.y);
      setM(h.m);
      setD(h.d);
    }
    setDir(fromHijri ? "g2h" : "h2g");
  };

  const today = () => {
    const t = todayUtc();
    if (fromHijri) {
      const h = toHijri(t, cal);
      setY(h.y); setM(h.m); setD(h.d);
    } else {
      setY(t.getUTCFullYear()); setM(t.getUTCMonth() + 1); setD(t.getUTCDate());
    }
  };

  const result = useMemo(() => {
    if (!yearOk) {
      return { error: `السنةُ خارج المدى المدعوم — من ${minYear} إلى ${maxYear}.` };
    }
    if (fromHijri) {
      const g = toGregorian({ y, m, d }, cal);
      if (!g) return { error: "هذا التاريخ غير موجودٍ في التقويم — الشهرُ ٢٩ يوماً." };
      return { out: formatGregorian(g), label: "الموافق ميلاديّاً" };
    }
    const date = new Date(Date.UTC(y, m - 1, d));
    const h = toHijri(date, cal);
    return { out: formatHijri(h, date), label: "الموافق هجريّاً" };
  }, [fromHijri, y, m, d, cal, yearOk, minYear, maxYear]);

  const copy = async () => {
    if (!("out" in result) || !result.out) return;
    try {
      await navigator.clipboard.writeText(`${result.out.prose} (${result.out.numeric})`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* الحافظة قد تُمنع — لا شيء يُكسر */ }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <span className="label">التحويل</span>
        <div className="flex flex-wrap gap-2" role="group" aria-label="اتّجاه التحويل">
          <button className={`chip ${!fromHijri ? "chip-active" : ""}`} onClick={() => !fromHijri || flip()}>
            من ميلاديّ إلى هجريّ
          </button>
          <button className={`chip ${fromHijri ? "chip-active" : ""}`} onClick={() => fromHijri || flip()}>
            من هجريّ إلى ميلاديّ
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-24 flex-1">
          <label className="label" htmlFor="hg-day">اليوم</label>
          <select id="hg-day" className="field" value={d} onChange={(e) => setD(Number(e.target.value))}>
            {Array.from({ length: maxDay }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div className="min-w-44 flex-[2]">
          <label className="label" htmlFor="hg-month">الشهر</label>
          <select id="hg-month" className="field" value={m} onChange={(e) => setM(Number(e.target.value))}>
            {months.map((name, i) => (
              <option key={name} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>
        <div className="min-w-28 flex-1">
          <label className="label" htmlFor="hg-year">السنة {fromHijri ? "هـ" : "م"}</label>
          <input
            id="hg-year" type="number" inputMode="numeric" dir="ltr"
            className="field font-mono tabular-nums"
            value={y} min={minYear} max={maxYear}
            onChange={(e) => setY(Number(e.target.value))}
          />
        </div>
        <button className="btn btn-ghost" onClick={today}>اليوم</button>
      </div>

      <div>
        <span className="label">التقويم الهجريّ</span>
        <div className="flex flex-wrap gap-2" role="group" aria-label="اختيار التقويم الهجريّ">
          {CALENDARS.map((c) => (
            <button
              key={c.id}
              className={`chip ${cal === c.id ? "chip-active" : ""}`}
              onClick={() => setCal(c.id)}
              title={c.noteAr}
            >
              {c.nameAr}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[0.82rem] text-muted">
          {CALENDARS.find((c) => c.id === cal)?.noteAr}
        </p>
      </div>

      {"error" in result && result.error ? (
        <p role="alert" className="form-error">{result.error}</p>
      ) : "out" in result && result.out ? (
        <div className="rounded-m border border-line bg-surface p-4">
          <div className="mb-2 flex items-center gap-3">
            <span className="text-[0.78rem] font-bold tracking-wide text-primary">{result.label}</span>
            <button className="btn btn-ghost ms-auto !px-3 !py-1 !text-[0.82rem]" onClick={copy}>
              {copied ? "نُسخ ✓" : "نسخ"}
            </button>
          </div>
          <p className="text-xl leading-loose text-ink">{result.out.prose}</p>
          <p dir="ltr" className="mt-1 font-mono text-[0.9rem] tabular-nums text-muted">
            {result.out.numeric} · {result.out.en}
          </p>
        </div>
      ) : null}

      <p className="text-[0.84rem] leading-relaxed text-muted">
        التقويمُ الهجريُّ هنا <b className="font-semibold text-ink">حسابيٌّ لا رَصْديّ</b> — وقد يفارق
        رؤيةَ الهلال المحلّيّة يوماً. للمعاملات الرسميّة اعتمد ما يعلنه بلدُك.
      </p>
    </div>
  );
}
