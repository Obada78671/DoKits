"use client";

import { useMemo, useState } from "react";
import { CopyButton, ErrorNote, Note, ToolLayout } from "@/components/tool-kit";
import {
  luminance, parseColor, rgbToOklch, toHex, toHslString, toOklchString, toRgbString,
} from "@/tools/color-lib";
import { ColorField, readableOn } from "@/tools/color-ui";

export default function ColorConvert() {
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
          label="اللون"
          value={input}
          onChange={setInput}
          hint="اكتب hex أو rgb() أو hsl() أو اسماً عربيّاً كـ«أزرق»، أو استعمل المنتقي."
        />
      </div>

      {input.trim() && !c && <ErrorNote>لم أفهم هذا لوناً. جرّب ‎#3366cc‎ أو ‎rgb(51 102 204)‎.</ErrorNote>}

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
                { label: "الإضاءة الإدراكيّة", value: `${Math.round(o.l * 100)}%` },
                { label: "التشبّع", value: o.c.toFixed(3) },
                { label: "الصبغة", value: `${Math.round(o.h)}°` },
                { label: "إضاءةُ WCAG", value: luminance(c).toFixed(3) },
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
        الإضاءةُ هنا نوعان لا يُخلطان: <b className="font-semibold text-ink">إضاءةُ OKLCH إدراكيّة</b> —
        لونان بالإضاءة نفسِها يبدوان متساويَي السطوع للعين؛ و<b className="font-semibold text-ink">إضاءةُ
        WCAG</b> رقمٌ فيزيائيٌّ يُحسب منه التباينُ وحدَه. أمّا إضاءةُ HSL فحسابيّةٌ لا تمثّل الرؤية:
        الأصفرُ والأزرقُ عندها ٥٠٪ وبينهما فرقُ سطوعٍ هائل.
      </Note>
    </ToolLayout>
  );
}
