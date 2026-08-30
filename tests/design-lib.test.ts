/**
 * اختباراتُ منطق أدوات التصميم. المعاييرُ هنا خارجيّةٌ لا مخترعة:
 * أرقامُ WCAG المنشورة، ونقاطُ OKLCH المعروفة، وتدويرُ الصيغ.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  contrastRatio, fixContrast, gradientCss, gradientSamples, harmony, hslToRgb, judgeContrast,
  luminance, mixOklab, oklchToRgb, parseColor, rgbToHsl, rgbToOklch, scale, toHex, toHslString,
  toOklchString, toRgbString,
} from "../tools/color-lib.ts";
import { ICON_SIZES, dominantColors, fitDimensions, iconManifest, outputName } from "../tools/image-lib.ts";

const rgb = (r: number, g: number, b: number, a = 1) => ({ r, g, b, a });
const near = (a: number, b: number, tol: number, msg?: string) =>
  assert.ok(Math.abs(a - b) <= tol, `${msg ?? ""} ${a} ≠ ${b} (±${tol})`);

/* ————— القراءة والصيغ ————— */

test("قراءةُ اللون تقبل كلَّ ما يكتبه الناس", () => {
  assert.deepEqual(parseColor("#f80"), rgb(255, 136, 0));
  assert.deepEqual(parseColor("#FF8800"), rgb(255, 136, 0));
  assert.deepEqual(parseColor("ff8800"), rgb(255, 136, 0));
  assert.deepEqual(parseColor("rgb(255, 136, 0)"), rgb(255, 136, 0));
  assert.deepEqual(parseColor("rgb(255 136 0 / 0.5)"), rgb(255, 136, 0, 0.5));
  assert.deepEqual(parseColor("أزرق"), rgb(0, 0, 255));
  assert.deepEqual(parseColor("white"), rgb(255, 255, 255));
  assert.equal(parseColor("ليس لوناً"), null);
  assert.equal(parseColor(""), null);
});

test("الشفافيّةُ في hex ذي ثماني خانات", () => {
  const c = parseColor("#ff880080");
  assert.equal(c?.r, 255);
  near(c!.a, 0.502, 0.002, "ألفا");
  assert.equal(toHex(c!), "#ff880080");
});

test("تدويرُ HSL يعود إلى اللون نفسِه", () => {
  for (const hex of ["#3366cc", "#ff8800", "#000000", "#ffffff", "#7f7f7f"]) {
    const c = parseColor(hex)!;
    const back = hslToRgb(rgbToHsl(c));
    assert.deepEqual({ ...back, a: 1 }, c, hex);
  }
});

