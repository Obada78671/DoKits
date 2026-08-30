/**
 * منطقُ التحويلات والقياسات — دوالُّ نقيّةٌ بلا DOM (القاعدة ٧).
 */

export const round = (n: number, d = 6) => {
  const f = 10 ** d;
  return Math.round((n + Number.EPSILON) * f) / f;
};

const AR = "٠١٢٣٤٥٦٧٨٩";
export function num(raw: string): number | null {
  if (!raw?.trim()) return null;
  const s = raw.replace(/[٠-٩]/g, (d) => String(AR.indexOf(d))).replace(/٫/g, ".").replace(/[,\s_]/g, "");
  if (!/^-?\d*\.?\d+(?:[eE][-+]?\d+)?$/.test(s)) return null;
  return Number(s);
}

export const fmt = (n: number, d = 6) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: d }).format(round(n, d));

/* ————— وحداتُ القياس ————— */

export type UnitDef = { id: string; name: string; symbol: string; toBase: number };
export type UnitFamily = { id: string; name: string; base: string; units: UnitDef[] };

export const UNIT_FAMILIES: UnitFamily[] = [
  {
    id: "length", name: "الطول", base: "m",
    units: [
      { id: "mm", name: "مليمتر", symbol: "mm", toBase: 0.001 },
      { id: "cm", name: "سنتيمتر", symbol: "cm", toBase: 0.01 },
      { id: "m", name: "متر", symbol: "m", toBase: 1 },
      { id: "km", name: "كيلومتر", symbol: "km", toBase: 1000 },
      { id: "in", name: "إنش", symbol: "in", toBase: 0.0254 },
      { id: "ft", name: "قدم", symbol: "ft", toBase: 0.3048 },
      { id: "yd", name: "ياردة", symbol: "yd", toBase: 0.9144 },
      { id: "mi", name: "ميل", symbol: "mi", toBase: 1609.344 },
      { id: "nmi", name: "ميل بحريّ", symbol: "nmi", toBase: 1852 },
    ],
  },
  {
    id: "mass", name: "الكتلة", base: "kg",
    units: [
      { id: "mg", name: "مليغرام", symbol: "mg", toBase: 0.000001 },
      { id: "g", name: "غرام", symbol: "g", toBase: 0.001 },
      { id: "kg", name: "كيلوغرام", symbol: "kg", toBase: 1 },
      { id: "t", name: "طنّ متريّ", symbol: "t", toBase: 1000 },
      { id: "oz", name: "أونصة", symbol: "oz", toBase: 0.028349523125 },
      { id: "lb", name: "رطل", symbol: "lb", toBase: 0.45359237 },
      { id: "st", name: "ستون", symbol: "st", toBase: 6.35029318 },
    ],
  },
  {
    id: "volume", name: "الحجم", base: "L",
    units: [
      { id: "ml", name: "مليلتر", symbol: "ml", toBase: 0.001 },
      { id: "l", name: "لتر", symbol: "L", toBase: 1 },
      { id: "m3", name: "متر مكعّب", symbol: "m³", toBase: 1000 },
      { id: "tsp", name: "ملعقة صغيرة", symbol: "tsp", toBase: 0.00492892159375 },
      { id: "tbsp", name: "ملعقة كبيرة", symbol: "tbsp", toBase: 0.01478676478125 },
      { id: "cup", name: "كوب", symbol: "cup", toBase: 0.2365882365 },
      { id: "gal", name: "غالون أمريكيّ", symbol: "gal", toBase: 3.785411784 },
      { id: "galuk", name: "غالون بريطانيّ", symbol: "gal UK", toBase: 4.54609 },
    ],
  },
  {
    id: "area", name: "المساحة", base: "m²",
    units: [
      { id: "cm2", name: "سنتيمتر مربّع", symbol: "cm²", toBase: 0.0001 },
      { id: "m2", name: "متر مربّع", symbol: "m²", toBase: 1 },
      { id: "km2", name: "كيلومتر مربّع", symbol: "km²", toBase: 1_000_000 },
      { id: "ha", name: "هكتار", symbol: "ha", toBase: 10_000 },
      { id: "dunam", name: "دونم", symbol: "دونم", toBase: 1000 },
      { id: "ft2", name: "قدم مربّع", symbol: "ft²", toBase: 0.09290304 },
      { id: "ac", name: "فدّان (acre)", symbol: "ac", toBase: 4046.8564224 },
    ],
  },
  {
    id: "speed", name: "السرعة", base: "m/s",
    units: [
      { id: "mps", name: "متر/ثانية", symbol: "m/s", toBase: 1 },
      { id: "kmh", name: "كم/ساعة", symbol: "km/h", toBase: 1 / 3.6 },
      { id: "mph", name: "ميل/ساعة", symbol: "mph", toBase: 0.44704 },
      { id: "kn", name: "عقدة", symbol: "kn", toBase: 0.514444444 },
    ],
  },
  {
    id: "time", name: "الزمن", base: "s",
    units: [
      { id: "ms", name: "مليثانية", symbol: "ms", toBase: 0.001 },
      { id: "s", name: "ثانية", symbol: "s", toBase: 1 },
      { id: "min", name: "دقيقة", symbol: "min", toBase: 60 },
      { id: "h", name: "ساعة", symbol: "h", toBase: 3600 },
      { id: "d", name: "يوم", symbol: "d", toBase: 86400 },
      { id: "wk", name: "أسبوع", symbol: "wk", toBase: 604800 },
    ],
  },
];

