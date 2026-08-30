/**
 * اختباراتُ بنية المنصّة — تُشغَّل: npm test
 * لا إطارَ اختباراتٍ خارجيّاً؛ مُشغِّلُ node المدمج يكفي ويوفّر حزمةً في الصورة.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { TOOLS } from "../tools/index.ts";
import { categoryCounts, publishedTools, relatedTools, validateRegistry } from "../tools/registry.ts";
import { CATEGORIES } from "../tools/categories.ts";
import { normalizeAr, rankBrowse, searchTools } from "../lib/search.ts";

const ROOT = path.join(import.meta.dirname, "..");

test("السجلّ سليمٌ بنيويّاً", () => {
  assert.deepEqual(validateRegistry(TOOLS), []);
});

test("لكلّ أداةٍ مجلّدٌ ومكوّن", () => {
  for (const t of TOOLS) {
    const dir = path.join(ROOT, "tools", t.slug);
    assert.ok(fs.existsSync(dir), `${t.slug}: لا مجلّد`);
    assert.ok(fs.existsSync(path.join(dir, "tool.tsx")), `${t.slug}: لا tool.tsx`);
  }
});

test("تعريفُ الأداة يستورد مكوّنَها فعلاً (لا رابطَ ميّت)", () => {
  const src = fs.readFileSync(path.join(ROOT, "tools", "index.ts"), "utf8");
  for (const t of TOOLS) {
    assert.ok(src.includes(`@/tools/${t.slug}/tool`), `${t.slug}: مسارُ التحميل لا يطابق المعرّف`);
  }
});

test("عددُ الأدوات في كلّ تصنيفٍ يُشتقّ ولا يُكتب", () => {
  const counts = categoryCounts(TOOLS);
  const total = counts.reduce((s, c) => s + c.count, 0);
  assert.equal(total, publishedTools(TOOLS).length);
  for (const c of counts) {
    const subTotal = c.subs.reduce((s, x) => s + x.count, 0);
    assert.ok(subTotal <= c.count, `${c.id}: مجموعُ الفرعيّات يتجاوز التصنيف`);
  }
});

test("كلُّ تصنيفٍ فرعيٍّ يخصّ تصنيفَه", () => {
  for (const t of TOOLS) {
    if (!t.subcategory) continue;
    const cat = CATEGORIES.find((c) => c.id === t.category)!;
    assert.ok(
      cat.subcategories.some((s) => s.id === t.subcategory),
      `${t.slug}: «${t.subcategory}» ليس من فرعيّات «${t.category}»`,
    );
  }
});

test("البحثُ يجد الأداةَ باسمها وبكلمةٍ مفتاحيّةٍ وبنصٍّ مشكول", () => {
  const byName = searchTools(TOOLS, "تفقيط");
  assert.equal(byName[0]?.tool.slug, "number-to-words");

  const byKeyword = searchTools(TOOLS, "ايبان");
  assert.equal(byKeyword[0]?.tool.slug, "iban");

  const withDiacritics = searchTools(TOOLS, "الزَّكاة");
  assert.equal(withDiacritics[0]?.tool.slug, "zakat");

  const english = searchTools(TOOLS, "hijri");
  assert.equal(english[0]?.tool.slug, "hijri-gregorian");
});

test("البحثُ تقاطعيّ: كلمتان لا تُطابقان أداةً واحدةً تعطيان صفراً", () => {
  assert.equal(searchTools(TOOLS, "زكاة markdown").length, 0);
  assert.ok(searchTools(TOOLS, "تحويل الأرقام").length > 0);
});

test("توحيدُ العربيّة يسقط التشكيل ويوحّد الألف", () => {
  assert.equal(normalizeAr("الزَّكَاة"), normalizeAr("الزكاه"));
  assert.equal(normalizeAr("أحمد"), normalizeAr("احمد"));
  assert.equal(normalizeAr("٢٠٢٦"), "2026");
});

test("المفضّلةُ والشعبيّةُ ترجّحان الترتيب", () => {
  const favs = new Set(["iban"]);
  const ranked = rankBrowse(TOOLS, { favorites: favs, popularity: { zakat: 500 } });
  assert.equal(ranked[0].slug, "iban");
  const noFav = rankBrowse(TOOLS, { popularity: { zakat: 500 } });
  assert.equal(noFav[0].slug, "zakat");
});

test("الأدواتُ ذاتُ الصلة لا تتضمّن الأداةَ نفسَها، ولا تخلو إلّا لوحيدِ تصنيفه", () => {
  const live = publishedTools(TOOLS);
  for (const t of live) {
    const rel = relatedTools(TOOLS, t);
    assert.ok(!rel.some((r) => r.slug === t.slug), `${t.slug}: يقترح نفسَه`);
    const siblings = live.filter((x) => x.category === t.category && x.slug !== t.slug).length;
    if (siblings > 0) {
      assert.ok(rel.length > 0, `${t.slug}: له أخواتٌ في التصنيف ومع ذلك بلا صلة`);
      assert.ok(rel.every((r) => r.category === t.category || r.keywords.some((k) => t.keywords.includes(k))),
        `${t.slug}: اقتراحٌ بلا رابطِ تصنيفٍ ولا كلمة`);
    }
    // الوحيدُ في تصنيفه: الصفحةُ تعرض رابطَ تصفّحٍ بدلاً من قائمةٍ فارغة
  }
});

test("لا معرّفَ مكرّرٌ ولا اسمَ مكرّر", () => {
  const slugs = new Set<string>();
  const titles = new Set<string>();
  for (const t of TOOLS) {
    assert.ok(!slugs.has(t.slug), `معرّفٌ مكرّر: ${t.slug}`);
    assert.ok(!titles.has(t.title), `اسمٌ مكرّر: ${t.title}`);
    slugs.add(t.slug);
    titles.add(t.title);
  }
});

test("بيانات SEO كافيةٌ لكلّ أداة", () => {
  for (const t of publishedTools(TOOLS)) {
    assert.ok(t.description.length >= 20, `${t.slug}: وصفٌ قصيرٌ جدّاً للفهرسة`);
    assert.ok(t.keywords.length >= 3, `${t.slug}: كلماتٌ مفتاحيّةٌ قليلة`);
    assert.ok(t.titleEn !== t.slug, `${t.slug}: بلا اسمٍ إنكليزيّ`);
  }
});
