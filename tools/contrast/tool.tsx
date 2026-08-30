"use client";

import { useMemo, useState } from "react";
import { CopyButton, ErrorNote, Note, ToolLayout } from "@/components/tool-kit";
import { fixContrast, judgeContrast, parseColor, toHex } from "@/tools/color-lib";
import { ColorField } from "@/tools/color-ui";

const CHECKS = [
  { key: "aaNormal", label: "AA — نصٌّ عاديّ", need: "4.5:1" },
  { key: "aaaNormal", label: "AAA — نصٌّ عاديّ", need: "7:1" },
  { key: "aaLarge", label: "AA — نصٌّ كبير", need: "3:1" },
  { key: "aaaLarge", label: "AAA — نصٌّ كبير", need: "4.5:1" },
  { key: "uiComponent", label: "عناصرُ الواجهة والرسوم", need: "3:1" },
] as const;

export default function Contrast() {
  const [fgText, setFgText] = useState("#8ab4f8");
  const [bgText, setBgText] = useState("#ffffff");

  const fg = useMemo(() => parseColor(fgText), [fgText]);
  const bg = useMemo(() => parseColor(bgText), [bgText]);
  const v = fg && bg ? judgeContrast(fg, bg) : null;
  const suggestion = fg && bg && v && !v.aaNormal ? fixContrast(fg, bg, 4.5) : null;

  const swap = () => { setFgText(bgText); setBgText(fgText); };

  return (
    <ToolLayout>
      <div className="flex flex-wrap items-end gap-3">
        <ColorField id="ct-fg" label="لونُ النصّ" value={fgText} onChange={setFgText} />
        <button className="btn btn-ghost" onClick={swap} aria-label="بدّل اللونين">⇄</button>
        <ColorField id="ct-bg" label="لونُ الخلفيّة" value={bgText} onChange={setBgText} />
      </div>

      {((fgText.trim() && !fg) || (bgText.trim() && !bg)) && (
        <ErrorNote>أحدُ اللونين غيرُ مفهوم. جرّب ‎#3366cc‎ أو ‎rgb(51 102 204)‎.</ErrorNote>
      )}

      {fg && bg && v && (
        <>
          <div
            className="rounded-m border border-line p-6"
            style={{ backgroundColor: toHex({ ...bg, a: 1 }), color: toHex({ ...fg, a: 1 }) }}
          >
            <p className="text-[1.75rem] font-bold leading-snug">نصٌّ كبيرٌ للعنوان</p>
            <p className="mt-2 leading-loose">
              نصٌّ عاديٌّ بحجم القراءة — وهذا ما ينبغي أن يمرّ عند 4.5:1، فالعناوينُ تُقرأ ولو ضعف تباينُها
              أمّا المتنُ فلا.
            </p>
          </div>

          <div className={`rounded-m border px-4 py-3.5 ${v.aaNormal ? "border-accent bg-accent-soft" : "border-line bg-surface2"}`}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span dir="ltr" className="font-mono text-3xl font-medium tabular-nums">{v.ratio.toFixed(2)}:1</span>
              <span className="ms-auto font-semibold text-ink">
                {v.aaaNormal ? "ممتاز — يمرّ AAA" : v.aaNormal ? "جيّد — يمرّ AA" : v.aaLarge ? "للعناوين فقط" : "لا يكفي"}
              </span>
            </div>
          </div>

          <div className="rounded-m border border-line bg-surface">
            <ul className="divide-y divide-line">
              {CHECKS.map((c) => (
                <li key={c.key} className="flex items-center gap-3 px-4 py-2">
                  <span className={v[c.key] ? "text-ink" : "text-muted"}>{v[c.key] ? "✓" : "✗"}</span>
                  <span className={v[c.key] ? "font-medium text-ink" : "text-muted"}>{c.label}</span>
                  <span dir="ltr" className="ms-auto font-mono text-[0.82rem] text-muted">{c.need}</span>
                </li>
              ))}
            </ul>
          </div>

          {suggestion && (
            <div className="rounded-m border border-line bg-surface p-4">
              <p className="text-[0.78rem] font-bold tracking-wide text-primary">أقربُ لونٍ يمرّ AA</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span
                  className="inline-flex h-11 items-center rounded-s border border-line px-4 font-mono"
                  style={{ backgroundColor: toHex({ ...bg, a: 1 }), color: toHex(suggestion) }}
                  dir="ltr"
                >
                  {toHex(suggestion)}
                </span>
                <span className="text-[0.86rem] text-muted">
                  ‏{judgeContrast(suggestion, bg).ratio.toFixed(2)}:1 — بالصبغة نفسِها، الإضاءةُ وحدَها تغيّرت.
                </span>
                <span className="ms-auto"><CopyButton value={toHex(suggestion)} /></span>
              </div>
            </div>
          )}
        </>
      )}

      <Note>
        «النصُّ الكبير» في WCAG هو ‎18pt‎ (≈‎24px‎) فأكبر، أو ‎14pt‎ (≈‎18.7px‎) عريضاً — والخطُّ العربيُّ
        يحتاج غالباً حجماً أكبرَ من نظيره اللاتينيّ ليُقرأ بالراحة نفسِها، فلا تعتمد على العتبة وحدَها.
        والاقتراحُ أعلاه يزحزح الإضاءةَ في OKLCH فقط، <b className="font-semibold text-ink">فتبقى صبغةُ
        علامتك التجاريّة كما هي</b> بدل أن يُستبدَل اللونُ بآخر.
      </Note>
    </ToolLayout>
  );
}
