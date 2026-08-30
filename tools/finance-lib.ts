/**
 * منطقٌ حسابيٌّ نقيٌّ تتقاسمه أدواتُ «حسابات وأعمال» — بلا DOM (القاعدة ٧).
 * كلُّ المبالغ تُقرَّب عند العرض لا أثناء الحساب، كي لا يتراكم خطأُ التقريب.
 */

export const round = (n: number, digits = 2) => {
  const f = 10 ** digits;
  return Math.round((n + Number.EPSILON) * f) / f;
};

/** يقرأ عدداً من نصّ المستخدم: أرقامٌ عربيّةٌ وفواصلُ آلافٍ مقبولة */
export function num(raw: string): number | null {
  if (!raw?.trim()) return null;
  const AR = "٠١٢٣٤٥٦٧٨٩";
  const s = raw
    .replace(/[٠-٩]/g, (d) => String(AR.indexOf(d)))
    .replace(/٫/g, ".")
    .replace(/[,\s_]/g, "")
    .trim();
  if (!/^-?\d*\.?\d+$/.test(s)) return null;
  return Number(s);
}

export const money = (n: number, digits = 2) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);

export const pct = (n: number, digits = 2) => `${money(n, digits)}%`;

/* ————— ضريبة القيمة المضافة ————— */

export const VAT_RATES = [
  { id: "sa", name: "السعوديّة", rate: 15 },
  { id: "ae", name: "الإمارات", rate: 5 },
  { id: "om", name: "عُمان", rate: 5 },
  { id: "bh", name: "البحرين", rate: 10 },
  { id: "eg", name: "مصر", rate: 14 },
  { id: "jo", name: "الأردن", rate: 16 },
  { id: "ma", name: "المغرب", rate: 20 },
  { id: "tn", name: "تونس", rate: 19 },
] as const;

export type VatResult = { net: number; vat: number; gross: number };

/** `mode` هل المبلغُ المُدخل قبل الضريبة أم شاملُها */
export function vat(amount: number, rate: number, mode: "add" | "extract"): VatResult {
  const r = rate / 100;
  if (mode === "add") {
    const v = amount * r;
    return { net: amount, vat: v, gross: amount + v };
  }
  const net = amount / (1 + r);
  return { net, vat: amount - net, gross: amount };
}

/* ————— النسبة المئويّة ————— */

export type PercentMode = "of" | "isWhatPct" | "change" | "increase" | "decrease" | "reverse";

export function percent(mode: PercentMode, a: number, b: number): number {
  switch (mode) {
    case "of": return (a / 100) * b;              // كم يساوي a% من b
    case "isWhatPct": return (a / b) * 100;        // a هو كم % من b
    case "change": return ((b - a) / a) * 100;     // التغيّر من a إلى b
    case "increase": return a * (1 + b / 100);
    case "decrease": return a * (1 - b / 100);
    case "reverse": return a / (b / 100);          // a هو b% من ماذا
  }
}

/* ————— التسعير والهامش ————— */

export type Pricing = { cost: number; price: number; profit: number; marginPct: number; markupPct: number };

/** الهامشُ نسبةٌ من سعر البيع، والترميزُ نسبةٌ من التكلفة — والخلطُ بينهما أشهرُ غلطةِ تسعير */
export function priceFromMargin(cost: number, marginPct: number): Pricing | null {
  if (marginPct >= 100) return null;
  const price = cost / (1 - marginPct / 100);
  return pricing(cost, price);
}

export function priceFromMarkup(cost: number, markupPct: number): Pricing {
  return pricing(cost, cost * (1 + markupPct / 100));
}

export function pricing(cost: number, price: number): Pricing {
  const profit = price - cost;
  return {
    cost, price, profit,
    marginPct: price === 0 ? 0 : (profit / price) * 100,
    markupPct: cost === 0 ? 0 : (profit / cost) * 100,
  };
}

/* ————— الخصومات المتتالية ————— */

export type DiscountResult = { steps: { pct: number; after: number }[]; final: number; savedAmount: number; effectivePct: number };

export function chainDiscounts(price: number, pcts: number[]): DiscountResult {
  let cur = price;
  const steps = pcts.map((p) => {
    cur = cur * (1 - p / 100);
    return { pct: p, after: cur };
  });
  return {
    steps,
    final: cur,
    savedAmount: price - cur,
    effectivePct: price === 0 ? 0 : ((price - cur) / price) * 100,
  };
}

/* ————— ساعات العمل ————— */

