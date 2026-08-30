"use client";

import { useEffect, useState } from "react";
import { ChipGroup, ErrorNote, Note, ResultBox, ToolLayout } from "@/components/tool-kit";
import { toHex, toOklchString, type Rgb } from "@/tools/color-lib";
import { Swatch } from "@/tools/color-ui";
import { dominantColors } from "@/tools/image-lib";
import { ImagePicker, LocalNote, useImagePicker } from "@/tools/image-ui";
import { useStrings } from "@/components/lang";

const S = {
  ar: {
    hint: "ألوانُ الصورة تُستخرج في متصفّحك ولا تُرفَع.",
    failed: "تعذّرت قراءةُ بكسلات الصورة في هذا المتصفّح.",
    alt: "الصورة المختارة", count: "عددُ الألوان",
    share: (n: number) => `${n}٪ من البكسلات`, pct: (n: number) => `${n}٪`,
    cssVars: "متغيّرات CSS",
    n1: "الألوانُ تُجمَع في مكعّباتٍ من ٣٢ درجةً ثمّ تُرتَّب بالتكرار — طريقةٌ", b: " حتميّة",
    n2: ": الصورةُ نفسُها تعطي اللوحةَ نفسَها في كلّ مرّة. أمّا خوارزمياتُ العنقدة الشائعة فتبدأ من بذرةٍ عشوائيّة، فتتبدّل نتيجتُها بين تشغيلٍ وآخرَ وذلك مربكٌ حين تحاول مطابقةَ لونٍ بعينه.",
  },
  en: {
    hint: "Colours are extracted in your browser — the image is never uploaded.",
    failed: "This browser would not let the image pixels be read.",
    alt: "Selected image", count: "Number of colours",
    share: (n: number) => `${n}% of pixels`, pct: (n: number) => `${n}%`,
    cssVars: "CSS variables",
    n1: "Colours are bucketed into 32-step cubes and ranked by frequency — a method that is", b: " deterministic",
    n2: ": the same image always yields the same palette. Common clustering algorithms start from a random seed, so their output shifts between runs — confusing when you are trying to match one particular colour.",
  },
};

const COUNTS = ["4", "6", "8", "12"];
const SAMPLE = 160; // ضلعُ العيّنة: يكفي للألوان السائدة ويبقى فوريّاً مهما كبرت الصورة

export default function ImageColors() {
  const s = useStrings(S);
  const { picked, error, pick } = useImagePicker();
  const [count, setCount] = useState("6");
  const [colors, setColors] = useState<{ color: Rgb; share: number }[]>([]);
  const [failed, setFailed] = useState("");

  useEffect(() => {
    if (!picked) { setColors([]); return; }
    setFailed("");
    const { naturalWidth: w, naturalHeight: h } = picked.img;
    const k = Math.min(SAMPLE / w, SAMPLE / h, 1);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(w * k));
    canvas.height = Math.max(1, Math.round(h * k));
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(picked.img, 0, 0, canvas.width, canvas.height);
    try {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      setColors(dominantColors(data, Number(count)));
    } catch {
      setFailed(s.failed);
    }
  }, [picked, count, s]);

  const css = colors.map((c, i) => `--img-${i + 1}: ${toHex(c.color)};`).join("\n");

  return (
    <ToolLayout>
      <ImagePicker id="ic-file" onPick={pick} picked={picked} hint={s.hint} />
      {error && <ErrorNote>{error}</ErrorNote>}
      {failed && <ErrorNote>{failed}</ErrorNote>}

      {picked && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={picked.url} alt={s.alt} className="max-h-60 w-full rounded-m border border-line object-contain" />
      )}

      {picked && <ChipGroup label={s.count} value={count} onChange={setCount} options={COUNTS.map((c) => ({ id: c, label: c }))} />}

      {colors.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {colors.map((c, i) => (
              <Swatch key={`${toHex(c.color)}-${i}`} color={c.color} sub={s.share(c.share)} tall />
            ))}
          </div>

          <div className="rounded-m border border-line bg-surface">
            <ul className="divide-y divide-line">
              {colors.map((c, i) => (
                <li key={`row-${i}`} className="flex items-center gap-3 px-4 py-2">
                  <span className="size-5 shrink-0 rounded-full border border-line" style={{ backgroundColor: toHex(c.color) }} />
                  <span dir="ltr" className="font-mono text-[0.88rem]">{toHex(c.color)}</span>
                  <span dir="ltr" className="font-mono text-[0.8rem] text-muted">{toOklchString(c.color)}</span>
                  <span className="ms-auto font-mono text-[0.82rem] tabular-nums text-muted">{s.pct(c.share)}</span>
                </li>
              ))}
            </ul>
          </div>

          <ResultBox title={s.cssVars} value={css} dir="ltr" mono />
        </>
      )}

      <LocalNote />

      <Note>
        {s.n1}<b className="font-semibold text-ink">{s.b}</b>{s.n2}
      </Note>
    </ToolLayout>
  );
}
