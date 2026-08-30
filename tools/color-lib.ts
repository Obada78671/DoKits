/**
 * حسابُ الألوان — دوالُّ خالصةٌ قابلةٌ للاختبار.
 *
 * ‏OKLCH موجودٌ هنا لا استعراضاً: التدرّجُ في HSL يمرّ بمناطقَ باهتةٍ أو
 * موحلة لأنّ إضاءتَه حسابيّةٌ لا إدراكيّة، بينما OKLab مبنيٌّ على ما تراه
 * العين — فاللوحاتُ والتدرّجاتُ المولَّدةُ به تبدو متساويةَ الخطوات فعلاً.
 */

export type Rgb = { r: number; g: number; b: number; a: number };
export type Hsl = { h: number; s: number; l: number };
export type Oklch = { l: number; c: number; h: number };

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const round = (v: number, d = 0) => { const p = 10 ** d; return Math.round(v * p) / p; };

/* ————— القراءة ————— */

const NAMED: Record<string, string> = {
  أبيض: "#ffffff", اسود: "#000000", أسود: "#000000", احمر: "#ff0000", أحمر: "#ff0000",
  اخضر: "#008000", أخضر: "#008000", ازرق: "#0000ff", أزرق: "#0000ff", اصفر: "#ffff00",
  أصفر: "#ffff00", برتقالي: "#ffa500", بنفسجي: "#800080", وردي: "#ffc0cb", رمادي: "#808080",
  بني: "#a52a2a", white: "#ffffff", black: "#000000", red: "#ff0000", green: "#008000",
  blue: "#0000ff", yellow: "#ffff00", orange: "#ffa500", purple: "#800080", pink: "#ffc0cb",
  gray: "#808080", grey: "#808080", brown: "#a52a2a", cyan: "#00ffff", magenta: "#ff00ff",
  transparent: "#00000000",
};

/** يقبل ما يكتبه الناسُ فعلاً: hex بأشكاله، وrgb/hsl بصيغتَيهما، واسماً عربيّاً أو إنكليزيّاً */
export function parseColor(input: string): Rgb | null {
  const raw = input.trim().toLowerCase();
  if (!raw) return null;
  const named = NAMED[raw] ?? NAMED[input.trim()];
  if (named) return parseColor(named);

  const hex = raw.startsWith("#") ? raw.slice(1) : /^[0-9a-f]{3,8}$/.test(raw) ? raw : null;
  if (hex && /^[0-9a-f]+$/.test(hex)) {
    const x = (i: number, n = 1) => parseInt(n === 1 ? hex[i].repeat(2) : hex.slice(i, i + 2), 16);
    if (hex.length === 3) return { r: x(0), g: x(1), b: x(2), a: 1 };
    if (hex.length === 4) return { r: x(0), g: x(1), b: x(2), a: round(x(3) / 255, 3) };
    if (hex.length === 6) return { r: x(0, 2), g: x(2, 2), b: x(4, 2), a: 1 };
    if (hex.length === 8) return { r: x(0, 2), g: x(2, 2), b: x(4, 2), a: round(x(6, 2) / 255, 3) };
    return null;
  }

  const nums = (s: string): string[] => Array.from(s.match(/-?[\d.]+%?/g) ?? []);
  if (raw.startsWith("rgb")) {
    const p = nums(raw);
    if (p.length < 3) return null;
    const v = (i: number) => (p[i].endsWith("%") ? (parseFloat(p[i]) / 100) * 255 : parseFloat(p[i]));
    const a = p[3] === undefined ? 1 : p[3].endsWith("%") ? parseFloat(p[3]) / 100 : parseFloat(p[3]);
    if ([v(0), v(1), v(2), a].some(Number.isNaN)) return null;
    return { r: clamp(Math.round(v(0)), 0, 255), g: clamp(Math.round(v(1)), 0, 255), b: clamp(Math.round(v(2)), 0, 255), a: clamp(a) };
  }
  if (raw.startsWith("hsl")) {
    const p = nums(raw);
    if (p.length < 3) return null;
    const h = parseFloat(p[0]), s = parseFloat(p[1]) / 100, l = parseFloat(p[2]) / 100;
    const a = p[3] === undefined ? 1 : p[3].endsWith("%") ? parseFloat(p[3]) / 100 : parseFloat(p[3]);
    if ([h, s, l, a].some(Number.isNaN)) return null;
    return { ...hslToRgb({ h, s: clamp(s), l: clamp(l) }), a: clamp(a) };
  }
  return null;
}