export type Shift = { id: string; label: string; from: string; to: string; breakMin: number };

/** يدعم الورديّةَ العابرةَ منتصفَ الليل */
export function shiftHours(s: Shift): number {
  const p = (t: string) => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(t);
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  };
  const a = p(s.from);
  const b = p(s.to);
  if (a === null || b === null) return 0;
  let mins = b - a;
  if (mins < 0) mins += 24 * 60;
  mins -= Math.max(0, s.breakMin || 0);
  return Math.max(0, mins) / 60;
}

/* ————— تقسيم فاتورة ————— */

export type SplitResult = { base: number; tip: number; total: number; perPerson: number; shares: number[] };

export function splitBill(total: number, people: number, tipPct: number, weights?: number[]): SplitResult {
  const tip = total * (tipPct / 100);
  const grand = total + tip;
  const n = Math.max(1, Math.floor(people));
  const w = weights && weights.length === n && weights.some((x) => x > 0) ? weights : new Array(n).fill(1);
  const sum = w.reduce((s, x) => s + x, 0);
  return { base: total, tip, total: grand, perPerson: grand / n, shares: w.map((x) => (grand * x) / sum) };
}

/* ————— IBAN ————— */

/** أطوالُ الحسابات الدوليّة بحسب سجلّ SWIFT */
export const IBAN_LENGTHS: Record<string, number> = {
  AE: 23, BH: 22, EG: 29, IQ: 23, JO: 30, KW: 30, LB: 28, LY: 25, MA: 28, MR: 27,
  OM: 23, PS: 29, QA: 29, SA: 24, SD: 18, TN: 24, DJ: 27, SO: 23,
  TR: 26, DE: 22, FR: 27, GB: 22, NL: 18, IT: 27, ES: 24, CH: 21, BE: 16, AT: 20,
  SE: 24, NO: 15, DK: 18, FI: 18, IE: 22, PT: 25, PL: 28, GR: 27, RO: 24, CZ: 24,
  HU: 28, BG: 22, HR: 21, CY: 28, LU: 20, MT: 31, SI: 19, SK: 24, EE: 20, LV: 21,
  LT: 20, IS: 26, PK: 24, GE: 22, AZ: 28, KZ: 20, UA: 29, RS: 22, AL: 28, MK: 19,
  BA: 20, ME: 22, MU: 30, VG: 24, GI: 23,
};

export type IbanCheck =
  | { ok: true; formatted: string; country: string; length: number }
  | { ok: false; reason: string };

export function checkIban(raw: string): IbanCheck {
  const s = raw.toUpperCase().replace(/[\s-]/g, "");
  if (!s) return { ok: false, reason: "" };
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(s)) {
    return { ok: false, reason: "الصيغة: حرفا بلدٍ ثمّ رقما تحقّقٍ ثمّ حروفٌ وأرقام." };
  }
  const country = s.slice(0, 2);
  const expected = IBAN_LENGTHS[country];
  if (!expected) return { ok: false, reason: `رمزُ البلد «${country}» ليس في سجلّ الحسابات الدوليّة.` };
  if (s.length !== expected) {
    return { ok: false, reason: `طولُ ${country} يجب أن يكون ${expected} محرفاً — أدخلتَ ${s.length}.` };
  }
  // مِعيارُ mod-97: تُنقل الأربعةُ الأولى إلى الآخر، ثمّ تُبدَّل الحروفُ أرقاماً
  const moved = s.slice(4) + s.slice(0, 4);
  const digits = [...moved].map((c) => (/\d/.test(c) ? c : String(c.charCodeAt(0) - 55))).join("");
  let rem = 0;
  for (const d of digits) rem = (rem * 10 + Number(d)) % 97;
  if (rem !== 1) return { ok: false, reason: "رقما التحقّق لا يطابقان — راجع الرقم، فيه خطأٌ أو حرفٌ ناقص." };
  return { ok: true, formatted: s.replace(/(.{4})/g, "$1 ").trim(), country, length: s.length };
}

/* ————— جدول سداد قرض ————— */

export type Installment = { n: number; payment: number; interest: number; principal: number; balance: number };
export type LoanResult = { payment: number; totalPaid: number; totalInterest: number; rows: Installment[] };

