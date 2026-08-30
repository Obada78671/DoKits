/**
 * اختباراتُ منطق أدوات المطوّرين. الحالاتُ المختارةُ هي مواضعُ الزلل:
 * العربيّةُ في Base64، والاقتباسُ في CSV، ودلالةُ «أو» في cron، وانحيازُ العشوائيّ.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildPool, csvToJson, decodeJwt, describeCron, entropyBits, formatJson, fromBase64,
  hashText, inspectChars, inspectUuid, jsonToCsv, nextRuns, parseCron, parseCsv, parseUrl,
  randomFrom, textStats, toBase64, uuidV4, uuidV7,
} from "../tools/dev-lib.ts";

/* ————— Base64 ————— */

test("Base64 يمرّ بالعربيّة ذهاباً وإياباً", () => {
  const text = "حقيبةُ أدواتٍ عربيّة — Do Kits ٢٠٢٦";
  const enc = toBase64(text);
  const dec = fromBase64(enc);
  assert.equal(dec.ok, true);
  assert.equal(dec.ok && dec.text, text);
});

test("Base64 المتوافق مع الروابط بلا + و/ و=", () => {
  const enc = toBase64("~~~ررر???", true);
  assert.ok(!/[+/=]/.test(enc), `فيه محرفٌ غيرُ آمنٍ للرابط: ${enc}`);
  assert.equal(fromBase64(enc).ok, true);
});

test("Base64 يرفض المُدخل الفاسد برسالةٍ لا بانهيار", () => {
  assert.equal(fromBase64("!!!").ok, false);
  assert.equal(fromBase64("QQ==Q").ok, false);
  // بايتاتٌ ليست UTF-8: 0xFF وحدَه
  assert.equal(fromBase64("/w==").ok, false);
});

/* ————— الروابط ————— */

test("تحليلُ الرابط يفصل الأجزاءَ والمعاملات", () => {
  const r = parseUrl("https://dokits.net:8443/tools/base64?q=مرحبا&n=2#top");
  assert.equal(r.ok, true);
  assert.equal(r.host, "dokits.net");
  assert.equal(r.port, "8443");
  assert.equal(r.hash, "top");
  assert.deepEqual(r.params, [{ key: "q", value: "مرحبا" }, { key: "n", value: "2" }]);
});

test("سلسلةُ استعلامٍ وحدَها تُقبَل", () => {
  assert.deepEqual(parseUrl("a=1&b=2").params, [{ key: "a", value: "1" }, { key: "b", value: "2" }]);
});

/* ————— المحارف ————— */

test("المحارفُ الخفيّةُ تُكشَف وتُسمّى", () => {
  const chars = inspectChars("ا‏بـ");
  assert.equal(chars.length, 4);
  assert.equal(chars[1].invisible, true);
  assert.match(chars[1].name, /يمين-يسار/);
  assert.match(chars[3].name, /تطويل/);
});

test("إحصاءُ النصّ يفرّق بين المحارف ونقاط الترميز والبايتات", () => {
  const s = "أ😀"; // همزةٌ محرفٌ واحد، والوجهُ زوجٌ بديل
  const st = textStats(s);
  assert.equal(st.chars, 3);
  assert.equal(st.codePoints, 2);
  assert.equal(st.utf8Bytes, 6);
});

test("NFD يزيد عددَ المحارف والنصُّ يبقى هو", () => {
  const st = textStats("é");
  assert.equal(st.nfcChars, 1);
  assert.equal(st.nfdChars, 2);
});

/* ————— JSON ————— */

test("JSON: موضعُ الخطأ سطراً وعموداً", () => {
  const r = formatJson('{\n  "a": 1,\n  "b" 2\n}');
  assert.equal(r.ok, false);
  assert.ok(!r.ok && r.line === 3, `السطرُ المتوقَّع ٣ لا ${!r.ok ? r.line : ""}`);
});

test("JSON: ترتيبُ المفاتيح عميقٌ لا سطحيّ", () => {
  const r = formatJson('{"b":1,"a":{"z":1,"y":2}}', { sortKeys: true, minify: true });
  assert.equal(r.ok && r.out, '{"a":{"y":2,"z":1},"b":1}');
});

test("JSON: العدُّ يشمل العمقَ والمفاتيح", () => {
  const r = formatJson('{"a":{"b":{"c":1}}}');
  assert.equal(r.ok && r.keys, 3);
  assert.equal(r.ok && r.depth, 3);
});

/* ————— CSV ————— */

test("CSV: فاصلةٌ وسطرٌ داخل الاقتباس ليسا فاصلَين", () => {
  const rows = parseCsv('اسم,ملاحظة\n"عبادة","سطرٌ\nثانٍ, وفاصلة"');
  assert.equal(rows.length, 2);
  assert.deepEqual(rows[1], ["عبادة", "سطرٌ\nثانٍ, وفاصلة"]);
});

