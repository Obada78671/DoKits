"use client";

import { useState } from "react";
import { Field } from "@/components/tool-kit";
import { useLang } from "@/components/lang";
import { contrastRatio, parseColor, toHex, type Rgb } from "@/tools/color-lib";

/** الأسودُ أو الأبيضُ — أيُّهما أوضحُ فوق هذا اللون. لا لونَ ثالثَ في رقعةِ لون */
export const readableOn = (c: Rgb): string =>
  contrastRatio(c, { r: 0, g: 0, b: 0, a: 1 }) >= contrastRatio(c, { r: 255, g: 255, b: 255, a: 1 })
    ? "#000000"
    : "#ffffff";

/** حقلُ لونٍ نصّيٌّ ومنتقٍ معاً: الكتابةُ للدقّة والمنتقي للاستكشاف */
export function ColorField({
  id, label, value, onChange, hint,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void; hint?: React.ReactNode;
}) {
  const en = useLang() === "en";
  const parsed = parseColor(value);
  const hex6 = parsed ? toHex({ ...parsed, a: 1 }) : "#000000";
  return (
    <Field label={label} htmlFor={id} hint={hint} className="min-w-52 flex-1">
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} — ${en ? "colour picker" : "منتقي الألوان"}`}
          value={hex6}
          onChange={(e) => onChange(e.target.value)}
          className="size-11 shrink-0 cursor-pointer rounded-s border border-line bg-surface p-1"
        />
        <input
          id={id}
          type="text"
          dir="ltr"
          className={`field font-mono ${parsed ? "" : "border-accent"}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#3366cc"
        />
      </div>
    </Field>
  );
}

/** رقعةُ لونٍ تُنسَخ بالنقر — والنصُّ فوقها يُختار بالتباين لا بالتخمين */
export function Swatch({
  color, label, sub, tall = false,
}: { color: Rgb; label?: string; sub?: string; tall?: boolean }) {
  const en = useLang() === "en";
  const [copied, setCopied] = useState(false);
  const hex = toHex(color);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch { /* الحافظةُ قد تُمنع */ }
  };
  return (
    <button
      onClick={copy}
      title={en ? `Click to copy ${hex}` : `انقر لنسخ ${hex}`}
      className={`flex w-full flex-col justify-end rounded-m border border-line p-2.5 text-start transition-transform hover:scale-[1.02] ${tall ? "h-24" : "h-16"}`}
      style={{ backgroundColor: hex, color: readableOn(color) }}
    >
      {label && <span className="text-[0.72rem] font-bold opacity-80">{label}</span>}
      <span dir="ltr" className="font-mono text-[0.78rem]">{copied ? (en ? "Copied ✓" : "نُسخ ✓") : hex}</span>
      {sub && <span className="text-[0.68rem] opacity-70">{sub}</span>}
    </button>
  );
}
