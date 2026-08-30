/**
 * منطقُ تحويل الأرقام إلى كلمات — دوالُّ نقيّة بلا DOM (القاعدة ٧ من عقد التطبيع).
 * العربيّة تراعي قواعدَ العدد: التمييز، ومطابقةَ الجنس المعكوسة في ٣–١٠،
 * والمثنّى، وصيغَ الإضافة (مئتا/ألفا).
 */

export type Gender = "m" | "f";

/** صيغُ الاسم المعدود بحسب العدد الذي يسبقه */
export type NounForms = {
  /** جنسُ الاسم المعدود — العددُ ٣–١٠ يخالفه */
  gender: Gender;
  /** مفرد: ليرة · مئة ليرة */
  one: string;
  /** مثنّى: ليرتان */
  two: string;
  /** جمعٌ لـ٣–١٠: ثلاث ليرات */
  few: string;
  /** مفردٌ منصوب لـ١١–٩٩: خمسون ليرةً */
  many: string;
};

export type Currency = {
  code: string;
  nameAr: string;
  decimals: number;
  main: NounForms;
  sub: NounForms;
  /** [مفرد, جمع] بالإنكليزيّة */
  enMain: [string, string];
  enSub: [string, string];
};

/* ————— جداول العربيّة ————— */

// الصيغةُ تُختار بحسب جنس الاسم المعدود: ٣–١٠ تخالفه، و١–٢ توافقه
const ONES: Record<Gender, string[]> = {
  m: ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"],
  f: ["", "واحدة", "اثنتان", "ثلاث", "أربع", "خمس", "ست", "سبع", "ثماني", "تسع"],
};

// الفهرس ٠ = عشرة
const TEENS: Record<Gender, string[]> = {
  m: ["عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"],
  f: ["عشر", "إحدى عشرة", "اثنتا عشرة", "ثلاث عشرة", "أربع عشرة", "خمس عشرة", "ست عشرة", "سبع عشرة", "ثماني عشرة", "تسع عشرة"],
};

const TENS = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];

const HUNDREDS = ["", "مئة", "مئتان", "ثلاثمئة", "أربعمئة", "خمسمئة", "ستمئة", "سبعمئة", "ثمانمئة", "تسعمئة"];

type Scale = { one: string; two: string; twoConstruct: string; few: string; many: string };
const SCALES: (Scale | null)[] = [
  null,
  { one: "ألف", two: "ألفان", twoConstruct: "ألفا", few: "آلاف", many: "ألفاً" },
  { one: "مليون", two: "مليونان", twoConstruct: "مليونا", few: "ملايين", many: "مليوناً" },
  { one: "مليار", two: "ملياران", twoConstruct: "مليارا", few: "مليارات", many: "ملياراً" },
  { one: "تريليون", two: "تريليونان", twoConstruct: "تريليونا", few: "تريليونات", many: "تريليوناً" },
];

/** أكبرُ عددٍ مدعوم: ما دون الكوادريليون */
export const MAX_DIGITS = 15;

/** ثلاثُ خاناتٍ إلى كلمات. `construct` للإضافة: مئتا ألف */
function threeToWords(n: number, g: Gender, construct = false): string {
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const r = n % 100;
  if (h) parts.push(h === 2 && construct && r === 0 ? "مئتا" : HUNDREDS[h]);
  if (r) {
    if (r < 10) parts.push(ONES[g][r]);
    else if (r < 20) parts.push(TEENS[g][r - 10]);
    else {
      const u = r % 10;
      const t = Math.floor(r / 10);
      parts.push(u ? `${ONES[g][u]} و${TENS[t]}` : TENS[t]);
    }
  }
  return parts.join(" و");
}

/**
 * عددٌ صحيحٌ إلى كلماتٍ عربيّة.
 * `nounGender` جنسُ الاسم المعدود — يؤثّر في مجموعة الآحاد وحدها،
 * إذ إنّ ألفاً ومليوناً وما بعدهما مذكّرةٌ بذاتها.
 * `forNoun` حين يلي العددَ اسمٌ معدود: آخرُ لفظِ مرتبةٍ يُضاف إليه فتسقط
 * تنوينُه ونونُ مثنّاه — «خمسون ألفَ ليرة» لا «خمسون ألفاً ليرة».
 */
export function integerToArabic(value: bigint, nounGender: Gender = "m", forNoun = false): string {
  if (value === 0n) return "صفر";

  const groups: number[] = [];
  let v = value;
  while (v > 0n) {
    groups.push(Number(v % 1000n));
    v /= 1000n;
  }

  // المرتبةُ الملاصقةُ للاسم المعدود — تُضاف إليه حين لا تكون هناك آحاد
  const adjacent = forNoun && groups[0] === 0 ? groups.findIndex((g) => g !== 0) : -1;

  const out: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (!g) continue;
    if (i === 0) {
      out.push(threeToWords(g, nounGender));
      continue;
    }
    const s = SCALES[i];
    if (!s) continue;
    const construct = i === adjacent;
    if (g === 1) out.push(s.one);
    else if (g === 2) out.push(construct ? s.twoConstruct : s.two);
    else if (g <= 10) out.push(`${threeToWords(g, "m")} ${s.few}`);
    else if (g % 100 === 0) out.push(`${threeToWords(g, "m", true)} ${s.one}`);
    else out.push(`${threeToWords(g, "m")} ${construct ? s.one : s.many}`);
  }
  return out.join(" و");
}

