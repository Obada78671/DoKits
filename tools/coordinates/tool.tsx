"use client";

import { useMemo, useState } from "react";
import { ChipGroup, Field, NumberField, Note, ResultBox, ToolLayout } from "@/components/tool-kit";
import { formatDms, fromDms, num, round, toDms } from "@/tools/convert-lib";

type Dir = "toDms" | "toDecimal";

export default function Coordinates() {
  const [dir, setDir] = useState<Dir>("toDms");
  const [lat, setLat] = useState("21.4225");
  const [lng, setLng] = useState("39.8262");
  const [latD, setLatD] = useState("21"); const [latM, setLatM] = useState("25"); const [latS, setLatS] = useState("21");
  const [lngD, setLngD] = useState("39"); const [lngM, setLngM] = useState("49"); const [lngS, setLngS] = useState("34");
  const [latDir, setLatDir] = useState("N");
  const [lngDir, setLngDir] = useState("E");

  const out = useMemo(() => {
    if (dir === "toDms") {
      const a = num(lat), b = num(lng);
      if (a === null || b === null) return "";
      if (Math.abs(a) > 90 || Math.abs(b) > 180) return "";
      return `${formatDms(toDms(a, "lat"))}\n${formatDms(toDms(b, "lng"))}`;
    }
    const a = fromDms(num(latD) ?? 0, num(latM) ?? 0, num(latS) ?? 0, latDir);
    const b = fromDms(num(lngD) ?? 0, num(lngM) ?? 0, num(lngS) ?? 0, lngDir);
    return `${round(a, 6)}, ${round(b, 6)}`;
  }, [dir, lat, lng, latD, latM, latS, lngD, lngM, lngS, latDir, lngDir]);

  const invalid = dir === "toDms" && (Math.abs(num(lat) ?? 0) > 90 || Math.abs(num(lng) ?? 0) > 180);

  return (
    <ToolLayout>
      <ChipGroup
        label="الاتّجاه"
        value={dir}
        onChange={setDir}
        options={[
          { id: "toDms", label: "عشريّة ← درجة ودقيقة وثانية" },
          { id: "toDecimal", label: "درجة ودقيقة وثانية ← عشريّة" },
        ]}
      />

      {dir === "toDms" ? (
        <div className="flex flex-wrap gap-3">
          <Field label="خطُّ العرض" htmlFor="co-lat" className="min-w-40 flex-1" hint="من −90 إلى 90">
            <NumberField id="co-lat" value={lat} onChange={setLat} step="any" />
          </Field>
          <Field label="خطُّ الطول" htmlFor="co-lng" className="min-w-40 flex-1" hint="من −180 إلى 180">
            <NumberField id="co-lng" value={lng} onChange={setLng} step="any" />
          </Field>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {([
            ["العرض", latD, setLatD, latM, setLatM, latS, setLatS, latDir, setLatDir, ["N", "S"]],
            ["الطول", lngD, setLngD, lngM, setLngM, lngS, setLngS, lngDir, setLngDir, ["E", "W"]],
          ] as const).map(([label, d, sd, m, sm, s, ss, dr, sdr, opts]) => (
            <div key={label} className="flex flex-wrap items-end gap-2">
              <span className="w-14 pb-2 text-[0.85rem] text-muted">{label}</span>
              <Field label="درجة" className="min-w-20 flex-1"><NumberField value={d} onChange={sd} /></Field>
              <Field label="دقيقة" className="min-w-20 flex-1"><NumberField value={m} onChange={sm} /></Field>
              <Field label="ثانية" className="min-w-20 flex-1"><NumberField value={s} onChange={ss} step="any" /></Field>
              <Field label="الجهة" className="min-w-20 flex-1">
                <select className="field" value={dr} onChange={(e) => sdr(e.target.value)}>
                  {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
            </div>
          ))}
        </div>
      )}

      <ResultBox
        title="النتيجة"
        value={invalid ? "" : out}
        dir="ltr"
        mono
        hint={invalid ? "خطُّ العرض بين −٩٠ و٩٠، وخطُّ الطول بين −١٨٠ و١٨٠." : undefined}
      />

      <Note>
        السالبُ جنوباً وغرباً. والصيغةُ العشريّةُ هي ما تقبله الخرائطُ عادةً؛ والدرجاتُ
        والدقائقُ والثواني هي ما تجده في الوثائق المساحيّة.
      </Note>
    </ToolLayout>
  );
}
