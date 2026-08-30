"use client";

import { useMemo, useState } from "react";
import { useStrings } from "@/components/lang";
import { ChipGroup, Field, NumberField, Note, ResultBox, ToolLayout } from "@/components/tool-kit";
import { formatDms, fromDms, num, round, toDms } from "@/tools/convert-lib";

type Dir = "toDms" | "toDecimal";

const S = {
  ar: {
    dir: "الاتّجاه", toDms: "عشريّة ← درجة ودقيقة وثانية", toDec: "درجة ودقيقة وثانية ← عشريّة",
    lat: "خطُّ العرض", lng: "خطُّ الطول", latHint: "من −90 إلى 90", lngHint: "من −180 إلى 180",
    latShort: "العرض", lngShort: "الطول",
    deg: "درجة", min: "دقيقة", sec: "ثانية", side: "الجهة",
    result: "النتيجة", invalid: "خطُّ العرض بين −٩٠ و٩٠، وخطُّ الطول بين −١٨٠ و١٨٠.",
    note: "السالبُ جنوباً وغرباً. والصيغةُ العشريّةُ هي ما تقبله الخرائطُ عادةً؛ والدرجاتُ والدقائقُ والثواني هي ما تجده في الوثائق المساحيّة.",
  },
  en: {
    dir: "Direction", toDms: "Decimal → degrees, minutes, seconds", toDec: "Degrees, minutes, seconds → decimal",
    lat: "Latitude", lng: "Longitude", latHint: "−90 to 90", lngHint: "−180 to 180",
    latShort: "Lat", lngShort: "Lng",
    deg: "Degrees", min: "Minutes", sec: "Seconds", side: "Hemisphere",
    result: "Result", invalid: "Latitude must be between −90 and 90, longitude between −180 and 180.",
    note: "Negative means south and west. Decimal is what mapping tools normally accept; degrees-minutes-seconds is what you find in survey documents.",
  },
};

export default function Coordinates() {
  const L = useStrings(S);
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
        label={L.dir}
        value={dir}
        onChange={setDir}
        options={[
          { id: "toDms", label: L.toDms },
          { id: "toDecimal", label: L.toDec },
        ]}
      />

      {dir === "toDms" ? (
        <div className="flex flex-wrap gap-3">
          <Field label={L.lat} htmlFor="co-lat" className="min-w-40 flex-1" hint={L.latHint}>
            <NumberField id="co-lat" value={lat} onChange={setLat} step="any" />
          </Field>
          <Field label={L.lng} htmlFor="co-lng" className="min-w-40 flex-1" hint={L.lngHint}>
            <NumberField id="co-lng" value={lng} onChange={setLng} step="any" />
          </Field>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {([
            [L.latShort, latD, setLatD, latM, setLatM, latS, setLatS, latDir, setLatDir, ["N", "S"]],
            [L.lngShort, lngD, setLngD, lngM, setLngM, lngS, setLngS, lngDir, setLngDir, ["E", "W"]],
          ] as const).map(([label, d, sd, m, sm, s, ss, dr, sdr, opts]) => (
            <div key={label} className="flex flex-wrap items-end gap-2">
              <span className="w-14 pb-2 text-[0.85rem] text-muted">{label}</span>
              <Field label={L.deg} className="min-w-20 flex-1"><NumberField value={d} onChange={sd} /></Field>
              <Field label={L.min} className="min-w-20 flex-1"><NumberField value={m} onChange={sm} /></Field>
              <Field label={L.sec} className="min-w-20 flex-1"><NumberField value={s} onChange={ss} step="any" /></Field>
              <Field label={L.side} className="min-w-20 flex-1">
                <select className="field" value={dr} onChange={(e) => sdr(e.target.value)}>
                  {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
            </div>
          ))}
        </div>
      )}

      <ResultBox
        title={L.result}
        value={invalid ? "" : out}
        dir="ltr"
        mono
        hint={invalid ? L.invalid : undefined}
      />

      <Note>
        {L.note}
      </Note>
    </ToolLayout>
  );
}