/** صيغةُ الاسم المعدود التي يفرضها العدد */
function nounFor(count: bigint, forms: NounForms): string {
  if (count === 0n) return forms.one;
  const r = Number(count % 100n);
  if (r === 1) return forms.one;
  if (r === 2) return forms.two;
  if (r >= 3 && r <= 10) return forms.few;
  if (r >= 11) return forms.many;
  return forms.one; // مضاعفاتُ المئة والألف: مئة ليرة
}

/** عددٌ + اسمٌ معدود، بالصيغة الطبيعيّة (ليرة واحدة · ليرتان · ثلاث ليرات) */
export function countWithNoun(count: bigint, forms: NounForms): string {
  const noun = nounFor(count, forms);
  if (count === 1n) return `${noun} ${ONES[forms.gender][1]}`;
  if (count === 2n) return noun;
  return `${integerToArabic(count, forms.gender, true)} ${noun}`;
}

/* ————— الإنكليزيّة ————— */

const EN_ONES = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
];
const EN_TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const EN_SCALES = ["", "thousand", "million", "billion", "trillion"];

function enThree(n: number): string {
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const r = n % 100;
  if (h) parts.push(`${EN_ONES[h]} hundred`);
  if (r) {
    if (r < 20) parts.push(EN_ONES[r]);
    else {
      const t = Math.floor(r / 10);
      const u = r % 10;
      parts.push(u ? `${EN_TENS[t]}-${EN_ONES[u]}` : EN_TENS[t]);
    }
  }
  return parts.join(" ");
}

export function integerToEnglish(value: bigint): string {
  if (value === 0n) return "zero";
  const groups: number[] = [];
  let v = value;
  while (v > 0n) {
    groups.push(Number(v % 1000n));
    v /= 1000n;
  }
  const out: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (!g) continue;
    out.push(EN_SCALES[i] ? `${enThree(g)} ${EN_SCALES[i]}` : enThree(g));
  }
  return out.join(" ");
}

/* ————— قراءةُ المدخل ————— */

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

/** يقبل الأرقام العربيّة-الهنديّة والفارسيّة ويحوّلها إلى لاتينيّة */
export function normalizeDigits(s: string): string {
  return s.replace(/[٠-٩۰-۹]/g, (d) => {
    const i = AR_DIGITS.indexOf(d);
    return String(i >= 0 ? i : FA_DIGITS.indexOf(d));
  });
}

export type Parsed =
  | { ok: true; negative: boolean; int: bigint; frac: string }
  | { ok: false; error: string };

/** يقرأ نصّ المدخل: فواصلُ الآلاف تُهمَل، والكسرُ يُقصَّ إلى `decimals` خانة */
export function parseInput(raw: string, decimals: number): Parsed {
  const s = normalizeDigits(raw).trim().replace(/[,\s_]/g, "").replace(/٫/g, ".");
  if (!s) return { ok: false, error: "" };

  const negative = s.startsWith("-");
  const body = negative ? s.slice(1) : s;
  if (!/^\d*\.?\d*$/.test(body) || body === "." || body === "") {
    return { ok: false, error: "أدخل رقماً صحيحاً — أرقامٌ فقط، وفاصلةٌ عشريّةٌ واحدةٌ إن لزمت." };
  }

  const [intRaw = "", fracRaw = ""] = body.split(".");
  const intClean = intRaw.replace(/^0+(?=\d)/, "") || "0";
  if (intClean.length > MAX_DIGITS) {
    return { ok: false, error: `العددُ أكبرُ من المدعوم — حتّى ${MAX_DIGITS} خانةً (دون الكوادريليون).` };
  }

  const frac = decimals > 0 ? fracRaw.slice(0, decimals).padEnd(decimals, "0") : "";
  return { ok: true, negative, int: BigInt(intClean), frac };
}

/* ————— المخرجات ————— */

export type Conversion = { ar: string; en: string };

/** قراءةُ عددٍ مجرَّدةً (بلا عملة): الكسرُ يُقرأ رقماً رقماً */
export function readPlain(raw: string): Conversion | { error: string } {
  const p = parseInput(raw, 6);
  if (!p.ok) return { error: p.error };

  const fracDigits = p.frac.replace(/0+$/, "");
  let ar = integerToArabic(p.int, "m");
  let en = integerToEnglish(p.int);

  if (fracDigits) {
    ar += " فاصلة " + [...fracDigits].map((d) => ONES.m[Number(d)] || "صفر").join(" ");
    en += " point " + [...fracDigits].map((d) => EN_ONES[Number(d)]).join(" ");
  }
  if (p.negative) {
    ar = "سالب " + ar;
    en = "negative " + en;
  }
  return { ar, en };
}

