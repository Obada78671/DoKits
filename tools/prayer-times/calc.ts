/**
 * مواقيتُ الصلاة — حسابٌ فلكيٌّ كاملٌ في المتصفّح، بلا خدمةٍ ولا تتبّعِ موقع.
 *
 * الطريقةُ قياسيّةٌ ومعروفة: موضعُ الشمس (الميلُ ومعادلةُ الزمن) ثمّ زاويةُ الساعة
 * لكلّ ارتفاعٍ مطلوب. والزوايا تختلف بين الهيئات، فالخيارُ للمستخدم.
 *
 * **حدٌّ معلَن:** هذا حسابٌ فلكيّ. الأشهرُ الرسميّةُ في كلّ بلدٍ قد تفارقه دقائق
 * لاختلاف الطريقة أو التقريب — قارنه بتقويم بلدك قبل الاعتماد.
 */

const DEG = Math.PI / 180;
const sin = (d: number) => Math.sin(d * DEG);
const cos = (d: number) => Math.cos(d * DEG);
const tan = (d: number) => Math.tan(d * DEG);
const asin = (x: number) => Math.asin(x) / DEG;
const acos = (x: number) => Math.acos(x) / DEG;
const atan2 = (y: number, x: number) => Math.atan2(y, x) / DEG;
const acot = (x: number) => Math.atan(1 / x) / DEG;

const fixAngle = (a: number) => ((a % 360) + 360) % 360;
const fixHour = (h: number) => ((h % 24) + 24) % 24;

export type Method = "mwl" | "isna" | "egypt" | "makkah" | "karachi" | "gulf";

export const METHODS: { id: Method; name: string; note: string }[] = [
  { id: "mwl", name: "رابطة العالم الإسلاميّ", note: "الفجر ١٨° · العشاء ١٧°" },
  { id: "makkah", name: "أمّ القرى", note: "الفجر ١٨٫٥° · العشاء بعد المغرب ٩٠ دقيقة" },
  { id: "egypt", name: "الهيئة المصريّة", note: "الفجر ١٩٫٥° · العشاء ١٧٫٥°" },
  { id: "karachi", name: "جامعة كراتشي", note: "الفجر ١٨° · العشاء ١٨°" },
  { id: "isna", name: "ISNA (أمريكا الشماليّة)", note: "الفجر ١٥° · العشاء ١٥°" },
  { id: "gulf", name: "هيئة الخليج", note: "الفجر ١٩٫٥° · العشاء بعد المغرب ٩٠ دقيقة" },
];

type Params = { fajr: number; isha: number | { minutes: number } };

const PARAMS: Record<Method, Params> = {
  mwl: { fajr: 18, isha: 17 },
  isna: { fajr: 15, isha: 15 },
  egypt: { fajr: 19.5, isha: 17.5 },
  karachi: { fajr: 18, isha: 18 },
  makkah: { fajr: 18.5, isha: { minutes: 90 } },
  gulf: { fajr: 19.5, isha: { minutes: 90 } },
};

export type AsrSchool = "standard" | "hanafi";

/** اليومُ اليوليانيّ عند منتصف ليل UTC */
export function julianDay(y: number, m: number, d: number): number {
  if (m <= 2) { y -= 1; m += 12; }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
}

/** ميلُ الشمس ومعادلةُ الزمن — تقريبٌ فلكيٌّ قياسيٌّ دقّتُه أجزاءُ الدقيقة */
export function sunPosition(jd: number): { decl: number; eqt: number } {
  const D = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * D);
  const q = fixAngle(280.459 + 0.98564736 * D);
  const L = fixAngle(q + 1.915 * sin(g) + 0.020 * sin(2 * g));
  const e = 23.439 - 0.00000036 * D;
  const RA = fixHour(atan2(cos(e) * sin(L), cos(L)) / 15);
  return { decl: asin(sin(e) * sin(L)), eqt: q / 15 - RA };
}

export type PrayerTimes = {
  fajr: number; sunrise: number; dhuhr: number; asr: number;
  maghrib: number; isha: number; /** منتصفُ الليل الشرعيّ */ midnight: number;
};

export type PrayerInput = {
  date: Date;         // بتوقيت UTC لليوم المطلوب
  lat: number;
  lng: number;
  /** إزاحةُ المنطقة بالساعات عند ذلك اليوم (تراعي التوقيت الصيفيّ) */
  tzHours: number;
  method: Method;
  asr: AsrSchool;
};

