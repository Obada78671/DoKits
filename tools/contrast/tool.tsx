"use client";

import { useMemo, useState } from "react";
import { CopyButton, ErrorNote, Note, ToolLayout } from "@/components/tool-kit";
import { fixContrast, judgeContrast, parseColor, toHex } from "@/tools/color-lib";
import { ColorField } from "@/tools/color-ui";
import { useStrings } from "@/components/lang";

const CHECKS = [
  { key: "aaNormal", need: "4.5:1" }, { key: "aaaNormal", need: "7:1" },
  { key: "aaLarge", need: "3:1" }, { key: "aaaLarge", need: "4.5:1" },
  { key: "uiComponent", need: "3:1" },
] as const;

const S = {
  ar: {
    fg: "لونُ النصّ", bg: "لونُ الخلفيّة", swap: "بدّل اللونين",
    bad: "أحدُ اللونين غيرُ مفهوم. جرّب ‎#3366cc‎ أو ‎rgb(51 102 204)‎.",
    big: "نصٌّ كبيرٌ للعنوان",
    body: "نصٌّ عاديٌّ بحجم القراءة — وهذا ما ينبغي أن يمرّ عند 4.5:1، فالعناوينُ تُقرأ ولو ضعف تباينُها أمّا المتنُ فلا.",
    verdictAAA: "ممتاز — يمرّ AAA", verdictAA: "جيّد — يمرّ AA", verdictLarge: "للعناوين فقط", verdictFail: "لا يكفي",
    checks: {
      aaNormal: "AA — نصٌّ عاديّ", aaaNormal: "AAA — نصٌّ عاديّ",
      aaLarge: "AA — نصٌّ كبير", aaaLarge: "AAA — نصٌّ كبير", uiComponent: "عناصرُ الواجهة والرسوم",
    },
    fixTitle: "أقربُ لونٍ يمرّ AA",
    fixNote: "بالصبغة نفسِها، الإضاءةُ وحدَها تغيّرت.",
    note1: "«النصُّ الكبير» في WCAG هو ‎18pt‎ (≈‎24px‎) فأكبر، أو ‎14pt‎ (≈‎18.7px‎) عريضاً — والخطُّ العربيُّ يحتاج غالباً حجماً أكبرَ من نظيره اللاتينيّ ليُقرأ بالراحة نفسِها، فلا تعتمد على العتبة وحدَها. والاقتراحُ أعلاه يزحزح الإضاءةَ في OKLCH فقط، ",
    b: "فتبقى صبغةُ علامتك التجاريّة كما هي", note2: " بدل أن يُستبدَل اللونُ بآخر.",
  },
  en: {
    fg: "Text colour", bg: "Background colour", swap: "Swap the two colours",
    bad: "One of the colours isn't understood. Try #3366cc or rgb(51 102 204).",
    big: "Large heading text",
    body: "Body text at reading size — this is what must pass at 4.5:1. Headings stay legible at half the contrast; body copy does not.",
    verdictAAA: "Excellent — passes AAA", verdictAA: "Good — passes AA", verdictLarge: "Headings only", verdictFail: "Not enough",
    checks: {
      aaNormal: "AA — body text", aaaNormal: "AAA — body text",
      aaLarge: "AA — large text", aaaLarge: "AAA — large text", uiComponent: "UI components and graphics",
    },
    fixTitle: "Nearest colour that passes AA",
    fixNote: "Same hue — only the lightness moved.",
    note1: "WCAG's \"large text\" means 18pt (≈24px) or larger, or 14pt (≈18.7px) bold. The suggestion above shifts lightness in OKLCH only, ",
    b: "so your brand hue survives", note2: " instead of the colour being replaced outright.",
  },
};

export default function Contrast() {
  const s = useStrings(S);
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
        <ColorField id="ct-fg" label={s.fg} value={fgText} onChange={setFgText} />
        <button className="btn btn-ghost" onClick={swap} aria-label={s.swap}>⇄</button>
        <ColorField id="ct-bg" label={s.bg} value={bgText} onChange={setBgText} />
      </div>

      {((fgText.trim() && !fg) || (bgText.trim() && !bg)) && (
        <ErrorNote>{s.bad}</ErrorNote>
      )}

      {fg && bg && v && (
        <>
          <div
            className="rounded-m border border-line p-6"
            style={{ backgroundColor: toHex({ ...bg, a: 1 }), color: toHex({ ...fg, a: 1 }) }}
          >
            <p className="text-[1.75rem] font-bold leading-snug">{s.big}</p>
            <p className="mt-2 leading-loose">{s.body}</p>
          </div>

          <div className={`rounded-m border px-4 py-3.5 ${v.aaNormal ? "border-accent bg-accent-soft" : "border-line bg-surface2"}`}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span dir="ltr" className="font-mono text-3xl font-medium tabular-nums">{v.ratio.toFixed(2)}:1</span>
              <span className="ms-auto font-semibold text-ink">
                {v.aaaNormal ? s.verdictAAA : v.aaNormal ? s.verdictAA : v.aaLarge ? s.verdictLarge : s.verdictFail}
              </span>
            </div>
          </div>

          <div className="rounded-m border border-line bg-surface">
            <ul className="divide-y divide-line">
              {CHECKS.map((c) => (
                <li key={c.key} className="flex items-center gap-3 px-4 py-2">
                  <span className={v[c.key] ? "text-ink" : "text-muted"}>{v[c.key] ? "✓" : "✗"}</span>
                  <span className={v[c.key] ? "font-medium text-ink" : "text-muted"}>{s.checks[c.key]}</span>
                  <span dir="ltr" className="ms-auto font-mono text-[0.82rem] text-muted">{c.need}</span>
                </li>
              ))}
            </ul>
          </div>

          {suggestion && (
            <div className="rounded-m border border-line bg-surface p-4">
              <p className="text-[0.78rem] font-bold tracking-wide text-primary">{s.fixTitle}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span
                  className="inline-flex h-11 items-center rounded-s border border-line px-4 font-mono"
                  style={{ backgroundColor: toHex({ ...bg, a: 1 }), color: toHex(suggestion) }}
                  dir="ltr"
                >
                  {toHex(suggestion)}
                </span>
                <span className="text-[0.86rem] text-muted">
                  {judgeContrast(suggestion, bg).ratio.toFixed(2)}:1 — {s.fixNote}
                </span>
                <span className="ms-auto"><CopyButton value={toHex(suggestion)} /></span>
              </div>
            </div>
          )}
        </>
      )}

      <Note>
        {s.note1}<b className="font-semibold text-ink">{s.b}</b>{s.note2}
      </Note>
    </ToolLayout>
  );
}