/** الحرارةُ ليست نسبيّةً فتحتاج مساراً خاصّاً */
export type TempUnit = "c" | "f" | "k";
export const TEMP_UNITS: { id: TempUnit; name: string; symbol: string }[] = [
  { id: "c", name: "مئويّ", symbol: "°C" },
  { id: "f", name: "فهرنهايت", symbol: "°F" },
  { id: "k", name: "كلفن", symbol: "K" },
];

export function convertTemp(v: number, from: TempUnit, to: TempUnit): number {
  const c = from === "c" ? v : from === "f" ? (v - 32) * 5 / 9 : v - 273.15;
  return to === "c" ? c : to === "f" ? c * 9 / 5 + 32 : c + 273.15;
}

export function convertUnit(v: number, from: UnitDef, to: UnitDef): number {
  return (v * from.toBase) / to.toBase;
}

/* ————— حجومُ الملفّات ————— */

export type SizeBase = 1000 | 1024;
export const SIZE_UNITS_SI = ["بايت", "كيلوبايت", "ميغابايت", "غيغابايت", "تيرابايت", "بيتابايت"];
export const SIZE_UNITS_BIN = ["بايت", "كيبيبايت", "ميبيبايت", "غيبيبايت", "تيبيبايت", "بيبيبايت"];

export function humanSize(bytes: number, base: SizeBase): { value: number; unit: string; index: number } {
  const names = base === 1024 ? SIZE_UNITS_BIN : SIZE_UNITS_SI;
  if (bytes === 0) return { value: 0, unit: names[0], index: 0 };
  const i = Math.min(names.length - 1, Math.floor(Math.log(Math.abs(bytes)) / Math.log(base)));
  return { value: bytes / base ** i, unit: names[i], index: i };
}

export const sizeToBytes = (v: number, index: number, base: SizeBase) => v * base ** index;

/* ————— أنظمةُ العدّ ————— */

export type BaseCheck = { ok: true; value: bigint } | { ok: false; error: string };

const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";

export function parseInBase(raw: string, base: number): BaseCheck {
  const s = raw.trim().toLowerCase().replace(/[\s_]/g, "").replace(/^0[bxo]/, "");
  if (!s) return { ok: false, error: "" };
  const allowed = DIGITS.slice(0, base);
  for (const ch of s) {
    if (!allowed.includes(ch)) {
      return { ok: false, error: `المحرف «${ch}» لا يصلح في الأساس ${base} — المسموح: ${allowed}` };
    }
  }
  let v = 0n;
  const b = BigInt(base);
  for (const ch of s) v = v * b + BigInt(allowed.indexOf(ch));
  return { ok: true, value: v };
}

