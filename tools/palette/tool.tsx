"use client";

import { useMemo, useState } from "react";
import { ChipGroup, ErrorNote, Note, ResultBox, ToolLayout } from "@/components/tool-kit";
import { HARMONIES, harmony, parseColor, scale, toHex, type HarmonyId } from "@/tools/color-lib";
import { ColorField, Swatch } from "@/tools/color-ui";

export default function Palette() {
  const [input, setInput] = useState("#3366cc");
  const [kind, setKind] = useState<HarmonyId>("analogous");
  const [name, setName] = useState("brand");

  const base = useMemo(() => parseColor(input), [input]);
  const colors = useMemo(() => (base ? harmony(base, kind) : []), [base, kind]);
  const steps = useMemo(() => (base ? scale(base) : []), [base]);

  const slug = name.trim().replace(/\s+/g, "-") || "brand";
  const css = [
    ":root {",
    ...steps.map((s) => `  --${slug}-${s.step}: ${toHex(s.color)};`),
    "}",
  ].join("\n");
  const harmonyCss = colors.map((c, i) => `--${slug}-${i + 1}: ${toHex(c)};`).join("\n");

  return (
    <ToolLayout>
      <div className="flex flex-wrap gap-3">
        <ColorField id="pl-in" label="اللون الأساس" value={input} onChange={setInput} />
      </div>

      {input.trim() && !base && <ErrorNote>لم أفهم هذا لوناً. جرّب ‎#3366cc‎.</ErrorNote>}

      <ChipGroup
        label="التناسق"
        value={kind}
        onChange={setKind}
        hint={HARMONIES.find((h) => h.id === kind)?.note}
        options={HARMONIES.map((h) => ({ id: h.id, label: h.name, title: h.note }))}
      />

      {colors.length > 0 && (
        <>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${colors.length}, minmax(0, 1fr))` }}>
            {colors.map((c, i) => <Swatch key={`${toHex(c)}-${i}`} color={c} tall />)}
          </div>

          <ResultBox title="متغيّراتُ التناسق" value={harmonyCss} dir="ltr" mono />
        </>
      )}

      {steps.length > 0 && (
        <>
          <div>
            <p className="mb-2 text-[0.78rem] font-bold tracking-wide text-primary">سُلَّمٌ كامل</p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-11">
              {steps.map((s) => <Swatch key={s.step} color={s.color} label={String(s.step)} />)}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="label" htmlFor="pl-name">اسمُ المتغيّر</label>
            <input
              id="pl-name"
              dir="ltr"
              className="field max-w-48 font-mono"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="brand"
            />
          </div>

          <ResultBox title="متغيّرات CSS" value={css} dir="ltr" mono />
        </>
      )}

      <Note>
        اللوحةُ تُبنى في <b className="font-semibold text-ink">OKLCH</b> لا HSL: خطواتُ السُّلَّم متساويةٌ
        في العين، فلا تجد قفزةً بين ٤٠٠ و٥٠٠ ثمّ سكوناً بين ٧٠٠ و٨٠٠ كما يحدث في السلالم المولَّدة
        حسابيّاً. وما خرج من الألوان عن مدى الشاشة يُردّ إليه <b className="font-semibold text-ink">بخفض
        التشبّع لا بقصّ القنوات</b> — فتبقى الصبغةُ صحيحةً ويبقى المتتامُّ متتامّاً حقّاً.
      </Note>
    </ToolLayout>
  );
}
