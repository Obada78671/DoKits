"use client";

import { useMemo, useState } from "react";
import { ChipGroup, Field, NumberField, Note, ResultBox, ToolLayout } from "@/components/tool-kit";
import { TEMP_UNITS, UNIT_FAMILIES, convertTemp, convertUnit, fmt, num, type TempUnit } from "@/tools/convert-lib";

const TEMP = "temp";

export default function Units() {
  const [family, setFamily] = useState(UNIT_FAMILIES[0].id);
  const [from, setFrom] = useState(UNIT_FAMILIES[0].units[2].id);
  const [to, setTo] = useState(UNIT_FAMILIES[0].units[5].id);
  const [value, setValue] = useState("1");

  const fam = UNIT_FAMILIES.find((f) => f.id === family);
  const v = num(value);

  const pickFamily = (id: string) => {
    setFamily(id);
    if (id === TEMP) { setFrom("c"); setTo("f"); return; }
    const f = UNIT_FAMILIES.find((x) => x.id === id)!;
    setFrom(f.units[0].id);
    setTo(f.units[Math.min(1, f.units.length - 1)].id);
  };

  const { out, line, table } = useMemo(() => {
    if (v === null) return { out: "", line: "", table: [] as { name: string; value: string }[] };
    if (family === TEMP) {
      const r = convertTemp(v, from as TempUnit, to as TempUnit);
      const fu = TEMP_UNITS.find((u) => u.id === from)!;
      const tu = TEMP_UNITS.find((u) => u.id === to)!;
      return {
        out: `${fmt(v, 4)} ${fu.symbol} = ${fmt(r, 4)} ${tu.symbol}`,
        line: fmt(r, 4),
        table: TEMP_UNITS.map((u) => ({ name: u.name, value: `${fmt(convertTemp(v, from as TempUnit, u.id), 4)} ${u.symbol}` })),
      };
    }
    if (!fam) return { out: "", line: "", table: [] };
    const fu = fam.units.find((u) => u.id === from)!;
    const tu = fam.units.find((u) => u.id === to)!;
    const r = convertUnit(v, fu, tu);
    return {
      out: `${fmt(v)} ${fu.symbol} = ${fmt(r)} ${tu.symbol}`,
      line: fmt(r),
      table: fam.units.map((u) => ({ name: u.name, value: `${fmt(convertUnit(v, fu, u))} ${u.symbol}` })),
    };
  }, [v, family, from, to, fam]);

  const units = family === TEMP
    ? TEMP_UNITS.map((u) => ({ id: u.id, name: `${u.name} (${u.symbol})` }))
    : (fam?.units ?? []).map((u) => ({ id: u.id, name: `${u.name} (${u.symbol})` }));

  return (
    <ToolLayout>
      <ChipGroup
        label="النوع"
        value={family}
        onChange={pickFamily}
        options={[...UNIT_FAMILIES.map((f) => ({ id: f.id, label: f.name })), { id: TEMP, label: "الحرارة" }]}
      />
      <div className="flex flex-wrap items-end gap-3">
        <Field label="القيمة" htmlFor="u-v" className="min-w-32 flex-1">
          <NumberField id="u-v" value={value} onChange={setValue} />
        </Field>
        <Field label="من" htmlFor="u-f" className="min-w-40 flex-1">
          <select id="u-f" className="field" value={from} onChange={(e) => setFrom(e.target.value)}>
            {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </Field>
        <button className="btn btn-ghost" onClick={() => { setFrom(to); setTo(from); }} aria-label="بدّل الاتّجاه">⇄</button>
        <Field label="إلى" htmlFor="u-t" className="min-w-40 flex-1">
          <select id="u-t" className="field" value={to} onChange={(e) => setTo(e.target.value)}>
            {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </Field>
      </div>

      <ResultBox title="النتيجة" value={out} dir="ltr" mono />

      {table.length > 0 && (
        <div className="rounded-m border border-line bg-surface">
          <div className="border-b border-line px-4 py-2.5">
            <span className="text-[0.78rem] font-bold tracking-wide text-primary">بكلّ الوحدات</span>
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

      <Note>
        الحرارةُ ليست نسبيّةً كالطول، فلها مسارُ تحويلٍ خاصّ — لذلك تجدها نوعاً مستقلّاً.
      </Note>
    </ToolLayout>
  );
}
