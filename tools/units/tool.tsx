"use client";

import { useMemo, useState } from "react";
import { ChipGroup, Field, NumberField, Note, ResultBox, ToolLayout } from "@/components/tool-kit";
import { useStrings } from "@/components/lang";
import { TEMP_UNITS, UNIT_FAMILIES, convertTemp, convertUnit, fmt, num, type TempUnit } from "@/tools/convert-lib";

const TEMP = "temp";

/** أسماءُ العائلات والوحدات مصدرُها convert-lib بالعربيّة — والإنكليزيّةُ تُشتقّ من الرمز */
const S = {
  ar: {
    kind: "النوع", temp: "الحرارة", value: "القيمة", from: "من", to: "إلى",
    swap: "بدّل الاتّجاه", result: "النتيجة", all: "بكلّ الوحدات",
    note: "الحرارةُ ليست نسبيّةً كالطول، فلها مسارُ تحويلٍ خاصّ — لذلك تجدها نوعاً مستقلّاً.",
    families: {} as Record<string, string>,
  },
  en: {
    kind: "Type", temp: "Temperature", value: "Value", from: "From", to: "To",
    swap: "Swap direction", result: "Result", all: "In every unit",
    note: "Temperature is not proportional the way length is — its zero is not nothing — so it gets its own conversion path and its own type.",
    families: {
      length: "Length", mass: "Mass", volume: "Volume", area: "Area",
      speed: "Speed", time: "Time", data: "Data", pressure: "Pressure", energy: "Energy",
    } as Record<string, string>,
  },
};

const UNIT_EN: Record<string, string> = {
  mm: "millimetre", cm: "centimetre", m: "metre", km: "kilometre", in: "inch", ft: "foot",
  yd: "yard", mi: "mile", nmi: "nautical mile",
  mg: "milligram", g: "gram", kg: "kilogram", t: "tonne", oz: "ounce", lb: "pound", st: "stone",
  c: "Celsius", f: "Fahrenheit", k: "Kelvin",
};

export default function Units() {
  const s = useStrings(S);
  const [family, setFamily] = useState(UNIT_FAMILIES[0].id);
  const [from, setFrom] = useState(UNIT_FAMILIES[0].units[2].id);
  const [to, setTo] = useState(UNIT_FAMILIES[0].units[5].id);
  const [value, setValue] = useState("1");

  const fam = UNIT_FAMILIES.find((f) => f.id === family);
  const v = num(value);
  const label = (id: string, ar: string) => s.families[id] ?? UNIT_EN[id] ?? ar;

  const pickFamily = (id: string) => {
    setFamily(id);
    if (id === TEMP) { setFrom("c"); setTo("f"); return; }
    const f = UNIT_FAMILIES.find((x) => x.id === id)!;
    setFrom(f.units[0].id);
    setTo(f.units[Math.min(1, f.units.length - 1)].id);
  };

  const { out, table } = useMemo(() => {
    if (v === null) return { out: "", table: [] as { name: string; value: string }[] };
    if (family === TEMP) {
      const r = convertTemp(v, from as TempUnit, to as TempUnit);
      const fu = TEMP_UNITS.find((u) => u.id === from)!;
      const tu = TEMP_UNITS.find((u) => u.id === to)!;
      return {
        out: `${fmt(v, 4)} ${fu.symbol} = ${fmt(r, 4)} ${tu.symbol}`,
        table: TEMP_UNITS.map((u) => ({ name: label(u.id, u.name), value: `${fmt(convertTemp(v, from as TempUnit, u.id), 4)} ${u.symbol}` })),
      };
    }
    if (!fam) return { out: "", table: [] };
    const fu = fam.units.find((u) => u.id === from)!;
    const tu = fam.units.find((u) => u.id === to)!;
    const r = convertUnit(v, fu, tu);
    return {
      out: `${fmt(v)} ${fu.symbol} = ${fmt(r)} ${tu.symbol}`,
      table: fam.units.map((u) => ({ name: label(u.id, u.name), value: `${fmt(convertUnit(v, fu, u))} ${u.symbol}` })),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v, family, from, to, fam, s]);

  const units = family === TEMP
    ? TEMP_UNITS.map((u) => ({ id: u.id, name: `${label(u.id, u.name)} (${u.symbol})` }))
    : (fam?.units ?? []).map((u) => ({ id: u.id, name: `${label(u.id, u.name)} (${u.symbol})` }));

  return (
    <ToolLayout>
      <ChipGroup
        label={s.kind}
        value={family}
        onChange={pickFamily}
        options={[
          ...UNIT_FAMILIES.map((f) => ({ id: f.id, label: s.families[f.id] ?? f.name })),
          { id: TEMP, label: s.temp },
        ]}
      />
      <div className="flex flex-wrap items-end gap-3">
        <Field label={s.value} htmlFor="u-v" className="min-w-32 flex-1">
          <NumberField id="u-v" value={value} onChange={setValue} />
        </Field>
        <Field label={s.from} htmlFor="u-f" className="min-w-40 flex-1">
          <select id="u-f" className="field" value={from} onChange={(e) => setFrom(e.target.value)}>
            {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </Field>
        <button className="btn btn-ghost" onClick={() => { setFrom(to); setTo(from); }} aria-label={s.swap}>⇄</button>
        <Field label={s.to} htmlFor="u-t" className="min-w-40 flex-1">
          <select id="u-t" className="field" value={to} onChange={(e) => setTo(e.target.value)}>
            {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </Field>
      </div>

      <ResultBox title={s.result} value={out} dir="ltr" mono />

      {table.length > 0 && (
        <div className="rounded-m border border-line bg-surface">
          <div className="border-b border-line px-4 py-2.5">
            <span className="text-[0.78rem] font-bold tracking-wide text-primary">{s.all}</span>
          </div>
          <ul className="divide-y divide-line">
            {table.map((r) => (
              <li key={r.name} className="flex items-center gap-3 px-4 py-2">
                <span className="text-muted">{r.name}</span>
                <span dir="ltr" className="ms-auto font-mono tabular-nums">{r.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Note>{s.note}</Note>
    </ToolLayout>
  );
}
