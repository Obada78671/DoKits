"use client";

import { useMemo, useState } from "react";
import { ChipGroup, Field, NumberField, Note, ToolLayout } from "@/components/tool-kit";
import { zoneOffsetMinutes } from "@/tools/convert-lib";
import {
  CITIES, METHODS, PRAYER_NAMES, formatTime, prayerTimes,
  type AsrSchool, type Method,
} from "@/tools/prayer-times/calc";

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function PrayerTimes() {
  const [cityId, setCityId] = useState("mecca");
  const [custom, setCustom] = useState(false);
  const [lat, setLat] = useState("21.4225");
  const [lng, setLng] = useState("39.8262");
  const [date, setDate] = useState(todayIso);
  const [method, setMethod] = useState<Method>("makkah");
  const [asr, setAsr] = useState<AsrSchool>("standard");

  const city = CITIES.find((c) => c.id === cityId)!;

  const res = useMemo(() => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (!m) return null;
    const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
    const la = custom ? Number(lat) : city.lat;
    const ln = custom ? Number(lng) : city.lng;
    if (!Number.isFinite(la) || !Number.isFinite(ln) || Math.abs(la) > 90 || Math.abs(ln) > 180) return null;
    // إزاحةُ المدينة في ذلك اليوم — تُراعي التوقيتَ الصيفيّ
    const tzHours = custom
      ? -new Date().getTimezoneOffset() / 60
      : zoneOffsetMinutes(city.tz, new Date(d.getTime() + 12 * 3600_000)) / 60;
    return { times: prayerTimes({ date: d, lat: la, lng: ln, tzHours, method, asr }), tzHours };
  }, [date, custom, lat, lng, city, method, asr]);

  const asText = res
    ? PRAYER_NAMES.map((p) => `${p.name}\t${formatTime(res.times[p.key])}`).join("\n")
    : "";

  return (
    <ToolLayout>
      <ChipGroup
        label="الموقع"
        value={custom ? "custom" : cityId}
        onChange={(id) => { if (id === "custom") setCustom(true); else { setCustom(false); setCityId(id); } }}
        options={[...CITIES.map((c) => ({ id: c.id, label: c.name })), { id: "custom", label: "إحداثيّاتٌ أُدخلها" }]}
      />

      {custom && (
        <div className="flex flex-wrap gap-3">
          <Field label="خطُّ العرض" htmlFor="pt-lat" className="min-w-36 flex-1">
            <NumberField id="pt-lat" value={lat} onChange={setLat} step="any" />
          </Field>
          <Field label="خطُّ الطول" htmlFor="pt-lng" className="min-w-36 flex-1">
            <NumberField id="pt-lng" value={lng} onChange={setLng} step="any" />
          </Field>
          <Note className="w-full">
            بالإحداثيّات المُدخلة تُستعمل منطقةُ جهازك الزمنيّة. ولا يُطلب موقعُك ولا يُرسَل شيء.
          </Note>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Field label="التاريخ" htmlFor="pt-d" className="min-w-40 flex-1">
          <input id="pt-d" type="date" dir="ltr" className="field font-mono" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="مذهبُ العصر" htmlFor="pt-a" className="min-w-40 flex-1">
          <select id="pt-a" className="field" value={asr} onChange={(e) => setAsr(e.target.value as AsrSchool)}>
            <option value="standard">الجمهور (ظلُّ المثل)</option>
            <option value="hanafi">الحنفيّ (ظلُّ المثلين)</option>
          </select>
        </Field>
      </div>

      <ChipGroup
        label="طريقةُ الحساب"
        value={method}
        onChange={setMethod}
        hint={METHODS.find((m) => m.id === method)?.note}
        options={METHODS.map((m) => ({ id: m.id, label: m.name, title: m.note }))}
      />

      <div className="rounded-m border border-line bg-surface">
        <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
          <span className="text-[0.78rem] font-bold tracking-wide text-primary">
            {custom ? "الموقع المُدخل" : city.name} — {date}
          </span>
        </div>
        <ul className="divide-y divide-line">
          {PRAYER_NAMES.map((p) => (
            <li key={p.key} className={`flex items-center gap-3 px-4 py-3 ${p.key === "sunrise" ? "text-muted" : ""}`}>
              <span className={p.key === "sunrise" ? "" : "font-bold text-ink"}>{p.name}</span>
              <span dir="ltr" className="ms-auto font-mono text-xl tabular-nums">
                {res ? formatTime(res.times[p.key]) : "—"}
              </span>
            </li>
          ))}
          <li className="flex items-center gap-3 px-4 py-2.5 text-[0.88rem] text-muted">
            <span>منتصفُ الليل الشرعيّ</span>
            <span dir="ltr" className="ms-auto font-mono tabular-nums">{res ? formatTime(res.times.midnight) : "—"}</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="btn btn-ghost" onClick={() => setDate(todayIso())}>اليوم</button>
        <button className="btn btn-ghost" onClick={() => navigator.clipboard?.writeText(asText).catch(() => {})}>
          نسخ الجدول
        </button>
      </div>

      <Note>
        <b className="font-semibold text-ink">حسابٌ فلكيٌّ يجري في متصفّحك</b> — لا يُطلب موقعُك ولا
        يُرسَل شيءٌ إلى خادم. والتقاويمُ الرسميّةُ في بلدك قد تفارقه دقائقَ لاختلاف الطريقة
        أو التقريب أو الاحتياط؛ <b className="font-semibold text-ink">اعتمد إعلانَ بلدك</b> واستعمل هذا للتقدير والتخطيط.
      </Note>
    </ToolLayout>
  );
}
