/**
 * تغطيةُ الترجمة — الفجواتُ فيها صامتةٌ بطبعها.
 *
 * اسمٌ لم يُترجَم لا يرمي خطأً ولا يظهر في مراجعةِ شيفرة: يُعرَض عربيّاً في
 * صفحةٍ إنكليزيّة، ولا يراه إلّا زائرٌ لا يشكو بل يغادر. فالفحصُ آليٌّ:
 * كلُّ معرّفٍ في بيانات المكتبات له نظيرٌ إنجليزيّ، وكلُّ أداةٍ تعلن
 * الإنجليزيّةَ تحمل نصوصَها كاملة.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { TOOLS } from "../tools/index.ts";
import { SIZE_TABLES, TEMP_UNITS, TIMEZONES, UNIT_FAMILIES } from "../tools/convert-lib.ts";
import { VAT_RATES } from "../tools/finance-lib.ts";
import { CITIES, METHODS, PRAYER_NAMES } from "../tools/prayer-times/calc.ts";
import { HARMONIES } from "../tools/color-lib.ts";
import { ICON_SIZES, OUTPUT_FORMATS } from "../tools/image-lib.ts";
import { PLATFORMS } from "../tools/text-lib.ts";
import {
  CITY_EN, FORMAT_EN, HARMONY_EN, ICON_USE_EN, METHOD_EN, PLATFORM_EN, PRAYER_EN,
  SIZE_TABLE_EN, TZ_EN, UNIT_EN, VAT_EN,
} from "../tools/names-en.ts";

const ROOT = path.join(import.meta.dirname, "..");

const covers = (label: string, ids: (string | number)[], map: Record<string | number, unknown>) => {
  const missing = ids.filter((id) => map[id] === undefined);
  assert.deepEqual(missing, [], `${label}: بلا ترجمة`);
};

test("أسماءُ الوحدات مغطّاةٌ بالإنجليزيّة", () => {
  covers("عائلاتُ الوحدات", UNIT_FAMILIES.map((f) => f.id), UNIT_EN);
  covers("الوحدات", UNIT_FAMILIES.flatMap((f) => f.units.map((u) => u.id)), UNIT_EN);
  covers("وحداتُ الحرارة", TEMP_UNITS.map((u) => u.id), UNIT_EN);
});

test("بياناتُ المكتبات الأخرى مغطّاة", () => {
  covers("المناطق الزمنيّة", TIMEZONES.map((t) => t.id), TZ_EN);
  covers("جداولُ المقاسات", SIZE_TABLES.map((t) => t.id), SIZE_TABLE_EN);
  covers("نسبُ الضريبة", VAT_RATES.map((v) => v.id), VAT_EN);
  covers("مدنُ المواقيت", CITIES.map((c) => c.id), CITY_EN);
  covers("طرقُ الحساب", METHODS.map((m) => m.id), METHOD_EN);
  covers("أسماءُ الصلوات", PRAYER_NAMES.map((p) => p.key), PRAYER_EN);
  covers("التناسقات", HARMONIES.map((h) => h.id), HARMONY_EN);
  covers("صيغُ الصور", OUTPUT_FORMATS.map((f) => f.id), FORMAT_EN);
  covers("مقاساتُ الأيقونة", ICON_SIZES.map((s) => s.size), ICON_USE_EN);
  covers("المنصّات", PLATFORMS.map((p) => p.id), PLATFORM_EN);
});

test("جداولُ المقاسات تحمل عددَ الأعمدة نفسَه بالإنجليزيّة", () => {
  for (const t of SIZE_TABLES) {
    assert.equal(SIZE_TABLE_EN[t.id].cols.length, t.cols.length, `${t.id}: عددُ الأعمدة يخالف`);
  }
});

test("كلُّ أداةٍ تعلن الإنجليزيّةَ تحمل نصوصَها", () => {
  for (const t of TOOLS) {
    if (!t.langs.includes("en")) continue;
    assert.notEqual(t.description.en, t.description.ar, `${t.slug}: وصفٌ عربيٌّ في الإنجليزيّة`);
    assert.ok(t.instructionsEn, `${t.slug}: بلا instructionsEn`);
    assert.ok(t.title.en.trim(), `${t.slug}: بلا اسمٍ إنجليزيّ`);
    assert.ok(t.keywordsEn.length >= 2, `${t.slug}: كلماتٌ مفتاحيّةٌ إنجليزيّةٌ قليلة`);
  }
});

/**
 * الأداةُ التي تعلن الإنجليزيّةَ يجب أن تكون قد استُبدلت نصوصُها بقاموس.
 * وأبسطُ دليلٍ آليٍّ على ذلك: استيرادُ `useStrings` في مكوّنها.
 */
test("مكوّنُ كلّ أداةٍ إنجليزيّةٍ يستعمل قاموسَ نصوص", () => {
  for (const t of TOOLS) {
    if (!t.langs.includes("en")) continue;
    const src = fs.readFileSync(path.join(ROOT, "tools", t.slug, "tool.tsx"), "utf8");
    assert.ok(
      src.includes("useStrings") || src.includes("useLang"),
      `${t.slug}: يعلن الإنجليزيّةَ ومكوّنُه بلا قاموس`,
    );
  }
});
