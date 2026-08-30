"use client";

import { useMemo, useState } from "react";
import { ChipGroup, Field, Note, ResultBox, ToolLayout } from "@/components/tool-kit";
import { gradientCss, gradientSamples, parseColor, toHex, type Stop } from "@/tools/color-lib";
import { ColorField } from "@/tools/color-ui";
import { useStrings } from "@/components/lang";

const S = {
  ar: {
    from: "من", to: "إلى", shape: "الشكل", linear: "خطّيّ", radial: "شعاعيّ",
    oklab: "المزجُ في OKLab", angle: (n: number) => `الزاوية: ${n}°`,
    css: "CSS", fallback: "بديلٌ متوافقٌ مع القديم",
    hint: "يحتاج متصفّحاً يدعم فضاءات المزج (٢٠٢٣ فصاعداً) — والسطرُ أسفلَه بديلٌ يعمل في كلّ مكان.",
    n1: "جرّب أزرقَ وأصفرَ وأطفئ «المزجَ في OKLab»: يمرّ التدرّجُ برماديٍّ موحلٍ في المنتصف. ذلك أنّ المزجَ في sRGB يجمع الأرقامَ لا الألوان، فيهبط التشبّعُ عند التقاء صبغتين متقابلتين.",
    b: " والمزجُ في OKLab يمرّ بأخضرَ حيويّ", n2: " — وهو ما تتوقّعه العين.",
  },
  en: {
    from: "From", to: "To", shape: "Shape", linear: "Linear", radial: "Radial",
    oklab: "Mix in OKLab", angle: (n: number) => `Angle: ${n}°`,
    css: "CSS", fallback: "Fallback for older browsers",
    hint: "Needs a browser with colour-space interpolation (2023 onwards) — the line below works everywhere.",
    n1: "Try blue and yellow with \"Mix in OKLab\" turned off: the gradient passes through muddy grey in the middle. That is because mixing in sRGB adds numbers rather than colours, so chroma collapses where two opposing hues meet.",
    b: " Mixing in OKLab passes through a vivid teal instead", n2: " — which is what the eye expects.",
  },
};

type Kind = "linear" | "radial";

export default function Gradient() {
  const s = useStrings(S);
  const [from, setFrom] = useState("#3366cc");
  const [to, setTo] = useState("#ffb020");
  const [kind, setKind] = useState<Kind>("linear");
  const [angle, setAngle] = useState(90);
  const [oklab, setOklab] = useState(true);

  const a = parseColor(from);
  const b = parseColor(to);

  const stops: Stop[] = useMemo(
    () => (a && b ? [{ color: a, at: 0 }, { color: b, at: 100 }] : []),
    [a, b],
  );

  // معاينةٌ بعيّناتٍ محسوبةٍ في OKLab: تُري المزجَ الصحيحَ حتّى في متصفّحٍ لا يدعم `in oklab`
  const preview = useMemo(() => {
    if (stops.length < 2) return "";
    const list = (oklab ? gradientSamples(stops, 24) : stops)
      .map((s) => `${toHex(s.color)} ${Math.round(s.at)}%`).join(", ");
    return kind === "linear" ? `linear-gradient(${angle}deg, ${list})` : `radial-gradient(circle, ${list})`;
  }, [stops, oklab, kind, angle]);

  const css = stops.length >= 2 ? gradientCss(stops, kind, angle, oklab) : "";
  const srgbCss = stops.length >= 2 ? gradientCss(stops, kind, angle, false) : "";

  return (
    <ToolLayout>
      <div className="flex flex-wrap gap-3">
        <ColorField id="gr-a" label={s.from} value={from} onChange={setFrom} />
        <ColorField id="gr-b" label={s.to} value={to} onChange={setTo} />
      </div>

      <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
        <ChipGroup
          label={s.shape}
          value={kind}
          onChange={setKind}
          options={[{ id: "linear", label: s.linear }, { id: "radial", label: s.radial }]}
        />
        <button className={`chip ${oklab ? "chip-active" : ""}`} onClick={() => setOklab(!oklab)}>
          {s.oklab}
        </button>
      </div>

      {kind === "linear" && (
        <Field label={s.angle(angle)} htmlFor="gr-ang">
          <input
            id="gr-ang"
            type="range"
            min={0}
            max={360}
            step={5}
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-full accent-[var(--dk-primary)]"
          />
        </Field>
      )}

      {preview && (
        <div className="h-44 rounded-m border border-line" style={{ background: preview }} />
      )}

      <ResultBox
        title={s.css}
        value={css ? `background: ${css};` : ""}
        dir="ltr"
        mono
        hint={oklab ? s.hint : undefined}
      />

      {oklab && srgbCss && (
        <ResultBox title={s.fallback} value={`background: ${srgbCss};`} dir="ltr" mono />
      )}

      <Note>
        {s.n1}<b className="font-semibold text-ink">{s.b}</b>{s.n2}
      </Note>
    </ToolLayout>
  );
}
