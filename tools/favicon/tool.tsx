"use client";

import { useCallback, useEffect, useState } from "react";
import { ChipGroup, ErrorNote, Field, Note, ResultBox, TextField, ToolLayout } from "@/components/tool-kit";
import { parseColor, toHex } from "@/tools/color-lib";
import { ColorField } from "@/tools/color-ui";
import { ICON_SIZES, iconHtml, iconManifest } from "@/tools/image-lib";
import { ImagePicker, LocalNote, downloadBlob, useImagePicker } from "@/tools/image-ui";

type Mode = "image" | "letter";

export default function Favicon() {
  const { picked, error, pick } = useImagePicker();
  const [mode, setMode] = useState<Mode>("letter");
  const [letter, setLetter] = useState("د");
  const [bg, setBg] = useState("#3366cc");
  const [fg, setFg] = useState("#ffffff");
  const [radius, setRadius] = useState(22);
  const [pad, setPad] = useState(12);
  const [siteName, setSiteName] = useState("موقعي");
  const [previews, setPreviews] = useState<{ size: number; url: string }[]>([]);

  const draw = useCallback((size: number): HTMLCanvasElement | null => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const bgc = parseColor(bg);
    const r = (radius / 100) * (size / 2);

    ctx.beginPath();
    if (typeof ctx.roundRect === "function") ctx.roundRect(0, 0, size, size, r);
    else ctx.rect(0, 0, size, size);
    ctx.fillStyle = bgc ? toHex({ ...bgc, a: 1 }) : "#3366cc";
    ctx.fill();

    const inset = (pad / 100) * size;
    const box = size - inset * 2;
    if (box <= 0) return canvas;

    if (mode === "image" && picked) {
      const { naturalWidth: w, naturalHeight: h } = picked.img;
      const k = Math.min(box / w, box / h);
      const dw = w * k, dh = h * k;
      ctx.save();
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") ctx.roundRect(0, 0, size, size, r);
      else ctx.rect(0, 0, size, size);
      ctx.clip();
      ctx.drawImage(picked.img, (size - dw) / 2, (size - dh) / 2, dw, dh);
      ctx.restore();
    } else if (mode === "letter") {
      const text = [...letter.trim()].slice(0, 3).join("") || "؟";
      const fgc = parseColor(fg);
      ctx.fillStyle = fgc ? toHex({ ...fgc, a: 1 }) : "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      let px = box * (text.length > 1 ? 0.62 : 0.8);
      ctx.font = `bold ${px}px system-ui, "Segoe UI", sans-serif`;
      // نضيّق الخطَّ حتّى يتّسع النصُّ داخل الحشو بدل أن يُقصّ
      for (let i = 0; i < 12 && ctx.measureText(text).width > box; i++) {
        px *= 0.9;
        ctx.font = `bold ${px}px system-ui, "Segoe UI", sans-serif`;
      }
      ctx.fillText(text, size / 2, size / 2 + px * 0.04);
    }
    return canvas;
  }, [mode, picked, letter, bg, fg, radius, pad]);

  useEffect(() => {
    if (mode === "image" && !picked) { setPreviews([]); return; }
    setPreviews(
      ICON_SIZES.map((s) => {
        const c = draw(s.size);
        return { size: s.size, url: c ? c.toDataURL("image/png") : "" };
      }),
    );
  }, [draw, mode, picked]);

  const save = (size: number, name: string) => {
    const c = draw(size);
    c?.toBlob((b) => { if (b) downloadBlob(b, name); }, "image/png");
  };

  const saveAll = () => ICON_SIZES.forEach((s, i) => setTimeout(() => save(s.size, s.name), i * 220));

  const ready = mode === "letter" || !!picked;

  return (
    <ToolLayout>
      <ChipGroup
        label="المصدر"
        value={mode}
        onChange={setMode}
        hint={mode === "letter" ? "حرفٌ أو حرفان على خلفيّةٍ ملوّنة — يكفي لمشروعٍ بلا شعارٍ بعد." : "شعارُك يُقصّ داخل مربّعٍ مستديرِ الأركان."}
        options={[{ id: "letter", label: "حرف" }, { id: "image", label: "صورة" }]}
      />

      {mode === "image" ? (
        <>
          <ImagePicker id="fv-file" onPick={pick} picked={picked} />
          {error && <ErrorNote>{error}</ErrorNote>}
        </>
      ) : (
        <div className="flex flex-wrap gap-3">
          <Field label="الحرف" htmlFor="fv-l" className="min-w-32 flex-1">
            <TextField id="fv-l" value={letter} onChange={setLetter} placeholder="د" />
          </Field>
          <ColorField id="fv-fg" label="لونُ الحرف" value={fg} onChange={setFg} />
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <ColorField id="fv-bg" label="لونُ الخلفيّة" value={bg} onChange={setBg} />
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <Field label={`استدارةُ الأركان: ${radius}%`} htmlFor="fv-r" className="min-w-52 flex-1">
          <input id="fv-r" type="range" min={0} max={100} value={radius}
            onChange={(e) => setRadius(Number(e.target.value))} className="w-full accent-[var(--dk-primary)]" />
        </Field>
        <Field label={`الحشو: ${pad}%`} htmlFor="fv-p" className="min-w-52 flex-1">
          <input id="fv-p" type="range" min={0} max={35} value={pad}
            onChange={(e) => setPad(Number(e.target.value))} className="w-full accent-[var(--dk-primary)]" />
        </Field>
      </div>

      {ready && previews.length > 0 && (
        <>
          <div className="rounded-m border border-line bg-surface">
            <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
              <span className="text-[0.78rem] font-bold tracking-wide text-primary">المقاسات</span>
              <button className="btn btn-ghost !px-3 !py-1 !text-[0.82rem] ms-auto" onClick={saveAll}>
                نزّلها كلَّها
              </button>
            </div>
            <ul className="divide-y divide-line">
              {ICON_SIZES.map((s) => {
                const p = previews.find((x) => x.size === s.size);
                return (
                  <li key={s.size} className="flex items-center gap-3 px-4 py-2.5">
                    {p?.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.url} alt="" width={Math.min(s.size, 44)} height={Math.min(s.size, 44)}
                        className="shrink-0 rounded-[4px]" />
                    )}
                    <span className="min-w-0">
                      <span dir="ltr" className="block font-mono text-[0.88rem] text-ink">{s.size}×{s.size}</span>
                      <span className="block text-[0.78rem] leading-tight text-muted">{s.use}</span>
                    </span>
                    <button className="btn btn-ghost !px-3 !py-1 !text-[0.82rem] ms-auto shrink-0"
                      onClick={() => save(s.size, s.name)}>
                      نزّل
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <Field label="اسمُ الموقع" htmlFor="fv-name" className="max-w-72">
            <TextField id="fv-name" value={siteName} onChange={setSiteName} placeholder="موقعي" />
          </Field>

          <ResultBox title="ضعها في <head>" value={iconHtml()} dir="ltr" mono />
          <ResultBox
            title="site.webmanifest"
            value={iconManifest(siteName || "موقعي", parseColor(bg) ? toHex({ ...parseColor(bg)!, a: 1 }) : "#3366cc", "#ffffff")}
            dir="ltr"
            mono
          />
        </>
      )}

      <LocalNote />

      <Note>
        المتصفّحاتُ الحديثةُ تقبل <code className="font-mono text-[0.85rem]">favicon-32x32.png</code> مباشرةً،
        ولم يعد <code className="font-mono text-[0.85rem]">favicon.ico</code> لازماً إلّا لمتصفّحاتٍ قديمةٍ جدّاً —
        ولذلك لا تولّد هذه الأداةُ صيغةَ ICO. وأيقونةُ ‎512‎ ليست ترفاً:
        <b className="font-semibold text-ink"> منها تُبنى شاشةُ الإقلاع</b> حين يُضاف موقعُك إلى شاشة الهاتف.
      </Note>
    </ToolLayout>
  );
}