const enPlural = (n: bigint, [one, many]: [string, string]) => (n === 1n ? one : many);

/** تفقيطُ مبلغٍ بعملة — الصيغةُ المعتمدة على الفواتير والشيكات */
export function tafqit(raw: string, c: Currency): Conversion | { error: string } {
  const p = parseInput(raw, c.decimals);
  if (!p.ok) return { error: p.error };

  const sub = p.frac ? BigInt(p.frac) : 0n;

  // مبلغٌ دون الواحد يُقرأ بوحدته الفرعيّة وحدها — «صفر ليرة وخمسة وسبعون قرشاً» ركيك
  const onlySub = p.int === 0n && sub > 0n;

  const arParts = onlySub ? [] : [countWithNoun(p.int, c.main)];
  if (sub > 0n) arParts.push(countWithNoun(sub, c.sub));
  let ar = `فقط ${arParts.join(" و")} لا غير`;
  if (p.negative) ar = `سالب: ${ar}`;

  const enParts = onlySub ? [] : [`${integerToEnglish(p.int)} ${enPlural(p.int, c.enMain)}`];
  if (sub > 0n) enParts.push(`${integerToEnglish(sub)} ${enPlural(sub, c.enSub)}`);
  let en = `${enParts.join(" and ")} only`;
  en = en.charAt(0).toUpperCase() + en.slice(1);
  if (p.negative) en = `Negative: ${en}`;

  return { ar, en };
}

/* ————— العملات المدعومة ————— */

export const CURRENCIES: Currency[] = [
  {
    code: "SYP", nameAr: "ليرة سورية", decimals: 2,
    main: { gender: "f", one: "ليرة سورية", two: "ليرتان سوريتان", few: "ليرات سورية", many: "ليرةً سوريةً" },
    sub: { gender: "m", one: "قرش", two: "قرشان", few: "قروش", many: "قرشاً" },
    enMain: ["Syrian pound", "Syrian pounds"], enSub: ["piastre", "piastres"],
  },
  {
    code: "USD", nameAr: "دولار أمريكي", decimals: 2,
    main: { gender: "m", one: "دولار أمريكي", two: "دولاران أمريكيان", few: "دولارات أمريكية", many: "دولاراً أمريكياً" },
    sub: { gender: "m", one: "سنت", two: "سنتان", few: "سنتات", many: "سنتاً" },
    enMain: ["US dollar", "US dollars"], enSub: ["cent", "cents"],
  },
  {
    code: "EUR", nameAr: "يورو", decimals: 2,
    main: { gender: "m", one: "يورو", two: "يوروان", few: "يوروات", many: "يورو" },
    sub: { gender: "m", one: "سنت", two: "سنتان", few: "سنتات", many: "سنتاً" },
    enMain: ["euro", "euros"], enSub: ["cent", "cents"],
  },
  {
    code: "SAR", nameAr: "ريال سعودي", decimals: 2,
    main: { gender: "m", one: "ريال سعودي", two: "ريالان سعوديان", few: "ريالات سعودية", many: "ريالاً سعودياً" },
    sub: { gender: "f", one: "هللة", two: "هللتان", few: "هللات", many: "هللةً" },
    enMain: ["Saudi riyal", "Saudi riyals"], enSub: ["halala", "halalas"],
  },
  {
    code: "AED", nameAr: "درهم إماراتي", decimals: 2,
    main: { gender: "m", one: "درهم إماراتي", two: "درهمان إماراتيان", few: "دراهم إماراتية", many: "درهماً إماراتياً" },
    sub: { gender: "m", one: "فلس", two: "فلسان", few: "فلوس", many: "فلساً" },
    enMain: ["UAE dirham", "UAE dirhams"], enSub: ["fils", "fils"],
  },
  {
    code: "JOD", nameAr: "دينار أردني", decimals: 3,
    main: { gender: "m", one: "دينار أردني", two: "ديناران أردنيان", few: "دنانير أردنية", many: "ديناراً أردنياً" },
    sub: { gender: "m", one: "فلس", two: "فلسان", few: "فلوس", many: "فلساً" },
    enMain: ["Jordanian dinar", "Jordanian dinars"], enSub: ["fils", "fils"],
  },
  {
    code: "EGP", nameAr: "جنيه مصري", decimals: 2,
    main: { gender: "m", one: "جنيه مصري", two: "جنيهان مصريان", few: "جنيهات مصرية", many: "جنيهاً مصرياً" },
    sub: { gender: "m", one: "قرش", two: "قرشان", few: "قروش", many: "قرشاً" },
    enMain: ["Egyptian pound", "Egyptian pounds"], enSub: ["piastre", "piastres"],
  },
  {
    code: "TRY", nameAr: "ليرة تركية", decimals: 2,
    main: { gender: "f", one: "ليرة تركية", two: "ليرتان تركيتان", few: "ليرات تركية", many: "ليرةً تركيةً" },
    sub: { gender: "m", one: "قرش", two: "قرشان", few: "قروش", many: "قرشاً" },
    enMain: ["Turkish lira", "Turkish lira"], enSub: ["kuruş", "kuruş"],
  },
];
