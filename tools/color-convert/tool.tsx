"use client";

import { useMemo, useState } from "react";
import { CopyButton, ErrorNote, Note, ToolLayout } from "@/components/tool-kit";
import {
  luminance, parseColor, rgbToOklch, toHex, toHslString, toOklchString, toRgbString,
} from "@/tools/color-lib";
import { ColorField, readableOn } from "@/tools/color-ui";
import { useStrings } from "@/components/lang";

const S = {
  ar: {
    color: "اللون",
    hint: "اكتب hex أو rgb() أو hsl() أو اسماً عربيّاً كـ«أزرق»، أو استعمل المنتقي.",
    bad: "لم أفهم هذا لوناً. جرّب ‎#3366cc‎ أو ‎rgb(51 102 204)‎.",
    lightness: "الإضاءة الإدراكيّة", chroma: "التشبّع", hue: "الصبغة", wcag: "إضاءةُ WCAG",
    note1: "الإضاءةُ هنا نوعان لا يُخلطان: ", b1: "إضاءةُ OKLCH إدراكيّة",
    note2: " — لونان بالإضاءة نفسِها يبدوان متساويَي السطوع للعين؛ و", b2: "إضاءةُ WCAG",
    note3: " رقمٌ فيزيائيٌّ يُحسب منه التباينُ وحدَه. أمّا إضاءةُ HSL فحسابيّةٌ لا تمثّل الرؤية: الأصفرُ والأزرقُ عندها ٥٠٪ وبينهما فرقُ سطوعٍ هائل.",
  },
  en: {
    color: "Colour",
    hint: "Type a hex, rgb(), hsl(), or a colour name — or use the picker.",
    bad: "I couldn't read that as a colour. Try #3366cc or rgb(51 102 204).",
    lightness: "Perceptual lightness", chroma: "Chroma", hue: "Hue", wcag: "WCAG luminance",
    note1: "Two different lightnesses live here and must not be confused: ", b1: "OKLCH lightness is perceptual",
    note2: " — two colours at the same value look equally bright to the eye; while ", b2: "WCAG luminance",
    note3: " is a physical number used only to compute contrast. HSL lightness is neither: yellow and blue both sit at 50% with an enormous difference in apparent brightness.",
  },
};

export default function ColorConvert() {
  const s = useStrings(S);
  const [input, setInput] = useState("#3366cc");
  const c = useMemo(() => parseColor(input), [input]);

  const rows = c
    ? [
        { label: "HEX", value: toHex(c) },
        { label: "RGB", value: toRgbString(c) },
        { label: "HSL", value: toHslString(c) },
        { label: "OKLCH", value: toOklchString(c) },
      ]
    : [];

  const o = c ? rgbToOklch(c) : null;

  return (
    <ToolLayout>
      <div className="flex flex-wrap gap-3">
        <ColorField
          id="cc-in"
          label={s.color}
          value={input}
          onChange={setInput}
          hint={s.hint}
        />
      </div>

      {input.trim() && !c && <ErrorNote>{s.bad}</ErrorNote>}

      {c && (
        <>
          <div
            className="flex h-28 items-end rounded-m border border-line p-4"
            style={{ backgroundColor: toHex({ ...c, a: 1 }), color: readableOn(c) }}
          >
            <span dir="ltr" className="font-mono text-lg">{toHex(c)}</span>
          </div>

          <div className="rounded-m border border-line bg-surface">
            <ul className="divide-y divide-line">
              {rows.map((r) => (
                <li key={r.label} className="flex items-center gap-3 px-4 py-2">
                  <span className="w-16 shrink-0 text-[0.78rem] font-bold text-primary">{r.label}</span>
                  <span dir="ltr" className="min-w-0 break-all font-mono text-[0.9rem]">{r.value}</span>
                  <span className="ms-auto shrink-0"><CopyButton value={r.value} /></span>
                </li>
              ))}
            </ul>
          </div>

          {o && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: s.lightness, value: `${Math.round(o.l * 100)}%` },
                { label: s.chroma, value: o.c.toFixed(3) },
                { label: s.hue, value: `${Math.round(o.h)}°` },
                { label: s.wcag, value: luminance(c).toFixed(3) },
              ].map((t) => (
                <div key={t.label} className="rounded-m border border-line bg-surface p-3.5 text-center">
                  <div dir="ltr" className="font-mono text-xl font-medium tabular-nums">{t.value}</div>
                  <div className="mt-0.5 text-[0.76rem] leading-tight text-muted">{t.label}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <Note>
        {s.note1}<b className="font-semibold text-ink">{s.b1}</b>{s.note2}
        <b className="font-semibold text-ink">{s.b2}</b>{s.note3}
      </Note>
    </ToolLayout>
  );
}
