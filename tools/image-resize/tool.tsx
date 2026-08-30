"use client";

import { useEffect, useMemo, useState } from "react";
import { ChipGroup, ErrorNote, Field, NumberField, Note, ToolLayout } from "@/components/tool-kit";
import { OUTPUT_FORMATS, fitDimensions, outputName, type FormatId } from "@/tools/image-lib";
import { ImagePicker, LocalNote, downloadBlob, useImagePicker } from "@/tools/image-ui";
import { useLang, useStrings } from "@/components/lang";
import { FORMAT_EN } from "@/tools/names-en";

const S = {
  ar: {
    width: "العرض", original: "الأصل", format: "الصيغة",
    quality: (n: number) => `الجودة: ${n}%`,
    qHint: "ما بين ٧٥ و٨٥ هو موضعُ التوازن عادةً — وما فوق ٩٠ يكبّر الملفَّ بلا فرقٍ مرئيّ.",
    upscale: "اسمح بالتكبير فوق الأصل",
    out: "الناتج", srcSize: "حجمُ الأصل", outSize: "حجمُ الناتج",
    smaller: (n: number) => `أصغرُ بنسبة ${n}٪ من الأصل.`,
    bigger: (n: number) => `أكبرُ من الأصل بـ${n}٪ — الأصلُ مضغوطٌ جيّداً أصلاً، فأبقِه.`,
    preview: "معاينةُ الناتج", download: "نزّل",
    n1: "الرسمُ على canvas ", b: "يمحو بيانات EXIF", n2: " — موقعَ التصوير وطرازَ الجهاز وتاريخَه. وهذه ميزةٌ لا نقص: صورةٌ تنشرها بعد تمريرها هنا لا تحمل إحداثيّاتِ بيتك.",
    bytes: "بايت", kb: "ك.ب",
  },
  en: {
    width: "Width", original: "Original", format: "Format",
    quality: (n: number) => `Quality: ${n}%`,
    qHint: "75–85 is usually the balance point — above 90 the file grows with no visible gain.",
    upscale: "Allow upscaling beyond the original",
    out: "Output", srcSize: "Original size", outSize: "Output size",
    smaller: (n: number) => `${n}% smaller than the original.`,
    bigger: (n: number) => `${n}% larger than the original — it was already well compressed, so keep it.`,
    preview: "Output preview", download: "Download",
    n1: "Drawing on a canvas ", b: "strips EXIF data", n2: " — where the photo was taken, on what device, and when. That is a feature, not a loss: an image published after passing through here does not carry your home coordinates.",
    bytes: "bytes", kb: "KB",
  },
};

const PRESET_W = ["0", "1920", "1280", "800", "400"];
const kb = (n: number, u: { bytes: string; kb: string }) =>
  n < 1024 ? `${n} ${u.bytes}` : `${(n / 1024).toFixed(0)} ${u.kb}`;

