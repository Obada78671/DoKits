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
    if (!t.subcategoryId) continue;
    const cat = CATEGORIES.find((c) => c.id === t.categoryId)!;
    assert.ok(
      cat.subcategories.some((s) => s.id === t.subcategoryId),
      `${t.slug}: «${t.subcategoryId}» ليس من فرعيّات «${t.categoryId}»`,
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
    const siblings = live.filter((x) => x.categoryId === t.categoryId && x.slug !== t.slug).length;
    if (siblings > 0) {
      assert.ok(rel.length > 0, `${t.slug}: له أخواتٌ في التصنيف ومع ذلك بلا صلة`);
      assert.ok(rel.every((r) => r.categoryId === t.categoryId || r.keywords.some((k) => t.keywords.includes(k))),
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
    assert.ok(!titles.has(t.title.ar), `اسمٌ مكرّر: ${t.title.ar}`);
    slugs.add(t.slug);
    titles.add(t.title.ar);
  }
});

test("بيانات SEO كافيةٌ لكلّ أداة", () => {
  for (const t of publishedTools(TOOLS)) {
    assert.ok(t.description.ar.length >= 20, `${t.slug}: وصفٌ قصيرٌ جدّاً للفهرسة`);
    assert.ok(t.keywords.length >= 3, `${t.slug}: كلماتٌ مفتاحيّةٌ قليلة`);
    assert.ok(t.title.en !== t.slug, `${t.slug}: بلا اسمٍ إنكليزيّ`);
  }
});

/* ————— عقدُ البيان الموسَّع ————— */

test("البيانُ يستوفي العقد: مسارٌ وقدراتٌ وخصوصيّةٌ وSEO", () => {
  for (const t of TOOLS) {
    assert.equal(t.id, t.slug, `${t.slug}: المعرّف يخالف الرابط`);
    assert.equal(t.route, `/tools/${t.slug}`);
    assert.equal(t.seo.canonicalPath, t.route);
    assert.ok(t.seo.title && t.seo.description, `${t.slug}: SEO ناقص`);
    assert.ok(["draft", "beta", "published", "archived"].includes(t.status));
    assert.ok(["basic", "medium", "advanced"].includes(t.complexity));
    assert.ok(["public", "authenticated", "premium"].includes(t.visibility));
    assert.ok(["local", "server", "hybrid"].includes(t.privacy.processing));
    assert.equal(typeof t.capabilities.copyResult, "boolean");
    assert.ok(t.component.length > 0, `${t.slug}: بلا اسم مكوّن`);
  }
});

test("كلُّ الأدوات تحسب محلّيّاً ولا تحفظ مدخلاتِ المستخدم", () => {
  for (const t of TOOLS) {
    assert.equal(t.privacy.processing, "local", `${t.slug}: يزعم حساباً على الخادم`);
    assert.equal(t.privacy.storesUserData, false, `${t.slug}: يزعم حفظَ بيانات`);
  }
});

test("المرادفاتُ تصل بين ما يكتبه الناسُ وما نسمّيه", () => {
  assert.equal(searchTools(TOOLS, "VAT")[0]?.tool.slug, "vat");
  assert.equal(searchTools(TOOLS, "قيمة مضافة")[0]?.tool.slug, "vat");
  assert.equal(searchTools(TOOLS, "المبلغ بالحروف")[0]?.tool.slug, "number-to-words");
  assert.equal(searchTools(TOOLS, "باسورد").length, 0, "لا أداةَ كلمات مرور بعد — المرادفُ لا يخترع نتيجة");
});

test("الروابطُ القديمة لم تنكسر: كلُّ أداةٍ ما تزال على /tools/<slug>", () => {
  const legacy = ["word-counter", "number-to-words", "hijri-gregorian"];
  for (const slug of legacy) {
    const t = TOOLS.find((x) => x.slug === slug);
    assert.ok(t, `${slug}: اختفت`);
    assert.equal(t!.route, `/tools/${slug}`);
  }
});

/* ————— طبقةُ النيّة والمهامّ والمسارات ————— */

test("النيّةُ تصل بالسؤال العامّيّ إلى الأداة الصحيحة", async () => {
  const { matchIntents } = await import("../lib/intents.ts");
  const cases: [string, string][] = [
    ["كم أربح من المنتج؟", "pricing"],
    ["ابغى احسب الضريبه", "vat"],
    ["بدي اعمل فاتورة", "invoice"],
    ["حوّل هذا التاريخ للهجري", "hijri-gregorian"],
    ["كم القسط الشهري؟", "loan"],
    ["أريد تحويل مبلغ إلى كلمات", "number-to-words"],
    ["كتبت واللغة خطأ", "keyboard-fix"],
  ];
  for (const [q, slug] of cases) {
    const m = matchIntents(q);
    assert.equal(m[0]?.intent.toolSlug, slug, `«${q}» → ${m[0]?.intent.toolSlug ?? "لا شيء"}`);
  }
});

test("كلُّ نيّةٍ تشير إلى أداةٍ منشورة، ولكلٍّ سببٌ وجواب", async () => {
  const { INTENTS } = await import("../lib/intents.ts");
  const live = new Set(publishedTools(TOOLS).map((t) => t.slug));
  for (const i of INTENTS) {
    assert.ok(live.has(i.toolSlug), `النيّة «${i.id}» تشير إلى أداةٍ غير منشورة`);
    assert.ok(i.reason.trim() && i.answer.trim(), `النيّة «${i.id}» بلا سببٍ أو جواب`);
    assert.ok(i.phrases.length >= 3, `النيّة «${i.id}» بعباراتٍ قليلة`);
  }
});

test("المهامُّ والمساراتُ لا تشير إلى أداةٍ غير موجودة", async () => {
  const { TASKS, WORKFLOWS } = await import("../tools/tasks.ts");
  const live = new Set(publishedTools(TOOLS).map((t) => t.slug));
  for (const t of TASKS) {
    assert.ok(t.tools.length > 0, `المهمّة «${t.id}» بلا أدوات`);
    for (const s of t.tools) assert.ok(live.has(s), `المهمّة «${t.id}» تشير إلى «${s}»`);
  }
  for (const w of WORKFLOWS) {
    assert.ok(w.steps.length >= 2, `المسار «${w.id}» بخطوةٍ واحدة`);
    for (const st of w.steps) assert.ok(live.has(st.toolSlug), `المسار «${w.id}» يشير إلى «${st.toolSlug}»`);
  }
});

test("البحثُ يتسامح مع خطأٍ مطبعيٍّ واحد", () => {
  assert.equal(searchTools(TOOLS, "الزكاه")[0]?.tool.slug, "zakat");
  assert.ok(searchTools(TOOLS, "فاتوره").length > 0);
});
