"use client";

import { useMemo, useState } from "react";
import { ChipGroup, ErrorNote, Note, ResultBox, ToolLayout } from "@/components/tool-kit";
import { HARMONIES, harmony, parseColor, scale, toHex, type HarmonyId } from "@/tools/color-lib";
import { ColorField, Swatch } from "@/tools/color-ui";
import { useLang, useStrings } from "@/components/lang";
import { HARMONY_EN } from "@/tools/names-en";

const S = {
  ar: {
    base: "اللون الأساس", bad: "لم أفهم هذا لوناً. جرّب ‎#3366cc‎.",
    harmony: "التناسق", vars: "متغيّراتُ التناسق", scale: "سُلَّمٌ كامل",
    varName: "اسمُ المتغيّر", cssVars: "متغيّرات CSS",
    n1: "اللوحةُ تُبنى في ", b1: "OKLCH",
    n2: " لا HSL: خطواتُ السُّلَّم متساويةٌ في العين، فلا تجد قفزةً بين ٤٠٠ و٥٠٠ ثمّ سكوناً بين ٧٠٠ و٨٠٠ كما يحدث في السلالم المولَّدة حسابيّاً. وما خرج من الألوان عن مدى الشاشة يُردّ إليه ",
    b2: "بخفض التشبّع لا بقصّ القنوات", n3: " — فتبقى الصبغةُ صحيحةً ويبقى المتتامُّ متتامّاً حقّاً.",
  },
  en: {
    base: "Base colour", bad: "I couldn't read that as a colour. Try #3366cc.",
    harmony: "Harmony", vars: "Harmony variables", scale: "Full scale",
    varName: "Variable name", cssVars: "CSS variables",
    n1: "The palette is built in ", b1: "OKLCH",
    n2: " rather than HSL, so the steps are perceptually even — no jump between 400 and 500 followed by a flat stretch from 700 to 800, which is what arithmetic ramps produce. Colours that fall outside the screen gamut are brought back ",
    b2: "by reducing chroma, not by clipping channels", n3: " — the hue stays correct, and a complement stays a real complement.",
  },
};

export default function Palette() {
  const s = useStrings(S);
  const isEn = useLang() === "en";
  const name_ = (id: string, ar: string) => (isEn ? HARMONY_EN[id]?.name ?? ar : ar);
  const note_ = (id: string, ar: string) => (isEn ? HARMONY_EN[id]?.note ?? ar : ar);
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
        <ColorField id="pl-in" label={s.base} value={input} onChange={setInput} />
      </div>

      {input.trim() && !base && <ErrorNote>{s.bad}</ErrorNote>}

      <ChipGroup
        label={s.harmony}
        value={kind}
        onChange={setKind}
        hint={note_(kind, HARMONIES.find((h) => h.id === kind)?.note ?? "")}
        options={HARMONIES.map((h) => ({ id: h.id, label: name_(h.id, h.name), title: note_(h.id, h.note) }))}
      />

      {colors.length > 0 && (
        <>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${colors.length}, minmax(0, 1fr))` }}>
            {colors.map((c, i) => <Swatch key={`${toHex(c)}-${i}`} color={c} tall />)}
          </div>

          <ResultBox title={s.vars} value={harmonyCss} dir="ltr" mono />
        </>
      )}

      {steps.length > 0 && (
        <>
          <div>
            <p className="mb-2 text-[0.78rem] font-bold tracking-wide text-primary">{s.scale}</p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-11">
              {steps.map((s) => <Swatch key={s.step} color={s.color} label={String(s.step)} />)}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="label" htmlFor="pl-name">{s.varName}</label>
            <input
              id="pl-name"
              dir="ltr"
              className="field max-w-48 font-mono"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="brand"
            />
          </div>

          <ResultBox title={s.cssVars} value={css} dir="ltr" mono />
        </>
      )}

      <Note>
        {s.n1}<b className="font-semibold text-ink">{s.b1}</b>{s.n2}
        <b className="font-semibold text-ink">{s.b2}</b>{s.n3}
      </Note>
    </ToolLayout>
  );
}
