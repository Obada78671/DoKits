"use client";

import { useCallback, useEffect, useState } from "react";
import { ChipGroup, ErrorNote, Field, Note, ResultBox, TextField, ToolLayout } from "@/components/tool-kit";
import { parseColor, toHex } from "@/tools/color-lib";
import { ColorField } from "@/tools/color-ui";
import { ICON_SIZES, iconHtml, iconManifest } from "@/tools/image-lib";
import { ImagePicker, LocalNote, downloadBlob, useImagePicker } from "@/tools/image-ui";
import { useLang, useStrings } from "@/components/lang";
import { ICON_USE_EN } from "@/tools/names-en";

const S = {
  ar: {
    source: "المصدر", letter: "حرف", image: "صورة",
    letterHint: "حرفٌ أو حرفان على خلفيّةٍ ملوّنة — يكفي لمشروعٍ بلا شعارٍ بعد.",
    imageHint: "شعارُك يُقصّ داخل مربّعٍ مستديرِ الأركان.",
    theLetter: "الحرف", fg: "لونُ الحرف", bg: "لونُ الخلفيّة",
    radius: (n: number) => `استدارةُ الأركان: ${n}%`, pad: (n: number) => `الحشو: ${n}%`,
    sizes: "المقاسات", downloadAll: "نزّلها كلَّها", download: "نزّل",
    siteName: "اسمُ الموقع", head: "ضعها في <head>",
    n1: "المتصفّحاتُ الحديثةُ تقبل ", n2: " مباشرةً، ولم يعد ", n3: " لازماً إلّا لمتصفّحاتٍ قديمةٍ جدّاً — ولذلك لا تولّد هذه الأداةُ صيغةَ ICO. وأيقونةُ ٥١٢ ليست ترفاً:",
    b: " منها تُبنى شاشةُ الإقلاع", n4: " حين يُضاف موقعُك إلى شاشة الهاتف.",
    defaultName: "موقعي",
  },
  en: {
    source: "Source", letter: "Letter", image: "Image",
    letterHint: "One or two letters on a coloured square — enough for a project without a logo yet.",
    imageHint: "Your logo is clipped inside a rounded square.",
    theLetter: "Letter", fg: "Letter colour", bg: "Background colour",
    radius: (n: number) => `Corner radius: ${n}%`, pad: (n: number) => `Padding: ${n}%`,
    sizes: "Sizes", downloadAll: "Download all", download: "Download",
    siteName: "Site name", head: "Put these in <head>",
    n1: "Modern browsers accept ", n2: " directly, and ", n3: " is only needed by very old ones — which is why this tool does not produce ICO. The 512 icon is not a luxury:",
    b: " the splash screen is built from it", n4: " when your site is added to a phone's home screen.",
    defaultName: "My site",
  },
};

type Mode = "image" | "letter";

export default function Favicon() {
  const s = useStrings(S);
  const isEn = useLang() === "en";
  const { picked, error, pick } = useImagePicker();
  const [mode, setMode] = useState<Mode>("letter");
  const [letter, setLetter] = useState("د");
  const [bg, setBg] = useState("#3366cc");
  const [fg, setFg] = useState("#ffffff");
  const [radius, setRadius] = useState(22);
  const [pad, setPad] = useState(12);
  const [siteName, setSiteName] = useState("");
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
        label={s.source}
        value={mode}
        onChange={setMode}
        hint={mode === "letter" ? s.letterHint : s.imageHint}
        options={[{ id: "letter", label: s.letter }, { id: "image", label: s.image }]}
      />

      {mode === "image" ? (
        <>
          <ImagePicker id="fv-file" onPick={pick} picked={picked} />
          {error && <ErrorNote>{error}</ErrorNote>}
        </>
      ) : (
        <div className="flex flex-wrap gap-3">
          <Field label={s.theLetter} htmlFor="fv-l" className="min-w-32 flex-1">
            <TextField id="fv-l" value={letter} onChange={setLetter} placeholder="د" />
          </Field>
          <ColorField id="fv-fg" label={s.fg} value={fg} onChange={setFg} />
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <ColorField id="fv-bg" label={s.bg} value={bg} onChange={setBg} />
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <Field label={s.radius(radius)} htmlFor="fv-r" className="min-w-52 flex-1">
          <input id="fv-r" type="range" min={0} max={100} value={radius}
            onChange={(e) => setRadius(Number(e.target.value))} className="w-full accent-[var(--dk-primary)]" />
        </Field>
        <Field label={s.pad(pad)} htmlFor="fv-p" className="min-w-52 flex-1">
          <input id="fv-p" type="range" min={0} max={35} value={pad}
            onChange={(e) => setPad(Number(e.target.value))} className="w-full accent-[var(--dk-primary)]" />
        </Field>
      </div>

      {ready && previews.length > 0 && (
        <>
          <div className="rounded-m border border-line bg-surface">
            <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
              <span className="text-[0.78rem] font-bold tracking-wide text-primary">{s.sizes}</span>
              <button className="btn btn-ghost !px-3 !py-1 !text-[0.82rem] ms-auto" onClick={saveAll}>
                {s.downloadAll}
              </button>
            </div>
            <ul className="divide-y divide-line">
              {ICON_SIZES.map((s2) => {
                const p = previews.find((x) => x.size === s2.size);
                return (
                  <li key={s2.size} className="flex items-center gap-3 px-4 py-2.5">
                    {p?.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.url} alt="" width={Math.min(s2.size, 44)} height={Math.min(s2.size, 44)}
                        className="shrink-0 rounded-[4px]" />
                    )}
                    <span className="min-w-0">
                      <span dir="ltr" className="block font-mono text-[0.88rem] text-ink">{s2.size}×{s2.size}</span>
                      <span className="block text-[0.78rem] leading-tight text-muted">{isEn ? ICON_USE_EN[s2.size] ?? s2.use : s2.use}</span>
                    </span>
                    <button className="btn btn-ghost !px-3 !py-1 !text-[0.82rem] ms-auto shrink-0"
                      onClick={() => save(s2.size, s2.name)}>
                      {s.download}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <Field label={s.siteName} htmlFor="fv-name" className="max-w-72">
            <TextField id="fv-name" value={siteName} onChange={setSiteName} placeholder={s.defaultName} />
          </Field>

          <ResultBox title={s.head} value={iconHtml()} dir="ltr" mono />
          <ResultBox
            title="site.webmanifest"
            value={iconManifest(siteName || s.defaultName, parseColor(bg) ? toHex({ ...parseColor(bg)!, a: 1 }) : "#3366cc", "#ffffff")}
            dir="ltr"
            mono
          />
        </>
      )}

      <LocalNote />

      <Note>
        {s.n1}<code className="font-mono text-[0.85rem]">favicon-32x32.png</code>{s.n2}
        <code className="font-mono text-[0.85rem]">favicon.ico</code>{s.n3}
        <b className="font-semibold text-ink">{s.b}</b>{s.n4}
      </Note>
    </ToolLayout>
  );
}