export function toBase(v: bigint, base: number): string {
  if (v === 0n) return "0";
  const b = BigInt(base);
  let out = "";
  let n = v;
  while (n > 0n) { out = DIGITS[Number(n % b)] + out; n /= b; }
  return out;
}

/* ————— تواريخ ————— */

const MS_DAY = 86_400_000;
export const utc = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d);

export function parseDate(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const d = new Date(utc(Number(m[1]), Number(m[2]), Number(m[3])));
  return Number.isFinite(d.getTime()) ? d : null;
}

export type DateSpan = { years: number; months: number; days: number; totalDays: number; totalWeeks: number; totalMonths: number };

/** يضيف أشهراً ويقصّ اليومَ إلى آخر الشهر إن تجاوزه (٣١ كانون٢ + شهر = ٢٨/٢٩ شباط) */
export function addMonths(d: Date, n: number): Date {
  const mAbs = d.getUTCMonth() + n;
  const y = d.getUTCFullYear() + Math.floor(mAbs / 12);
  const m = ((mAbs % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(d.getUTCDate(), lastDay)));
}

/**
 * فرقٌ تقويميٌّ صحيح.
 * الطريقةُ: نأخذ أكبرَ عددِ أشهرٍ يبقى ضمن المدّة، ثمّ نعدّ الأيّامَ الباقية.
 * الطرحُ المباشر خانةً خانةً يفشل حين يتجاوز يومُ البداية طولَ الشهر السابق
 * (٣١ كانون٢ ← ١ آذار كان يعطي يوماً سالباً).
 */
export function dateSpan(a: Date, b: Date): DateSpan {
  const [from, to] = a <= b ? [a, b] : [b, a];
  let months = (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth());
  if (addMonths(from, months).getTime() > to.getTime()) months -= 1;
  const anchor = addMonths(from, months);
  const days = Math.round((to.getTime() - anchor.getTime()) / MS_DAY);
  const totalDays = Math.round((to.getTime() - from.getTime()) / MS_DAY);
  return {
    years: Math.floor(months / 12),
    months: months % 12,
    days,
    totalDays,
    totalWeeks: Math.floor(totalDays / 7),
    totalMonths: months,
  };
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * MS_DAY);
}

/** الميلادُ القادم من تاريخ ميلاد */
export function nextAnniversary(birth: Date, today: Date): { date: Date; inDays: number } {
  const y = today.getUTCFullYear();
  let next = new Date(utc(y, birth.getUTCMonth() + 1, birth.getUTCDate()));
  if (next.getTime() < today.getTime()) next = new Date(utc(y + 1, birth.getUTCMonth() + 1, birth.getUTCDate()));
  return { date: next, inDays: Math.round((next.getTime() - today.getTime()) / MS_DAY) };
}

export type WeekendId = "fri-sat" | "sat-sun" | "sun-only" | "fri-only";
export const WEEKENDS: { id: WeekendId; name: string; days: number[] }[] = [
  { id: "fri-sat", name: "الجمعة والسبت", days: [5, 6] },
  { id: "sat-sun", name: "السبت والأحد", days: [6, 0] },
  { id: "fri-only", name: "الجمعة فقط", days: [5] },
  { id: "sun-only", name: "الأحد فقط", days: [0] },
];

export type BusinessDays = { total: number; working: number; weekend: number; holidays: number };