/* ————— الصيغ ————— */

const h2 = (n: number) => Math.round(n).toString(16).padStart(2, "0");

export function toHex({ r, g, b, a }: Rgb): string {
  const base = `#${h2(r)}${h2(g)}${h2(b)}`;
  return a >= 1 ? base : `${base}${h2(a * 255)}`;
}

export const toRgbString = ({ r, g, b, a }: Rgb): string =>
  a >= 1 ? `rgb(${r} ${g} ${b})` : `rgb(${r} ${g} ${b} / ${round(a, 3)})`;

export function toHslString(c: Rgb): string {
  const { h, s, l } = rgbToHsl(c);
  const base = `hsl(${round(h)} ${round(s * 100)}% ${round(l * 100)}%`;
  return c.a >= 1 ? `${base})` : `${base} / ${round(c.a, 3)})`;
}

export function toOklchString(c: Rgb): string {
  const { l, c: ch, h } = rgbToOklch(c);
  const base = `oklch(${round(l * 100, 1)}% ${round(ch, 3)} ${round(h, 1)}`;
  return c.a >= 1 ? `${base})` : `${base} / ${round(c.a, 3)})`;
}

/* ————— HSL ————— */

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const [rr, gg, bb] = [r / 255, g / 255, b / 255];
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === rr) h = ((gg - bb) / d) % 6;
  else if (max === gg) h = (bb - rr) / d + 2;
  else h = (rr - gg) / d + 4;
  h *= 60;
  return { h: h < 0 ? h + 360 : h, s, l };
}

export function hslToRgb({ h, s, l }: Hsl): { r: number; g: number; b: number } {
  const hh = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = l - c / 2;
  const t: [number, number, number] =
    hh < 60 ? [c, x, 0] : hh < 120 ? [x, c, 0] : hh < 180 ? [0, c, x]
      : hh < 240 ? [0, x, c] : hh < 300 ? [x, 0, c] : [c, 0, x];
  return { r: Math.round((t[0] + m) * 255), g: Math.round((t[1] + m) * 255), b: Math.round((t[2] + m) * 255) };
}

/* ————— OKLab / OKLCH ————— */

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

export function rgbToOklch({ r, g, b }: Rgb): Oklch {
  const R = toLinear(r / 255), G = toLinear(g / 255), B = toLinear(b / 255);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const Bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.sqrt(A * A + Bb * Bb);
  let h = (Math.atan2(Bb, A) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c: C, h: C < 1e-6 ? 0 : h };
}