test("الصيغُ النصّيّةُ تُكتب كما يكتبها CSS الحديث", () => {
  const c = parseColor("#3366cc")!;
  assert.equal(toRgbString(c), "rgb(51 102 204)");
  assert.equal(toHslString(c), "hsl(220 60% 50%)");
  assert.match(toOklchString(c), /^oklch\(\d/);
});

/* ————— OKLCH ————— */

test("OKLCH: الأبيضُ إضاءتُه ١ والأسودُ صفر، وكلاهما بلا تشبّع", () => {
  const w = rgbToOklch(rgb(255, 255, 255));
  near(w.l, 1, 0.001, "إضاءةُ الأبيض");
  near(w.c, 0, 0.001, "تشبّعُ الأبيض");
  const k = rgbToOklch(rgb(0, 0, 0));
  near(k.l, 0, 0.001, "إضاءةُ الأسود");
});

test("OKLCH: القيمُ المرجعيّةُ للأحمر الصريح", () => {
  // القيمُ المنشورةُ في مواصفة CSS Color 4 للأحمر sRGB
  const r = rgbToOklch(rgb(255, 0, 0));
  near(r.l, 0.6279, 0.001, "الإضاءة");
  near(r.c, 0.2577, 0.001, "التشبّع");
  near(r.h, 29.23, 0.1, "الصبغة");
});

test("OKLCH: التدويرُ ذهاباً وإياباً بلا انحراف", () => {
  for (const hex of ["#3366cc", "#ff8800", "#12b886", "#000000", "#ffffff"]) {
    const c = parseColor(hex)!;
    const back = oklchToRgb(rgbToOklch(c));
    assert.equal(toHex({ ...back, a: 1 }), hex, hex);
    assert.equal(back.inGamut, true, `${hex} يجب أن يكون داخل المدى`);
  }
});

test("OKLCH: ما يخرج عن مدى الشاشة يُعلَن لا يُقصّ بصمت", () => {
  const wild = oklchToRgb({ l: 0.7, c: 0.4, h: 150 }); // تشبّعٌ فوق ما تعرضه sRGB
  assert.equal(wild.inGamut, false);
});

/* ————— التباين ————— */

test("التباين: النسبُ المرجعيّةُ المعروفة", () => {
  const white = rgb(255, 255, 255), black = rgb(0, 0, 0);
  near(contrastRatio(white, black), 21, 0.001, "أبيض/أسود");
  near(contrastRatio(white, white), 1, 0.001, "لونٌ مع نفسِه");
  // الرماديُّ الويبيُّ #767676 على أبيض هو الحدُّ المشهورُ لـAA
  near(contrastRatio(parseColor("#767676")!, white), 4.54, 0.02, "الحدّ الشائع");
});

test("التباين: إضاءةُ الأبيض ١ وإضاءةُ الأسود صفر", () => {
  near(luminance(rgb(255, 255, 255)), 1, 1e-9);
  near(luminance(rgb(0, 0, 0)), 0, 1e-9);
});

test("التباين: الحكمُ على عتبات WCAG الصحيحة", () => {
  const v = judgeContrast(parseColor("#767676")!, rgb(255, 255, 255));
  assert.equal(v.aaNormal, true, "٤٫٥ يمرّ AA للنصّ العاديّ");
  assert.equal(v.aaaNormal, false, "لا يبلغ ٧");
  assert.equal(v.aaLarge, true);
  const weak = judgeContrast(parseColor("#aaaaaa")!, rgb(255, 255, 255));
  assert.equal(weak.aaNormal, false);
  assert.equal(weak.uiComponent, false, "٢٫٣ لا يكفي حتّى لعنصر واجهة");
});

test("إصلاحُ التباين يبلغ الهدفَ ويحفظ الصبغة", () => {
  const bg = rgb(255, 255, 255);
  const fg = parseColor("#8ab4f8")!;
  const before = rgbToOklch(fg);
  const fixed = fixContrast(fg, bg, 4.5)!;
  assert.ok(contrastRatio(fixed, bg) >= 4.5, "لم يبلغ الهدف");
  near(rgbToOklch(fixed).h, before.h, 2, "الصبغةُ يجب أن تبقى");
});

test("إصلاحُ التباين لا يمسّ لوناً ناجحاً أصلاً", () => {
  const bg = rgb(255, 255, 255), fg = rgb(0, 0, 0);
  assert.deepEqual(fixContrast(fg, bg, 4.5), fg);
});

/* ————— اللوحات ————— */

test("اللوحاتُ تعطي العددَ الصحيحَ وتبدأ باللون المُدخل", () => {
  const base = parseColor("#3366cc")!;
  assert.equal(harmony(base, "complement").length, 2);
  assert.equal(harmony(base, "analogous").length, 3);
  assert.equal(harmony(base, "triad").length, 3);
  assert.equal(harmony(base, "tetrad").length, 4);
  assert.equal(harmony(base, "mono").length, 5);
  assert.deepEqual(harmony(base, "triad")[0], base);
});

test("المتتامُّ يبعد ١٨٠ درجةً في الصبغة", () => {
  const base = parseColor("#3366cc")!;
  const [, comp] = harmony(base, "complement");
  const d = Math.abs(rgbToOklch(base).h - rgbToOklch(comp).h);
  near(Math.min(d, 360 - d), 180, 2);
});

test("السُّلَّمُ يتدرّج من الأفتح إلى الأغمق بلا انتكاس", () => {
  const s = scale(parseColor("#3366cc")!);
  assert.equal(s.length, 11);
  const lums = s.map((x) => luminance(x.color));
  for (let i = 1; i < lums.length; i++) {
    assert.ok(lums[i] < lums[i - 1], `الخطوة ${s[i].step} ليست أغمقَ ممّا قبلها`);
  }
});

/* ————— التدرّجات ————— */

test("المزجُ عند الطرفين يعطي الطرفين", () => {
  const a = parseColor("#ff0000")!, b = parseColor("#0000ff")!;
  assert.deepEqual(mixOklab(a, b, 0), a);
  assert.deepEqual(mixOklab(a, b, 1), b);
});

test("المزجُ في OKLab لا يمرّ بالمنطقة الموحلة", () => {
  const a = parseColor("#0000ff")!, b = parseColor("#ffff00")!;
  const mid = mixOklab(a, b, 0.5);
  // المزجُ الساذجُ في sRGB يعطي رماديّاً باهتاً (~#7f7f7f)؛ OKLab يبقي تشبّعاً معتبَراً
  assert.ok(rgbToOklch(mid).c > 0.05, `التشبّعُ انهار: ${toHex(mid)}`);
});

test("نصُّ CSS للتدرّج يُرتّب المحطّاتِ ويعلن فضاءَ المزج", () => {
  const stops = [
    { color: parseColor("#0000ff")!, at: 100 },
    { color: parseColor("#ff0000")!, at: 0 },
  ];
  assert.equal(gradientCss(stops, "linear", 90, false), "linear-gradient(90deg, #ff0000 0%, #0000ff 100%)");
  assert.match(gradientCss(stops, "linear", 90, true), /in oklab/);
  assert.match(gradientCss(stops, "radial", 90, false), /^radial-gradient\(circle,/);
});

test("عيّناتُ المعاينة تغطّي المدى كاملاً", () => {
  const stops = [{ color: parseColor("#ff0000")!, at: 0 }, { color: parseColor("#0000ff")!, at: 100 }];
  const s = gradientSamples(stops, 10);
  assert.equal(s.length, 11);
  assert.equal(toHex(s[0].color), "#ff0000");
  assert.equal(toHex(s[10].color), "#0000ff");
});

/* ————— الصور ————— */

test("الأبعادُ تصون النسبةَ ولا تكبّر فوق الأصل", () => {
  const src = { w: 1600, h: 900 };
  assert.deepEqual(fitDimensions(src, { w: 800 }, "width"), { w: 800, h: 450 });
  assert.deepEqual(fitDimensions(src, { h: 450 }, "height"), { w: 800, h: 450 });
  assert.deepEqual(fitDimensions(src, { w: 800, h: 800 }, "contain"), { w: 800, h: 450 });
  // تكبيرٌ مرفوضٌ افتراضيّاً
  assert.deepEqual(fitDimensions(src, { w: 3200 }, "width"), src);
  assert.deepEqual(fitDimensions(src, { w: 3200 }, "width", true), { w: 3200, h: 1800 });
});

test("الأبعادُ لا تهبط إلى الصفر", () => {
  assert.deepEqual(fitDimensions({ w: 1000, h: 10 }, { w: 5 }, "width"), { w: 5, h: 1 });
});

test("اسمُ الملفّ الناتج يحمل الأبعادَ ويبدّل الامتداد", () => {
  assert.equal(outputName("شعار.png", { w: 800, h: 450 }, "webp"), "شعار-800x450.webp");
  assert.equal(outputName("", { w: 1, h: 1 }, "png"), "صورة-1x1.png");
});

test("الألوانُ السائدةُ تُستخرج مرتّبةً بالنصيب", () => {
  // ستّةُ بكسلاتٍ: أربعةٌ حمراء، اثنان زرقاوان
  const px = new Uint8ClampedArray([
    255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255,
    0, 0, 255, 255, 0, 0, 255, 255,
  ]);
  const out = dominantColors(px, 4);
  assert.equal(out.length, 2);
  assert.deepEqual(out[0].color, rgb(255, 0, 0));
  near(out[0].share, 66.7, 0.2, "نصيبُ الأحمر");
  assert.deepEqual(out[1].color, rgb(0, 0, 255));
});

test("الألوانُ السائدةُ تتجاهل الشفّافَ ولا تنهار على صورةٍ فارغة", () => {
  const clear = new Uint8ClampedArray([255, 0, 0, 0, 0, 255, 0, 10]);
  assert.deepEqual(dominantColors(clear, 4), []);
});

test("مقاساتُ الأيقونة وبيانُ التطبيق سليمان", () => {
  assert.ok(ICON_SIZES.some((s) => s.size === 180), "لا مقاسَ أيقونةِ آبل");
  assert.ok(ICON_SIZES.some((s) => s.size === 512), "لا مقاسَ ٥١٢");
  const m = JSON.parse(iconManifest("حقيبتي", "#123456", "#ffffff"));
  assert.equal(m.name, "حقيبتي");
  assert.equal(m.icons.length, 2);
  assert.equal(m.display, "standalone");
});