export function businessDays(a: Date, b: Date, weekendDays: number[], holidays: Set<string>): BusinessDays {
  const [from, to] = a <= b ? [a, b] : [b, a];
  let working = 0, weekend = 0, hol = 0, total = 0;
  for (let t = from.getTime(); t <= to.getTime(); t += MS_DAY) {
    const d = new Date(t);
    total++;
    const iso = d.toISOString().slice(0, 10);
    if (weekendDays.includes(d.getUTCDay())) weekend++;
    else if (holidays.has(iso)) hol++;
    else working++;
  }
  return { total, working, weekend, holidays: hol };
}

/* ————— الإحداثيّات ————— */

export type Dms = { deg: number; min: number; sec: number; dir: string };

export function toDms(decimal: number, axis: "lat" | "lng"): Dms {
  const dir = decimal < 0 ? (axis === "lat" ? "S" : "W") : axis === "lat" ? "N" : "E";
  const abs = Math.abs(decimal);
  const deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = round((minFloat - min) * 60, 3);
  return { deg, min, sec, dir };
}

export function fromDms(deg: number, min: number, sec: number, dir: string): number {
  const v = Math.abs(deg) + min / 60 + sec / 3600;
  return dir === "S" || dir === "W" ? -v : v;
}

export const formatDms = (d: Dms) => `${d.deg}° ${d.min}′ ${fmt(d.sec, 2)}″ ${d.dir}`;

/* ————— مقاساتُ الملابس ————— */

export type SizeRow = { eu: string; uk: string; us: string; intl?: string; cm?: string };

export const SIZE_TABLES: { id: string; name: string; cols: string[]; rows: SizeRow[] }[] = [
  {
    id: "men-clothes", name: "ملابس رجاليّة", cols: ["الدوليّ", "أوروبا", "بريطانيا", "أمريكا"],
    rows: [
      { intl: "XS", eu: "44", uk: "34", us: "34" },
      { intl: "S", eu: "46", uk: "36", us: "36" },
      { intl: "M", eu: "48–50", uk: "38–40", us: "38–40" },
      { intl: "L", eu: "52", uk: "42", us: "42" },
      { intl: "XL", eu: "54", uk: "44", us: "44" },
      { intl: "XXL", eu: "56", uk: "46", us: "46" },
    ],
  },
  {
    id: "women-clothes", name: "ملابس نسائيّة", cols: ["الدوليّ", "أوروبا", "بريطانيا", "أمريكا"],
    rows: [
      { intl: "XS", eu: "32–34", uk: "6", us: "2" },
      { intl: "S", eu: "36", uk: "8", us: "4" },
      { intl: "M", eu: "38–40", uk: "10–12", us: "6–8" },
      { intl: "L", eu: "42", uk: "14", us: "10" },
      { intl: "XL", eu: "44", uk: "16", us: "12" },
      { intl: "XXL", eu: "46", uk: "18", us: "14" },
    ],
  },
  {
    id: "men-shoes", name: "أحذية رجاليّة", cols: ["الطول سم", "أوروبا", "بريطانيا", "أمريكا"],
    rows: [
      { cm: "25.0", eu: "39", uk: "6", us: "7" },
      { cm: "25.7", eu: "40", uk: "6.5", us: "7.5" },
      { cm: "26.3", eu: "41", uk: "7.5", us: "8.5" },
      { cm: "27.0", eu: "42", uk: "8", us: "9" },
      { cm: "27.7", eu: "43", uk: "9", us: "10" },
      { cm: "28.3", eu: "44", uk: "9.5", us: "10.5" },
      { cm: "29.0", eu: "45", uk: "10.5", us: "11.5" },
      { cm: "29.7", eu: "46", uk: "11", us: "12" },
    ],
  },
  {
    id: "women-shoes", name: "أحذية نسائيّة", cols: ["الطول سم", "أوروبا", "بريطانيا", "أمريكا"],
    rows: [
      { cm: "22.0", eu: "35", uk: "2.5", us: "5" },
      { cm: "22.7", eu: "36", uk: "3.5", us: "6" },
      { cm: "23.3", eu: "37", uk: "4", us: "6.5" },
      { cm: "24.0", eu: "38", uk: "5", us: "7.5" },
      { cm: "24.7", eu: "39", uk: "6", us: "8.5" },
      { cm: "25.3", eu: "40", uk: "6.5", us: "9" },
      { cm: "26.0", eu: "41", uk: "7.5", us: "10" },
    ],
  },
];

