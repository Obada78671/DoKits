/**
 * جداولُ الأمثلة في صفحات الأدوات تُعاد حوسبتُها هنا من المكتبات نفسِها.
 *
 * جداولُ المرجعِ في مواقع الأدوات تُكتب باليد، فتنجو من كلِّ تغييرٍ لاحقٍ في
 * الحساب وتبقى معروضةً وهي كاذبة. وهذا الاختبارُ يمنع ذلك بنيويّاً: أيُّ
 * تعديلٍ في دالّةٍ يخالف ما هو معروضٌ يُسقِط البناءَ قبل النشر.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { TOOLS } from "../tools/index.ts";
import { money, vat } from "../tools/finance-lib.ts";
import { readPlain } from "../tools/number-to-words/convert.ts";
import { UNIT_FAMILIES, convertTemp, convertUnit, fmt } from "../tools/convert-lib.ts";
import { entropyBits, parseCron, strengthLabel, toBase64 } from "../tools/dev-lib.ts";
import {
  judgeContrast, parseColor, toHslString, toOklchString, toRgbString,
} from "../tools/color-lib.ts";

const rowsOf = (slug: string): string[][] => {
  const t = TOOLS.find((x) => x.slug === slug);
  assert.ok(t, `لا أداةَ باسم ${slug}`);
  assert.ok(t.examples, `${slug}: بلا جدول أمثلة`);
  return t.examples.rows;
};

test("جدولُ الضريبة يطابق ما تحسبه الأداة", () => {
  const expected = [
    ["إضافة", 1000, 15], ["استخراج", 1000, 15],
    ["إضافة", 1000, 5], ["استخراج", 1000, 5],
    ["إضافة", 2500, 14], ["استخراج", 2500, 14],
  ] as const;
  const rows = rowsOf("vat");
  assert.equal(rows.length, expected.length);
  expected.forEach(([kind, amount, rate], i) => {
    const r = vat(amount, rate, kind === "إضافة" ? "add" : "extract");
    assert.equal(rows[i][2], money(r.net), `${kind} ${rate}٪: الصافي`);
    assert.equal(rows[i][3], money(r.vat), `${kind} ${rate}٪: الضريبة`);
    assert.equal(rows[i][4], money(r.gross), `${kind} ${rate}٪: الإجمالي`);
  });
});

test("جدولُ التفقيط يطابق ما تحسبه الأداة", () => {
  for (const row of rowsOf("number-to-words")) {
    const r = readPlain(row[0]);
    assert.ok("ar" in r, `${row[0]}: تعذّر التفقيط`);
    assert.equal(row[1], r.ar, `${row[0]}: العربيّة`);
    assert.equal(row[2], r.en, `${row[0]}: الإنكليزيّة`);
  }
});

test("جدولُ الوحدات يطابق ما تحسبه الأداة", () => {
  const fam = (id: string) => UNIT_FAMILIES.find((f) => f.id === id)!;
  const conv = (famId: string, from: string, to: string, v: number) => {
    const f = fam(famId);
    return `${fmt(convertUnit(v, f.units.find((u) => u.id === from)!, f.units.find((u) => u.id === to)!))} ${to}`;
  };
  const expected = [
    conv("length", "m", "ft", 1), conv("length", "in", "cm", 1),
    conv("length", "mi", "km", 1), conv("length", "km", "mi", 100),
    conv("mass", "kg", "lb", 1), conv("mass", "kg", "lb", 70),
    `${fmt(convertTemp(0, "c", "f"), 4)} °F`,
    `${fmt(convertTemp(37, "c", "f"), 4)} °F`,
    `${fmt(convertTemp(100, "c", "f"), 4)} °F`,
  ];
  const rows = rowsOf("units");
  assert.equal(rows.length, expected.length);
  rows.forEach((r, i) => assert.equal(r[1], expected[i], r[0]));
});

test("جدولُ Base64 يطابق ما تحسبه الأداة", () => {
  for (const [text, encoded] of rowsOf("base64")) {
    assert.equal(encoded, toBase64(text), text);
  }
});

test("جدولُ الألوان يطابق ما تحسبه الأداة", () => {
  for (const [hex, rgb, hsl, oklch] of rowsOf("color-convert")) {
    const c = parseColor(hex);
    assert.ok(c, `${hex}: لم يُقرأ`);
    assert.equal(rgb, toRgbString(c), `${hex}: RGB`);
    assert.equal(hsl, toHslString(c), `${hex}: HSL`);
    assert.equal(oklch, toOklchString(c), `${hex}: OKLCH`);
  }
});

test("جدولُ التباين يطابق ما تحسبه الأداة", () => {
  const pairs = [
    ["#000000", "#ffffff"], ["#ffffff", "#1a1a1a"], ["#3366cc", "#ffffff"],
    ["#767676", "#ffffff"], ["#ffb020", "#ffffff"],
  ] as const;
  const rows = rowsOf("contrast");
  assert.equal(rows.length, pairs.length);
  pairs.forEach(([fg, bg], i) => {
    const v = judgeContrast(parseColor(fg)!, parseColor(bg)!);
    assert.equal(rows[i][1], `${v.ratio.toFixed(2)}:1`, `${fg} على ${bg}`);
    // الحكمُ المعروضُ يجب أن يوافق العتبةَ المحسوبة
    const verdict = rows[i][2];
    if (verdict.includes("AAA")) assert.ok(v.aaaNormal, `${fg}: يُعلَن AAA ولا يبلغه`);
    else if (verdict.includes("AA")) assert.ok(v.aaNormal && !v.aaaNormal, `${fg}: حكمُ AA لا يطابق`);
    else assert.ok(!v.aaLarge, `${fg}: يُعلَن ساقطاً وهو يمرّ`);
  });
});

test("جدولُ cron يطابق ما يشرحه المحلّل", () => {
  for (const [expr, text] of rowsOf("cron-explain")) {
    const r = parseCron(expr);
    assert.ok(r.ok, `${expr}: لم يُحلَّل`);
    assert.equal(text, r.text, expr);
  }
});

test("جدولُ كلمات المرور يطابق حسابَ العشوائيّة", () => {
  const POOL = 94; // ٢٦+٢٦+١٠+٣٢ رمزاً — البركةُ الكاملة
  for (const [len, bits, verdict] of rowsOf("password-gen")) {
    const n = Number(len.match(/\d+/)![0]);
    const expected = entropyBits(POOL, n);
    assert.equal(bits, `${expected} بتّاً`, `${len}: العشوائيّة`);
    assert.ok(strengthLabel(expected).label.startsWith(verdict.slice(0, 6)), `${len}: الحكم`);
  }
});

test("كلُّ جدولِ أمثلةٍ متّسقُ الأعمدة", () => {
  for (const t of TOOLS) {
    if (!t.examples) continue;
    for (const [i, row] of t.examples.rows.entries()) {
      assert.equal(row.length, t.examples.columns.length, `${t.slug}: الصفُّ ${i + 1} لا يطابق عددَ الأعمدة`);
    }
  }
});