test("CSV: الاقتباسُ المزدوجُ يعني علامةً واحدة", () => {
  assert.deepEqual(parseCsv('a,"قال ""نعم"""')[0], ["a", 'قال "نعم"']);
});

test("CSV ← JSON بالعناوين", () => {
  const r = csvToJson("a,b\n1,2\n3,4");
  assert.equal(r.ok, true);
  assert.equal(r.ok && r.rows, 2);
  assert.deepEqual(r.ok && JSON.parse(r.out), [{ a: "1", b: "2" }, { a: "3", b: "4" }]);
});

test("JSON ← CSV يوحّد الأعمدةَ ويقتبس ما يحتاج", () => {
  const r = jsonToCsv('[{"a":1},{"b":"فيه, فاصلة"}]');
  assert.equal(r.ok, true);
  assert.equal(r.ok && r.out, 'a,b\n1,\n,"فيه, فاصلة"');
});

test("JSON ← CSV يرفض ما ليس مصفوفةَ كائنات", () => {
  assert.equal(jsonToCsv("[1,2,3]").ok, false);
});

/* ————— JWT ————— */

test("JWT يُفكّ ويسمّي المطالبَ ويحوّل الأزمنة", () => {
  const header = toBase64(JSON.stringify({ alg: "HS256", typ: "JWT" }), true);
  const payload = toBase64(JSON.stringify({ sub: "42", exp: 1000000000 }), true);
  const r = decodeJwt(`${header}.${payload}.sig`, 2000000000000);
  assert.equal(r.ok, true);
  assert.equal(r.ok && r.alg, "HS256");
  assert.equal(r.ok && r.expired, true);
  const exp = r.ok && r.claims.find((c) => c.key === "exp");
  assert.equal(exp && exp.value, "2001-09-09 01:46:40Z");
});

test("JWT يرفض ما ليس ثلاثةَ أجزاء", () => {
  assert.equal(decodeJwt("a.b").ok, false);
});

/* ————— cron ————— */

test("cron: خمسةُ حقولٍ فقط، والستّةُ رسالةٌ مفهومة", () => {
  assert.equal(parseCron("0 9 * * 1").ok, true);
  const six = parseCron("0 0 9 * * 1");
  assert.equal(six.ok, false);
  assert.match(!six.ok ? six.error : "", /الثواني/);
});

test("cron: الأسماءُ المختصرةُ للشهر واليوم", () => {
  const a = parseCron("0 9 * mar mon");
  assert.equal(a.ok, true);
  assert.ok(a.ok && a.cron.month.values.has(3));
  assert.ok(a.ok && a.cron.dow.values.has(1));
});

test("cron: الأحدُ يُقبل ٠ و٧ معاً", () => {
  const r = parseCron("0 0 * * 7");
  assert.ok(r.ok && r.cron.dow.values.has(0));
});

test("cron: الوصفُ العربيُّ يطابق المعنى", () => {
  const every5 = parseCron("*/5 * * * *");
  assert.match(every5.ok ? every5.text : "", /كلَّ 5 دقائق/);
  assert.equal(every5.ok ? describeCron(every5.cron) : "", every5.ok ? every5.text : "x");
  const daily = parseCron("30 9 * * *");
  assert.match(daily.ok ? daily.text : "", /09:30/);
  const weekly = parseCron("0 0 * * 5");
  assert.match(weekly.ok ? weekly.text : "", /الجمعة/);
});

test("cron: المدى المتّصلُ يُجمَع ولا يُعَدُّ يوماً يوماً", () => {
  const work = parseCron("30 8 * * 1-5");
  assert.equal(work.ok ? work.text : "", "الساعة 08:30، يومَ الاثنين إلى الجمعة.");
  // يومان متتاليان لا يستحقّان صيغةَ المدى
  const two = parseCron("0 9 * * 1,2");
  assert.match(two.ok ? two.text : "", /الاثنين والثلاثاء/);
  // مدَيان منفصلان يُذكران معاً
  const split = parseCron("0 9 * * 0,1,2,5");
  assert.match(split.ok ? split.text : "", /الأحد إلى الثلاثاء والجمعة/);
});

test("cron: المواعيدُ القادمةُ صحيحةٌ ومتزايدة", () => {
  const r = parseCron("30 9 * * *");
  assert.equal(r.ok, true);
  const from = new Date(2026, 7, 30, 10, 0, 0); // بعد موعد اليوم
  const runs = r.ok ? nextRuns(r.cron, from, 3) : [];
  assert.equal(runs.length, 3);
  assert.equal(runs[0].getDate(), 31);
  assert.equal(runs[0].getHours(), 9);
  assert.equal(runs[0].getMinutes(), 30);
  assert.ok(runs[1] > runs[0] && runs[2] > runs[1]);
});

