/**
 * منطقُ أدوات الصور — الجزءُ الخالصُ منه فقط.
 * الرسمُ نفسُه يجري على canvas في المتصفّح، فلا تُرفَع صورةٌ إلى أيّ خادم.
 */

import type { Rgb } from "@/tools/color-lib";

export type Dim = { w: number; h: number };
export type FitMode = "contain" | "width" | "height" | "exact";

/** الأبعادُ الناتجةُ مع صونِ النسبة — ولا تكبيرَ فوق الأصل إلّا بطلبٍ صريح */
export function fitDimensions(src: Dim, target: Partial<Dim>, mode: FitMode, allowUpscale = false): Dim {
  const ratio = src.w / src.h;
  let w = src.w, h = src.h;
  if (mode === "exact" && target.w && target.h) { w = target.w; h = target.h; }
  else if (mode === "width" && target.w) { w = target.w; h = Math.round(target.w / ratio); }
  else if (mode === "height" && target.h) { h = target.h; w = Math.round(target.h * ratio); }
  else if (mode === "contain" && (target.w || target.h)) {
    const mw = target.w ?? Infinity, mh = target.h ?? Infinity;
    const k = Math.min(mw / src.w, mh / src.h);
    w = Math.round(src.w * k); h = Math.round(src.h * k);
  }
  if (!allowUpscale && (w > src.w || h > src.h)) return { ...src };
  return { w: Math.max(1, w), h: Math.max(1, h) };
}

export const OUTPUT_FORMATS = [
  { id: "image/webp", name: "WebP", ext: "webp", lossy: true, note: "الأصغرُ حجماً بجودةٍ مماثلة — مدعومٌ في كلّ متصفّحٍ حديث." },
  { id: "image/jpeg", name: "JPEG", ext: "jpg", lossy: true, note: "الأوسعُ توافقاً، ولا شفافيّةَ فيه." },
  { id: "image/png", name: "PNG", ext: "png", lossy: false, note: "بلا فقدٍ ومع شفافيّة — الأكبرُ حجماً للصور الفوتوغرافيّة." },
] as const;

export type FormatId = (typeof OUTPUT_FORMATS)[number]["id"];

export function outputName(original: string, dim: Dim, ext: string): string {
  const stem = original.replace(/\.[^.]+$/, "") || "صورة";
  return `${stem}-${dim.w}x${dim.h}.${ext}`;
}

/* ————— استخراجُ الألوان ————— */

/**
 * تجميعٌ في مكعّباتٍ من ٣٢ درجةً ثمّ فرزٌ بالتكرار.
 *
 * لماذا لا k-means: النتيجةُ هنا تُعرَض للعين لا تُقاس، والتجميعُ الشبكيُّ
 * حتميٌّ وسريعٌ ويعطي الألوانَ السائدةَ نفسَها — بينما k-means يبدّل نتيجتَه
 * بين تشغيلٍ وآخرَ لاعتماده على بذرةٍ عشوائيّة، وذلك مربكٌ في أداةٍ تفاعليّة.
 */
export function dominantColors(
  pixels: Uint8ClampedArray, count = 6, minAlpha = 128,
): { color: Rgb; share: number }[] {
  const bins = new Map<number, { r: number; g: number; b: number; n: number }>();
  let total = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < minAlpha) continue;
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
    const key = ((r >> 5) << 10) | ((g >> 5) << 5) | (b >> 5);
    const cur = bins.get(key);
    if (cur) { cur.r += r; cur.g += g; cur.b += b; cur.n++; }
    else bins.set(key, { r, g, b, n: 1 });
    total++;
  }
  if (!total) return [];
  return [...bins.values()]
    .sort((a, b) => b.n - a.n)
    .slice(0, count)
    .map((v) => ({
      color: { r: Math.round(v.r / v.n), g: Math.round(v.g / v.n), b: Math.round(v.b / v.n), a: 1 },
      share: Math.round((v.n / total) * 1000) / 10,
    }));
}

/* ————— الأيقونات ————— */

export type IconSpec = { size: number; name: string; use: string };

export const ICON_SIZES: IconSpec[] = [
  { size: 16, name: "favicon-16x16.png", use: "لسانُ المتصفّح" },
  { size: 32, name: "favicon-32x32.png", use: "لسانٌ عالي الكثافة والمفضّلة" },
  { size: 48, name: "favicon-48x48.png", use: "اختصارُ سطح المكتب في ويندوز" },
  { size: 180, name: "apple-touch-icon.png", use: "شاشةُ iPhone وiPad الرئيسة" },
  { size: 192, name: "icon-192.png", use: "أندرويد وبيانُ التطبيق" },
  { size: 512, name: "icon-512.png", use: "شاشةُ الإقلاع ومتاجرُ التطبيقات" },
];

export const iconHtml = (): string =>
  [
    '<link rel="icon" href="/favicon.ico" sizes="32x32">',
    '<link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16">',
    '<link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32">',
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
    '<link rel="manifest" href="/site.webmanifest">',
  ].join("\n");

export const iconManifest = (name: string, themeColor: string, bg: string): string =>
  JSON.stringify(
    {
      name,
      short_name: name,
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      theme_color: themeColor,
      background_color: bg,
      display: "standalone",
    },
    null,
    2,
  );