/** يحسب المواقيتَ بالساعات العشريّة بتوقيت المنطقة */
export function prayerTimes(i: PrayerInput): PrayerTimes {
  const jd = julianDay(i.date.getUTCFullYear(), i.date.getUTCMonth() + 1, i.date.getUTCDate())
    - i.lng / (15 * 24);

  const at = (t: number) => sunPosition(jd + t / 24);

  // الظهر: عبورُ الشمس خطَّ الزوال
  const midDay = (t: number) => fixHour(12 - at(t).eqt);

  /** الوقتُ الذي تكون فيه الشمسُ على ارتفاعٍ زاويّ (سالبٌ تحت الأفق) */
  const angleTime = (angle: number, t: number, before: boolean) => {
    const { decl } = at(t);
    const arg = (-sin(angle) - sin(decl) * sin(i.lat)) / (cos(decl) * cos(i.lat));
    if (arg < -1 || arg > 1) return NaN; // لا يحدث في خطوط العرض العالية
    const v = acos(arg) / 15;
    return midDay(t) + (before ? -v : v);
  };

  const asrTime = (factor: number, t: number) => {
    const { decl } = at(t);
    const angle = -acot(factor + tan(Math.abs(i.lat - decl)));
    return angleTime(angle, t, false);
  };

  const p = PARAMS[i.method];
  // تكراراتٌ قليلةٌ تُثبّت القيم (كلُّ وقتٍ يعتمد على موضع الشمس عنده)
  let dhuhr = midDay(12 / 24);
  let sunrise = angleTime(0.833, 6 / 24, true);
  let maghrib = angleTime(0.833, 18 / 24, false);
  let fajr = angleTime(p.fajr, 5 / 24, true);
  let asr = asrTime(i.asr === "hanafi" ? 2 : 1, 13 / 24);
  let isha = typeof p.isha === "number" ? angleTime(p.isha, 18 / 24, false) : NaN;

  for (let k = 0; k < 3; k++) {
    dhuhr = midDay(dhuhr / 24);
    sunrise = angleTime(0.833, sunrise / 24, true);
    maghrib = angleTime(0.833, maghrib / 24, false);
    fajr = angleTime(p.fajr, fajr / 24, true);
    asr = asrTime(i.asr === "hanafi" ? 2 : 1, asr / 24);
    if (typeof p.isha === "number") isha = angleTime(p.isha, isha / 24, false);
  }
  if (typeof p.isha !== "number") isha = maghrib + p.isha.minutes / 60;

  const shift = i.tzHours - i.lng / 15;
  const adj = (t: number) => fixHour(t + shift);

  const fajrAdj = adj(fajr);
  const maghribAdj = adj(maghrib);
  // منتصفُ الليل الشرعيّ: منتصفُ ما بين المغرب وفجر الغد
  const nightLength = fixHour(fajrAdj - maghribAdj);
  return {
    fajr: fajrAdj,
    sunrise: adj(sunrise),
    dhuhr: adj(dhuhr),
    asr: adj(asr),
    maghrib: maghribAdj,
    isha: adj(isha),
    midnight: fixHour(maghribAdj + nightLength / 2),
  };
}

export function formatTime(hours: number): string {
  if (!Number.isFinite(hours)) return "—";
  let h = Math.floor(hours);
  let m = Math.round((hours - h) * 60);
  if (m === 60) { m = 0; h = (h + 1) % 24; }
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export const PRAYER_NAMES: { key: keyof PrayerTimes; name: string }[] = [
  { key: "fajr", name: "الفجر" },
  { key: "sunrise", name: "الشروق" },
  { key: "dhuhr", name: "الظهر" },
  { key: "asr", name: "العصر" },
  { key: "maghrib", name: "المغرب" },
  { key: "isha", name: "العشاء" },
];

export type City = { id: string; name: string; lat: number; lng: number; tz: string };

export const CITIES: City[] = [
  { id: "mecca", name: "مكّة المكرّمة", lat: 21.4225, lng: 39.8262, tz: "Asia/Riyadh" },
  { id: "medina", name: "المدينة المنوّرة", lat: 24.4686, lng: 39.6142, tz: "Asia/Riyadh" },
  { id: "riyadh", name: "الرياض", lat: 24.7136, lng: 46.6753, tz: "Asia/Riyadh" },
  { id: "jeddah", name: "جدّة", lat: 21.4858, lng: 39.1925, tz: "Asia/Riyadh" },
  { id: "damascus", name: "دمشق", lat: 33.5138, lng: 36.2765, tz: "Asia/Damascus" },
  { id: "aleppo", name: "حلب", lat: 36.2021, lng: 37.1343, tz: "Asia/Damascus" },
  { id: "beirut", name: "بيروت", lat: 33.8938, lng: 35.5018, tz: "Asia/Beirut" },
  { id: "amman", name: "عمّان", lat: 31.9539, lng: 35.9106, tz: "Asia/Amman" },
  { id: "jerusalem", name: "القدس", lat: 31.7683, lng: 35.2137, tz: "Asia/Jerusalem" },
  { id: "cairo", name: "القاهرة", lat: 30.0444, lng: 31.2357, tz: "Africa/Cairo" },
  { id: "baghdad", name: "بغداد", lat: 33.3152, lng: 44.3661, tz: "Asia/Baghdad" },
  { id: "dubai", name: "دبي", lat: 25.2048, lng: 55.2708, tz: "Asia/Dubai" },
  { id: "doha", name: "الدوحة", lat: 25.2854, lng: 51.5310, tz: "Asia/Qatar" },
  { id: "kuwait", name: "الكويت", lat: 29.3759, lng: 47.9774, tz: "Asia/Kuwait" },
  { id: "khartoum", name: "الخرطوم", lat: 15.5007, lng: 32.5599, tz: "Africa/Khartoum" },
  { id: "tunis", name: "تونس", lat: 36.8065, lng: 10.1815, tz: "Africa/Tunis" },
  { id: "algiers", name: "الجزائر", lat: 36.7538, lng: 3.0588, tz: "Africa/Algiers" },
  { id: "casablanca", name: "الدار البيضاء", lat: 33.5731, lng: -7.5898, tz: "Africa/Casablanca" },
  { id: "istanbul", name: "إسطنبول", lat: 41.0082, lng: 28.9784, tz: "Europe/Istanbul" },
  { id: "london", name: "لندن", lat: 51.5074, lng: -0.1278, tz: "Europe/London" },
  { id: "paris", name: "باريس", lat: 48.8566, lng: 2.3522, tz: "Europe/Paris" },
  { id: "berlin", name: "برلين", lat: 52.52, lng: 13.405, tz: "Europe/Berlin" },
];