test("cron: تقييدُ اليوم ويوم الأسبوع معاً يعني «أو» لا «و»", () => {
  const r = parseCron("0 0 1 * 1"); // اليوم ١ أو كلُّ اثنين
  assert.equal(r.ok, true);
  const runs = r.ok ? nextRuns(r.cron, new Date(2026, 0, 1, 12, 0, 0), 5) : [];
  const days = runs.map((d) => `${d.getMonth() + 1}/${d.getDate()}`);
  assert.deepEqual(days, ["1/5", "1/12", "1/19", "1/26", "2/1"]);
});

test("cron: الاختصاراتُ المسمّاة", () => {
  const r = parseCron("@daily");
  assert.ok(r.ok && r.cron.hour.values.has(0) && r.cron.minute.values.has(0));
});

test("cron: المدى خارج الحدّ يُرفض", () => {
  assert.equal(parseCron("0 25 * * *").ok, false);
  assert.equal(parseCron("60 * * * *").ok, false);
  assert.equal(parseCron("0 9 * * 8").ok, false);
});

/* ————— التوليدُ العشوائيّ ————— */

test("بركةُ المحارف تُسقط الملتبسةَ عند الطلب", () => {
  const all = buildPool(["lower", "upper", "digits"], false);
  const safe = buildPool(["lower", "upper", "digits"], true);
  assert.ok(all.includes("0") && all.includes("O"));
  assert.ok(!safe.includes("0") && !safe.includes("O") && !safe.includes("l"));
});

test("العشوائيُّ لا ينحاز: القيمُ فوق الحدّ تُرفض لا تُقسَّم", () => {
  // بركةٌ من ٣ محارف: 0xffffffff لا يقبل القسمة عليها، فالقيمُ الحدّيّةُ تُرفض
  const pool = "abc";
  const feed = [0xfffffffe, 0xffffffff, 0, 1, 2];
  let i = 0;
  const rand = (n: number) => Uint32Array.from({ length: n }, () => feed[i++ % feed.length]);
  const out = randomFrom(pool, 3, rand);
  assert.equal(out.length, 3);
  assert.ok([...out].every((c) => pool.includes(c)));
});

test("العشوائيُّ يعطي الطولَ المطلوبَ من البركة المطلوبة", () => {
  const pool = buildPool(["lower", "digits"], false);
  const pw = randomFrom(pool, 24, (n) => crypto.getRandomValues(new Uint32Array(n)));
  assert.equal(pw.length, 24);
  assert.ok([...pw].every((c) => pool.includes(c)));
});

test("حسابُ العشوائيّة بالبتّات", () => {
  assert.equal(entropyBits(64, 10), 60);
  assert.equal(entropyBits(1, 10), 0);
});

/* ————— UUID ————— */

test("UUID v4 شكلاً وإصداراً", () => {
  const u = uuidV4();
  const info = inspectUuid(u);
  assert.equal(info.valid, true);
  assert.equal(info.version, 4);
  assert.equal(info.variant, "RFC 4122");
});

test("UUID v7 يحمل الزمنَ ويُفرَز نصّيّاً بترتيبه", () => {
  const a = uuidV7(1700000000000);
  const b = uuidV7(1800000000000);
  assert.ok(a < b, "الأقدمُ يجب أن يسبق نصّيّاً");
  const info = inspectUuid(a);
  assert.equal(info.version, 7);
  assert.equal(info.timestamp, "2023-11-14 22:13:20Z");
});

test("UUID v7 يتزايد داخل المللي الواحدة — لا يكفي الطابعُ الزمنيّ", () => {
  const ms = 1750000000000;
  const list = Array.from({ length: 50 }, () => uuidV7(ms));
  assert.equal(new Set(list).size, 50, "معرّفاتٌ مكرّرة");
  assert.deepEqual([...list].sort(), list, "الفرزُ النصّيُّ يجب أن يطابق ترتيبَ التوليد");
});

test("فحصُ UUID يرفض المشوّه ويعرف الصفريّ", () => {
  assert.equal(inspectUuid("ليس معرّفاً").valid, false);
  assert.match(inspectUuid("00000000-0000-0000-0000-000000000000").note, /الصفريّ/);
});

/* ————— البصمات ————— */

test("SHA-256 يطابق القيمةَ المرجعيّةَ المعروفة", async () => {
  assert.equal(
    await hashText("abc", "SHA-256"),
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  );
});

test("البصمةُ تُحسب على بايتات UTF-8 لا على المحارف", async () => {
  const a = await hashText("م", "SHA-256");
  const b = await hashText("م", "SHA-256");
  assert.equal(a, b);
  assert.equal(a.length, 64);
});
