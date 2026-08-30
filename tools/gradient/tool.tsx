"use client";

import { useMemo, useState } from "react";
import { ChipGroup, Field, Note, ResultBox, ToolLayout } from "@/components/tool-kit";
import { gradientCss, gradientSamples, parseColor, toHex, type Stop } from "@/tools/color-lib";
import { ColorField } from "@/tools/color-ui";

type Kind = "linear" | "radial";

export default function Gradient() {
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
        <ColorField id="gr-a" label="من" value={from} onChange={setFrom} />
        <ColorField id="gr-b" label="إلى" value={to} onChange={setTo} />
      </div>

      <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
        <ChipGroup
          label="الشكل"
          value={kind}
          onChange={setKind}
          options={[{ id: "linear", label: "خطّيّ" }, { id: "radial", label: "شعاعيّ" }]}
        />
        <button className={`chip ${oklab ? "chip-active" : ""}`} onClick={() => setOklab(!oklab)}>
          المزجُ في OKLab
        </button>
      </div>

      {kind === "linear" && (
        <Field label={`الزاوية: ${angle}°`} htmlFor="gr-ang">
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
        title="CSS"
        value={css ? `background: ${css};` : ""}
        dir="ltr"
        mono
        hint={oklab ? "يحتاج متصفّحاً يدعم فضاءات المزج (٢٠٢٣ فصاعداً) — والسطرُ أسفلَه بديلٌ يعمل في كلّ مكان." : undefined}
      />

      {oklab && srgbCss && (
        <ResultBox title="بديلٌ متوافقٌ مع القديم" value={`background: ${srgbCss};`} dir="ltr" mono />
      )}

      <Note>
        جرّب أزرقَ وأصفرَ وأطفئ «المزجَ في OKLab»: يمرّ التدرّجُ برماديٍّ موحلٍ في المنتصف. ذلك أنّ المزجَ
        في sRGB يجمع الأرقامَ لا الألوان، فيهبط التشبّعُ عند التقاء صبغتين متقابلتين.
        <b className="font-semibold text-ink"> والمزجُ في OKLab يمرّ بأخضرَ حيويّ</b> — وهو ما تتوقّعه العين.
      </Note>
    </ToolLayout>
  );
}