/** يعيد اللونَ مع علامةِ خروجه عن مدى الشاشة — فالقصُّ الصامتُ يكذب على المصمّم */
export function oklchToRgb({ l, c, h }: Oklch, alpha = 1): Rgb & { inGamut: boolean } {
  const rad = (h * Math.PI) / 180;
  const A = c * Math.cos(rad), B = c * Math.sin(rad);
  const l_ = (l + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m_ = (l - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s_ = (l - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const R = 4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
  const G = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
  const Bl = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_;
  const inGamut = [R, G, Bl].every((v) => v >= -0.0001 && v <= 1.0001);
  const enc = (v: number) => clamp(Math.round(toGamma(clamp(v)) * 255), 0, 255);
  return { r: enc(R), g: enc(G), b: enc(Bl), a: alpha, inGamut };
}

/**
 * تعيينُ لونٍ خارجَ مدى الشاشة إلى داخله **بخفض التشبّع** لا بقصّ القنوات.
 *
 * القصُّ يشوّه الصبغة: متتامُّ أزرقَ مشبعٍ خرج عن sRGB فقُصَّت قنواتُه فانحرفت
 * صبغتُه ١٥ درجةً — أي أنّ «المتتامّ» لم يعد متتامّاً. أمّا خفضُ التشبّع فيصون
 * الصبغةَ والإضاءةَ ويكتفي بتخفيف الحيويّة، وهو ما توصي به مواصفةُ CSS Color 4.
 */
export function gamutMapOklch(o: Oklch): Oklch {
  if (oklchToRgb(o).inGamut) return o;
  let lo = 0, hi = o.c;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (oklchToRgb({ ...o, c: mid }).inGamut) lo = mid; else hi = mid;
  }
  return { ...o, c: lo };
}

/** الصيغةُ المأمونةُ للاستعمال: تعطي لوناً تعرضه الشاشةُ فعلاً بصبغته الصحيحة */
export function oklchToSrgb(o: Oklch, alpha = 1): Rgb {
  const v = oklchToRgb(gamutMapOklch(o), alpha);
  return { r: v.r, g: v.g, b: v.b, a: v.a };
}

/* ————— التباين (WCAG 2.1) ————— */

export function luminance({ r, g, b }: Rgb): number {
  return 0.2126 * toLinear(r / 255) + 0.7152 * toLinear(g / 255) + 0.0722 * toLinear(b / 255);
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

export type ContrastVerdict = {
  ratio: number;
  aaNormal: boolean; aaaNormal: boolean; aaLarge: boolean; aaaLarge: boolean; uiComponent: boolean;
};

export function judgeContrast(fg: Rgb, bg: Rgb): ContrastVerdict {
  const ratio = contrastRatio(fg, bg);
  return {
    ratio: round(ratio, 2),
    aaNormal: ratio >= 4.5, aaaNormal: ratio >= 7,
    aaLarge: ratio >= 3, aaaLarge: ratio >= 4.5,
    uiComponent: ratio >= 3,
  };
}

/**
 * يزحزح إضاءةَ اللون في OKLCH حتّى يبلغ النسبةَ المطلوبة — فتبقى الصبغةُ
 * والتشبّعُ كما اختارهما المصمّم بدل أن يُستبدَل اللونُ بلونٍ آخرَ بالكلّيّة.
 */
export function fixContrast(fg: Rgb, bg: Rgb, target = 4.5): Rgb | null {
  if (contrastRatio(fg, bg) >= target) return fg;
  const base = rgbToOklch(fg);
  const bgLum = luminance(bg);
  // نجرّب الاتّجاهين ونأخذ الأقربَ إلى اللون الأصليّ
  const tries: { color: Rgb; dist: number }[] = [];
  for (const dir of [-1, 1]) {
    for (let step = 1; step <= 100; step++) {
      const l = clamp(base.l + dir * step * 0.01);
      const cand = oklchToSrgb({ ...base, l }, fg.a);
      if (contrastRatio(cand, bg) >= target) {
        tries.push({ color: cand, dist: step });
        break;
      }
      if (l === 0 || l === 1) break;
    }
  }
  if (!tries.length) return bgLum > 0.5 ? { r: 0, g: 0, b: 0, a: fg.a } : { r: 255, g: 255, b: 255, a: fg.a };
  return tries.sort((a, b) => a.dist - b.dist)[0].color;
}

/* ————— اللوحات ————— */

export type HarmonyId = "complement" | "analogous" | "triad" | "tetrad" | "mono";

export const HARMONIES: { id: HarmonyId; name: string; note: string }[] = [
  { id: "complement", name: "متتامّة", note: "لونٌ ومقابلُه على العجلة — أعلى تباينٍ صبغيّ." },
  { id: "analogous", name: "متجاورة", note: "ألوانٌ متلاصقةٌ على العجلة — هادئةٌ ومتناغمة." },
  { id: "triad", name: "ثلاثيّة", note: "ثلاثةٌ متباعدةٌ بالتساوي — حيويّةٌ ومتوازنة." },
  { id: "tetrad", name: "رباعيّة", note: "زوجان متتامّان — غنيّةٌ وتحتاج لوناً مسيطراً." },
  { id: "mono", name: "أحاديّة", note: "صبغةٌ واحدةٌ بإضاءاتٍ متدرّجة — الأسلمُ لواجهةٍ جادّة." },
];

/** الدورانُ في OKLCH لا في HSL: خطواتُ الإضاءة تبقى متساويةً في العين */
export function harmony(base: Rgb, kind: HarmonyId): Rgb[] {
  const o = rgbToOklch(base);
  const at = (dh: number, dl = 0) =>
    oklchToSrgb({ l: clamp(o.l + dl), c: o.c, h: (o.h + dh + 360) % 360 }, base.a);
  switch (kind) {
    case "complement": return [base, at(180)];
    case "analogous": return [at(-30), base, at(30)];
    case "triad": return [base, at(120), at(240)];
    case "tetrad": return [base, at(90), at(180), at(270)];
    case "mono": return [at(0, -0.24), at(0, -0.12), base, at(0, 0.12), at(0, 0.24)];
  }
}

/** سُلَّمٌ من ٥٠ إلى ٩٥٠ كسلالم أنظمة التصميم — الإضاءةُ تنزل بانتظامٍ إدراكيّ */
export const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

export function scale(base: Rgb): { step: number; color: Rgb }[] {
  const o = rgbToOklch(base);
  return SCALE_STEPS.map((step) => {
    // ٥٠ ← إضاءة ٠٫٩٧، ٩٥٠ ← ٠٫١٥، والتشبّعُ يخفّ عند الطرفين كما في السلالم الحقيقيّة
    const t = (step - 50) / 900;
    const l = 0.97 - t * 0.82;
    const c = o.c * (1 - Math.abs(t - 0.45) * 0.9);
    return { step, color: oklchToSrgb({ l, c: Math.max(0, c), h: o.h }, 1) };
  });
}

/* ————— التدرّجات ————— */

export type Stop = { color: Rgb; at: number };

/** المزجُ في OKLab يتجنّب «المنطقةَ الموحلة» التي يمرّ بها المزجُ في sRGB */
export function mixOklab(a: Rgb, b: Rgb, t: number): Rgb {
  const A = rgbToOklch(a), B = rgbToOklch(b);
  let dh = B.h - A.h;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  return oklchToSrgb(
    { l: A.l + (B.l - A.l) * t, c: A.c + (B.c - A.c) * t, h: (A.h + dh * t + 360) % 360 },
    a.a + (b.a - a.a) * t,
  );
}

export function gradientCss(stops: Stop[], kind: "linear" | "radial", angle: number, oklab: boolean): string {
  const list = [...stops].sort((x, y) => x.at - y.at)
    .map((s) => `${toHex(s.color)} ${round(s.at)}%`).join(", ");
  const space = oklab ? " in oklab" : "";
  return kind === "linear"
    ? `linear-gradient(${round(angle)}deg${space}, ${list})`
    : `radial-gradient(circle${space}, ${list})`;
}

/** عيّناتٌ محسوبةٌ في OKLab لمعاينةٍ صادقةٍ حتّى في متصفّحٍ لا يدعم `in oklab` */
export function gradientSamples(stops: Stop[], steps = 24): Stop[] {
  const s = [...stops].sort((x, y) => x.at - y.at);
  if (s.length < 2) return s;
  const out: Stop[] = [];
  for (let i = 0; i <= steps; i++) {
    const at = (i / steps) * 100;
    const hi = s.findIndex((p) => p.at >= at);
    if (hi <= 0) { out.push({ color: s[Math.max(0, hi)].color, at }); continue; }
    const lo = s[hi - 1], up = s[hi];
    const t = up.at === lo.at ? 0 : (at - lo.at) / (up.at - lo.at);
    out.push({ color: mixOklab(lo.color, up.color, t), at });
  }
  return out;
}