export function loanSchedule(amount: number, annualRatePct: number, months: number): LoanResult | null {
  if (amount <= 0 || months <= 0 || months > 600) return null;
  const r = annualRatePct / 100 / 12;
  const payment = r === 0 ? amount / months : (amount * r) / (1 - (1 + r) ** -months);
  const rows: Installment[] = [];
  let balance = amount;
  let totalInterest = 0;
  for (let n = 1; n <= months; n++) {
    const interest = balance * r;
    let principal = payment - interest;
    if (n === months) principal = balance; // القسطُ الأخير يبتلع فروقَ التقريب
    balance = Math.max(0, balance - principal);
    totalInterest += interest;
    rows.push({ n, payment: interest + principal, interest, principal, balance });
  }
  return { payment, totalPaid: amount + totalInterest, totalInterest, rows };
}

/* ————— الزكاة ————— */

export type ZakatInput = {
  cash: number; goldGrams: number; goldPricePerGram: number;
  silverGrams: number; silverPricePerGram: number;
  tradeGoods: number; receivables: number; debts: number;
  nisabBase: "gold" | "silver";
};
export type ZakatResult = {
  assets: number; net: number; nisab: number; due: boolean; zakat: number;
};

/** النصاب: ٨٥ غراماً ذهباً أو ٥٩٥ غراماً فضّة — والمعدّل ربعُ العشر (٢٫٥٪) */
export const NISAB_GOLD_GRAMS = 85;
export const NISAB_SILVER_GRAMS = 595;
export const ZAKAT_RATE = 0.025;

export function zakat(i: ZakatInput): ZakatResult {
  const assets =
    i.cash + i.goldGrams * i.goldPricePerGram + i.silverGrams * i.silverPricePerGram +
    i.tradeGoods + i.receivables;
  const net = assets - i.debts;
  const nisab = i.nisabBase === "gold"
    ? NISAB_GOLD_GRAMS * i.goldPricePerGram
    : NISAB_SILVER_GRAMS * i.silverPricePerGram;
  const due = nisab > 0 && net >= nisab;
  return { assets, net, nisab, due, zakat: due ? net * ZAKAT_RATE : 0 };
}

/* ————— مكافأة نهاية الخدمة ————— */

export type EosbCountry = "sa" | "ae" | "custom";

export type EosbResult = { years: number; award: number; breakdown: string[] };

/**
 * الأنظمةُ تتغيّر وتفصيلُها يختلف بسبب انتهاء الخدمة — هذه الصيغُ العامّة الشائعة،
 * والواجهةُ تنبّه صراحةً إلى مراجعة نظام البلد.
 */
export function eosb(
  monthlyWage: number, totalDays: number, country: EosbCountry, customDaysPerYear = 30,
): EosbResult {
  const years = totalDays / 365;
  const daily = monthlyWage / 30;
  const breakdown: string[] = [];
  let award = 0;

  if (country === "sa") {
    const first = Math.min(years, 5);
    const rest = Math.max(0, years - 5);
    const a = first * (monthlyWage / 2);
    const b = rest * monthlyWage;
    award = a + b;
    breakdown.push(`أوّلُ ٥ سنوات: نصفُ أجرِ شهرٍ لكلّ سنة — ${first.toFixed(2)} سنة`);
    if (rest > 0) breakdown.push(`ما بعدها: أجرُ شهرٍ لكلّ سنة — ${rest.toFixed(2)} سنة`);
  } else if (country === "ae") {
    const first = Math.min(years, 5);
    const rest = Math.max(0, years - 5);
    award = first * 21 * daily + rest * 30 * daily;
    breakdown.push(`أوّلُ ٥ سنوات: ٢١ يوماً لكلّ سنة — ${first.toFixed(2)} سنة`);
    if (rest > 0) breakdown.push(`ما بعدها: ٣٠ يوماً لكلّ سنة — ${rest.toFixed(2)} سنة`);
    breakdown.push("والحدُّ الأعلى في النظام أجرُ سنتين — راجعه إن طالت الخدمة");
  } else {
    award = years * customDaysPerYear * daily;
    breakdown.push(`${customDaysPerYear} يوماً لكلّ سنة — ${years.toFixed(2)} سنة`);
  }
  return { years, award, breakdown };
}

/* ————— الفاتورة ————— */

export type InvoiceItem = { id: string; desc: string; qty: number; price: number };

export function invoiceTotals(items: InvoiceItem[], taxRate: number, discount: number) {
  const subtotal = items.reduce((s, it) => s + (it.qty || 0) * (it.price || 0), 0);
  const afterDiscount = Math.max(0, subtotal - discount);
  const tax = afterDiscount * (taxRate / 100);
  return { subtotal, discount, afterDiscount, tax, total: afterDiscount + tax };
}