export default function ImageResize() {
  const s = useStrings(S);
  const isEn = useLang() === "en";
  const { picked, error, pick } = useImagePicker();
  const [preset, setPreset] = useState("1280");
  const [format, setFormat] = useState<FormatId>("image/webp");
  const [quality, setQuality] = useState(82);
  const [upscale, setUpscale] = useState(false);
  const [out, setOut] = useState<{ blob: Blob; url: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const src = picked ? { w: picked.img.naturalWidth, h: picked.img.naturalHeight } : null;
  const dim = useMemo(() => {
    if (!src) return null;
    const w = Number(preset);
    return w === 0 ? src : fitDimensions(src, { w }, "width", upscale);
  }, [src, preset, upscale]);

  const fmt = OUTPUT_FORMATS.find((f) => f.id === format)!;

  useEffect(() => {
    if (!picked || !dim) { setOut(null); return; }
    let alive = true;
    setBusy(true);
    const canvas = document.createElement("canvas");
    canvas.width = dim.w;
    canvas.height = dim.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) { setBusy(false); return; }
    ctx.imageSmoothingQuality = "high";
    // JPEG بلا شفافيّة: نملأ أبيضَ أوّلاً وإلّا صارت الشفافيّةُ سوداء
    if (format === "image/jpeg") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, dim.w, dim.h); }
    ctx.drawImage(picked.img, 0, 0, dim.w, dim.h);
    canvas.toBlob(
      (blob) => {
        if (!alive || !blob) { setBusy(false); return; }
        setOut((prev) => { if (prev) URL.revokeObjectURL(prev.url); return { blob, url: URL.createObjectURL(blob) }; });
        setBusy(false);
      },
      format,
      fmt.lossy ? quality / 100 : undefined,
    );
    return () => { alive = false; };
  }, [picked, dim, format, quality, fmt.lossy]);

  useEffect(() => () => { if (out) URL.revokeObjectURL(out.url); }, [out]);

  const saved = picked && out ? Math.round((1 - out.blob.size / picked.file.size) * 100) : 0;

  return (
    <ToolLayout>
      <ImagePicker id="ir-file" onPick={pick} picked={picked} />
      {error && <ErrorNote>{error}</ErrorNote>}

      {picked && (
        <>
          <ChipGroup
            label={s.width}
            value={preset}
            onChange={setPreset}
            options={PRESET_W.map((w) => ({ id: w, label: w === "0" ? s.original : (isEn ? `${w} wide` : `${w} عرض`) }))}
          />

          <ChipGroup
            label={s.format}
            value={format}
            onChange={setFormat}
            hint={isEn ? FORMAT_EN[format] ?? fmt.note : fmt.note}
            options={OUTPUT_FORMATS.map((f) => ({ id: f.id, label: f.name, title: isEn ? FORMAT_EN[f.id] ?? f.note : f.note }))}
          />

          {fmt.lossy && (
            <Field label={s.quality(quality)} htmlFor="ir-q" hint={s.qHint}>
              <input
                id="ir-q"
                type="range"
                min={30}
                max={100}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-[var(--dk-primary)]"
              />
            </Field>
          )}

          <button className={`chip self-start ${upscale ? "chip-active" : ""}`} onClick={() => setUpscale(!upscale)}>
            {s.upscale}
          </button>

          <div className="rounded-m border border-line bg-surface">
            <div className="grid grid-cols-2 divide-x divide-x-reverse divide-line sm:grid-cols-4">
              {[
                { label: s.original, value: `${src!.w}×${src!.h}` },
                { label: s.out, value: dim ? `${dim.w}×${dim.h}` : "—" },
                { label: s.srcSize, value: kb(picked.file.size, s) },
                { label: s.outSize, value: busy ? "…" : out ? kb(out.blob.size, s) : "—" },
              ].map((t) => (
                <div key={t.label} className="px-3 py-3 text-center">
                  <div dir="ltr" className="font-mono text-[1.05rem] tabular-nums">{t.value}</div>
                  <div className="mt-0.5 text-[0.74rem] text-muted">{t.label}</div>
                </div>
              ))}
            </div>
            {out && !busy && (
              <p className={`border-t border-line px-4 py-2.5 text-[0.88rem] ${saved > 0 ? "text-ink" : "text-muted"}`}>
                {saved > 0
                  ? s.smaller(saved)
                  : s.bigger(Math.abs(saved))}
              </p>
            )}
          </div>

          {out && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={out.url}
                alt={s.preview}
                className="max-h-80 w-full rounded-m border border-line object-contain"
              />
              <button
                className="btn btn-primary self-start"
                onClick={() => downloadBlob(out.blob, outputName(picked.file.name, dim!, fmt.ext))}
              >
                {s.download} {outputName(picked.file.name, dim!, fmt.ext)}
              </button>
            </>
          )}
        </>
      )}

      <LocalNote />

      <Note>
        {s.n1}<b className="font-semibold text-ink">{s.b}</b>{s.n2}
      </Note>
    </ToolLayout>
  );
}