/* ————— المناطقُ الزمنيّة ————— */

export const TIMEZONES: { id: string; name: string }[] = [
  { id: "Asia/Damascus", name: "دمشق" },
  { id: "Asia/Beirut", name: "بيروت" },
  { id: "Asia/Amman", name: "عمّان" },
  { id: "Asia/Jerusalem", name: "القدس" },
  { id: "Africa/Cairo", name: "القاهرة" },
  { id: "Asia/Riyadh", name: "الرياض" },
  { id: "Asia/Dubai", name: "دبي" },
  { id: "Asia/Qatar", name: "الدوحة" },
  { id: "Asia/Kuwait", name: "الكويت" },
  { id: "Asia/Baghdad", name: "بغداد" },
  { id: "Africa/Khartoum", name: "الخرطوم" },
  { id: "Africa/Tunis", name: "تونس" },
  { id: "Africa/Algiers", name: "الجزائر" },
  { id: "Africa/Casablanca", name: "الدار البيضاء" },
  { id: "Europe/Istanbul", name: "إسطنبول" },
  { id: "Europe/London", name: "لندن" },
  { id: "Europe/Paris", name: "باريس" },
  { id: "Europe/Berlin", name: "برلين" },
  { id: "America/New_York", name: "نيويورك" },
  { id: "America/Chicago", name: "شيكاغو" },
  { id: "America/Los_Angeles", name: "لوس أنجلوس" },
  { id: "Asia/Karachi", name: "كراتشي" },
  { id: "Asia/Kolkata", name: "دلهي" },
  { id: "Asia/Jakarta", name: "جاكرتا" },
  { id: "Asia/Kuala_Lumpur", name: "كوالالمبور" },
  { id: "Asia/Tokyo", name: "طوكيو" },
  { id: "Australia/Sydney", name: "سيدني" },
];

/** إزاحةُ منطقةٍ بالدقائق عند لحظةٍ معيّنة — يحسبها المتصفّح فيراعي التوقيت الصيفيّ */
export function zoneOffsetMinutes(tz: string, at: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const p = Object.fromEntries(dtf.formatToParts(at).map((x) => [x.type, x.value]));
  const asUtc = Date.UTC(
    Number(p.year), Number(p.month) - 1, Number(p.day),
    Number(p.hour) % 24, Number(p.minute), Number(p.second),
  );
  return Math.round((asUtc - at.getTime()) / 60000);
}

/** «الساعةُ س في مدينة أ» = كم في مدينة ب */
export function convertZone(dateIso: string, timeHm: string, fromTz: string, toTz: string) {
  const [y, mo, d] = dateIso.split("-").map(Number);
  const [h, mi] = timeHm.split(":").map(Number);
  if ([y, mo, d, h, mi].some((n) => !Number.isFinite(n))) return null;
  // نقدّر اللحظةَ ثمّ نصحّحها بإزاحة المصدر (تكرارٌ واحدٌ يكفي خارج حدود التبديل)
  let guess = Date.UTC(y, mo - 1, d, h, mi);
  for (let i = 0; i < 3; i++) {
    const off = zoneOffsetMinutes(fromTz, new Date(guess));
    const corrected = Date.UTC(y, mo - 1, d, h, mi) - off * 60000;
    if (corrected === guess) break;
    guess = corrected;
  }
  const at = new Date(guess);
  const show = (tz: string) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone: tz, hour12: false,
      weekday: "short", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    }).format(at);
  return {
    instant: at,
    fromText: show(fromTz),
    toText: show(toTz),
    diffHours: (zoneOffsetMinutes(toTz, at) - zoneOffsetMinutes(fromTz, at)) / 60,
  };
}
