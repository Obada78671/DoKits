"use client";

import { useEffect, useMemo, useState } from "react";
import { ChipGroup, ErrorNote, Field, NumberField, Note, ToolLayout } from "@/components/tool-kit";
import { OUTPUT_FORMATS, fitDimensions, outputName, type FormatId } from "@/tools/image-lib";
import { ImagePicker, LocalNote, downloadBlob, useImagePicker } from "@/tools/image-ui";

const PRESETS = [
  { id: "0", label: "الأصل" },
  { id: "1920", label: "1920 عرض" },
  { id: "1280", label: "1280 عرض" },
  { id: "800", label: "800 عرض" },
  { id: "400", label: "400 عرض" },
];

const kb = (n: number) => (n < 1024 ? `${n} بايت` : `${(n / 1024).toFixed(0)} ك.ب`);

export default function ImageResize() {
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
          <ChipGroup label="العرض" value={preset} onChange={setPreset} options={PRESETS} />

          <ChipGroup
            label="الصيغة"
            value={format}
            onChange={setFormat}
            hint={fmt.note}
            options={OUTPUT_FORMATS.map((f) => ({ id: f.id, label: f.name, title: f.note }))}
          />

          {fmt.lossy && (
            <Field label={`الجودة: ${quality}%`} htmlFor="ir-q" hint="ما بين ٧٥ و٨٥ هو موضعُ التوازن عادةً — وما فوق ٩٠ يكبّر الملفَّ بلا فرقٍ مرئيّ.">
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
            اسمح بالتكبير فوق الأصل
          </button>

          <div className="rounded-m border border-line bg-surface">
            <div className="grid grid-cols-2 divide-x divide-x-reverse divide-line sm:grid-cols-4">
              {[
                { label: "الأصل", value: `${src!.w}×${src!.h}` },
                { label: "الناتج", value: dim ? `${dim.w}×${dim.h}` : "—" },
                { label: "حجمُ الأصل", value: kb(picked.file.size) },
                { label: "حجمُ الناتج", value: busy ? "…" : out ? kb(out.blob.size) : "—" },
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
                  ? `أصغرُ بنسبة ${saved}٪ من الأصل.`
                  : `أكبرُ من الأصل بـ${Math.abs(saved)}٪ — الأصلُ مضغوطٌ جيّداً أصلاً، فأبقِه.`}
              </p>
            )}
          </div>

          {out && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={out.url}
                alt="معاينةُ الناتج"
                className="max-h-80 w-full rounded-m border border-line object-contain"
              />
              <button
                className="btn btn-primary self-start"
                onClick={() => downloadBlob(out.blob, outputName(picked.file.name, dim!, fmt.ext))}
              >
                نزّل {outputName(picked.file.name, dim!, fmt.ext)}
              </button>
            </>
          )}
        </>
      )}

      <LocalNote />

      <Note>
        الرسمُ على canvas <b className="font-semibold text-ink">يمحو بيانات EXIF</b> — موقعَ التصوير
        وطرازَ الجهاز وتاريخَه. وهذه ميزةٌ لا نقص: صورةٌ تنشرها بعد تمريرها هنا لا تحمل إحداثيّاتِ بيتك.
      </Note>
    </ToolLayout>
  );
}
