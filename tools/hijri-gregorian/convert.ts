/**
 * تحويلٌ بين الهجريّ والميلاديّ — دوالُّ نقيّة بلا DOM (القاعدة ٧ من عقد التطبيع).
 *
 * الأساسُ `Intl` المدمج في المتصفّح (ICU) — لا مكتبةَ خارجيّةً ولا جداولَ منسوخة
 * (القاعدة ٥). و`Intl` يحوّل في اتجاهٍ واحد (ميلاديّ ← هجريّ)، فالاتجاهُ العكسيّ
 * يُبنى بتقديرٍ ثمّ تقريبٍ متكرّرٍ حتّى المطابقة التامّة.
 *
 * **التقويمُ الهجريّ حسابيٌّ لا رَصْديّ:** أمّ القرى هو المعتمَد رسميّاً في السعوديّة
 * وأكثرِ الأنظمة، وقد يفارق رؤيةَ الهلال المحلّيّة يوماً.
 */

export type HijriCalendar = "islamic-umalqura" | "islamic-civil";

export const CALENDARS: { id: HijriCalendar; nameAr: string; noteAr: string }[] = [
  { id: "islamic-umalqura", nameAr: "أمّ القرى", noteAr: "المعتمَد رسميّاً في السعوديّة وأكثرِ الأنظمة" },
  { id: "islamic-civil", nameAr: "الحسابيّ المدنيّ", noteAr: "جدوليٌّ ثابت — قد يفارق أمّ القرى يوماً" },
];

export const HIJRI_MONTHS = [
  "محرّم", "صفر", "ربيع الأوّل", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
  "رجب", "شعبان", "رمضان", "شوّال", "ذو القعدة", "ذو الحجّة",
];

export const HIJRI_MONTHS_EN = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani", "Jumada al-Ula", "Jumada al-Akhirah",
  "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah",
];

/** أسماءُ الشام — وبين قوسين المتداولُ في مصر والخليج */
export const GREG_MONTHS_AR = [
  "كانون الثاني", "شباط", "آذار", "نيسان", "أيّار", "حزيران",
  "تمّوز", "آب", "أيلول", "تشرين الأوّل", "تشرين الثاني", "كانون الأوّل",
];
export const GREG_MONTHS_ALT = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];
export const GREG_MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const WEEKDAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
export const WEEKDAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** حدودٌ يضمن ICU دقّتَه ضمنها لأمّ القرى */
export const HIJRI_MIN_YEAR = 1300;
export const HIJRI_MAX_YEAR = 1600;
export const GREG_MIN_YEAR = 1883;
export const GREG_MAX_YEAR = 2174;

const MS_DAY = 86_400_000;
/** ١ محرّم ١ هـ ≈ ١٦ تمّوز ٦٢٢م — نقطةُ انطلاقٍ للتقدير لا أكثر */
const HIJRI_EPOCH = Date.UTC(622, 6, 16);

export type DateParts = { y: number; m: number; d: number };

const formatters = new Map<string, Intl.DateTimeFormat>();
function hijriFormatter(calendar: HijriCalendar): Intl.DateTimeFormat {
  let f = formatters.get(calendar);
  if (!f) {
    f = new Intl.DateTimeFormat(`en-u-ca-${calendar}`, {
      year: "numeric", month: "numeric", day: "numeric", timeZone: "UTC",
    });
    formatters.set(calendar, f);
  }
  return f;
}

/** ميلاديّ ← هجريّ (المسارُ الذي يوفّره Intl مباشرةً) */
export function toHijri(date: Date, calendar: HijriCalendar): DateParts {
  const parts = hijriFormatter(calendar).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { y: get("year"), m: get("month"), d: get("day") };
}

/**
 * هجريّ ← ميلاديّ: تقديرٌ أوّليّ ثمّ تقريبٌ متكرّر، فمسحٌ دقيقٌ ±٥ أيّام.
 * يُرجع `null` إذا كان التاريخُ غيرَ موجودٍ في التقويم (٣٠ في شهرٍ من ٢٩ يوماً).
 */
export function toGregorian(h: DateParts, calendar: HijriCalendar): Date | null {
  const approx = Math.round((h.y - 1) * 354.367 + (h.m - 1) * 29.53 + (h.d - 1));
  let t = HIJRI_EPOCH + approx * MS_DAY;

  for (let i = 0; i < 30; i++) {
    const cur = toHijri(new Date(t), calendar);
    const diff = Math.round((h.y - cur.y) * 354.367 + (h.m - cur.m) * 29.53 + (h.d - cur.d));
    if (diff === 0) break;
    t += diff * MS_DAY;
  }

  for (let off = -5; off <= 5; off++) {
    const cand = new Date(t + off * MS_DAY);
    const c = toHijri(cand, calendar);
    if (c.y === h.y && c.m === h.m && c.d === h.d) return cand;
  }
  return null;
}

/** عددُ أيّام شهرٍ هجريّ (٢٩ أو ٣٠) — لضبط قائمة الأيّام في الواجهة */
export function hijriMonthLength(y: number, m: number, calendar: HijriCalendar): number {
  return toGregorian({ y, m, d: 30 }, calendar) ? 30 : 29;
}

export function gregorianMonthLength(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
export const toArabicDigits = (s: string | number) =>
  String(s).replace(/\d/g, (d) => AR_DIGITS[Number(d)]);

const pad = (n: number) => String(n).padStart(2, "0");

export type Formatted = {
  /** نصٌّ عربيٌّ كامل: الأحد ٣٠ آب ٢٠٢٦ م */
  prose: string;
  /** صيغةٌ رقميّةٌ للنسخ في الأنظمة: 2026-08-30 */
  numeric: string;
  weekdayAr: string;
  weekdayEn: string;
  /** السطرُ الإنكليزيّ: Sunday, 30 August 2026 */
  en: string;
};

export function formatGregorian(date: Date): Formatted {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  const w = date.getUTCDay();
  return {
    prose: `${WEEKDAYS_AR[w]} ${toArabicDigits(d)} ${GREG_MONTHS_AR[m]} / ${GREG_MONTHS_ALT[m]} ${toArabicDigits(y)} م`,
    numeric: `${y}-${pad(m + 1)}-${pad(d)}`,
    weekdayAr: WEEKDAYS_AR[w],
    weekdayEn: WEEKDAYS_EN[w],
    en: `${WEEKDAYS_EN[w]}, ${d} ${GREG_MONTHS_EN[m]} ${y}`,
  };
}

export function formatHijri(h: DateParts, weekdayFrom: Date): Formatted {
  const w = weekdayFrom.getUTCDay();
  return {
    prose: `${WEEKDAYS_AR[w]} ${toArabicDigits(h.d)} ${HIJRI_MONTHS[h.m - 1]} ${toArabicDigits(h.y)} هـ`,
    numeric: `${h.y}-${pad(h.m)}-${pad(h.d)}`,
    weekdayAr: WEEKDAYS_AR[w],
    weekdayEn: WEEKDAYS_EN[w],
    en: `${WEEKDAYS_EN[w]}, ${h.d} ${HIJRI_MONTHS_EN[h.m - 1]} ${h.y} AH`,
  };
}

/** تاريخُ اليوم بتوقيت المستخدم، منقولاً إلى UTC كي لا تزحزحَه المناطق الزمنيّة */
export function todayUtc(now = new Date()): Date {
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}
