/**
 * أسماءُ بيانات المكتبات بالإنجليزيّة — خريطةٌ واحدةٌ بالمعرّف.
 *
 * البديلُ كان حقلَ `nameEn` إلى جانب كلّ `name` في كلّ مكتبة: تعديلُ مئاتِ
 * الأسطر، وتضخيمُ ما يُسلسَل إلى العميل بنصٍّ لا يقرؤه إلّا نصفُ الزوّار.
 * وهنا وحدةٌ واحدةٌ لا تُحمّل إلّا حيث يُطلَب الاسمُ الإنجليزيّ.
 *
 * والمفتاحُ هو المعرّفُ الثابت لا النصُّ العربيّ: تعديلُ صياغةٍ عربيّةٍ لا يكسر
 * الترجمة، وحذفُ عنصرٍ يُظهر نفسَه في الفحص لا في وجه المستخدم.
 */

export const UNIT_EN: Record<string, string> = {
  // العائلات
  length: "Length", mass: "Mass", volume: "Volume", area: "Area", speed: "Speed", time: "Time",
  // الطول
  mm: "Millimetre", cm: "Centimetre", m: "Metre", km: "Kilometre", in: "Inch", ft: "Foot",
  yd: "Yard", mi: "Mile", nmi: "Nautical mile",
  // الكتلة
  mg: "Milligram", g: "Gram", kg: "Kilogram", t: "Tonne", oz: "Ounce", lb: "Pound", st: "Stone",
  // الحجم
  ml: "Millilitre", l: "Litre", m3: "Cubic metre", tsp: "Teaspoon", tbsp: "Tablespoon",
  cup: "Cup", gal: "US gallon", galuk: "Imperial gallon",
  // المساحة
  cm2: "Square centimetre", m2: "Square metre", km2: "Square kilometre", ha: "Hectare",
  dunam: "Dunam", ft2: "Square foot", ac: "Acre",
  // السرعة
  mps: "Metres/second", kmh: "km/h", mph: "mph", kn: "Knot",
  // الزمن
  ms: "Millisecond", s: "Second", min: "Minute", h: "Hour", d: "Day", wk: "Week",
  // الحرارة
  c: "Celsius", f: "Fahrenheit", k: "Kelvin",
};

export const TZ_EN: Record<string, string> = {
  "Asia/Damascus": "Damascus", "Asia/Beirut": "Beirut", "Asia/Amman": "Amman",
  "Asia/Jerusalem": "Jerusalem", "Africa/Cairo": "Cairo", "Asia/Riyadh": "Riyadh",
  "Asia/Dubai": "Dubai", "Asia/Qatar": "Doha", "Asia/Kuwait": "Kuwait City",
  "Asia/Baghdad": "Baghdad", "Africa/Khartoum": "Khartoum", "Africa/Tunis": "Tunis",
  "Africa/Algiers": "Algiers", "Africa/Casablanca": "Casablanca", "Europe/Istanbul": "Istanbul",
  "Europe/London": "London", "Europe/Paris": "Paris", "Europe/Berlin": "Berlin",
  "America/New_York": "New York", "America/Chicago": "Chicago", "America/Los_Angeles": "Los Angeles",
  "Asia/Karachi": "Karachi", "Asia/Kolkata": "Delhi", "Asia/Jakarta": "Jakarta",
  "Asia/Kuala_Lumpur": "Kuala Lumpur", "Asia/Tokyo": "Tokyo", "Australia/Sydney": "Sydney",
};

export const CITY_EN: Record<string, string> = {
  mecca: "Mecca", medina: "Medina", riyadh: "Riyadh", jeddah: "Jeddah",
  damascus: "Damascus", aleppo: "Aleppo", beirut: "Beirut", amman: "Amman",
  jerusalem: "Jerusalem", cairo: "Cairo", baghdad: "Baghdad", dubai: "Dubai",
  doha: "Doha", kuwait: "Kuwait City", khartoum: "Khartoum", tunis: "Tunis",
  algiers: "Algiers", casablanca: "Casablanca", istanbul: "Istanbul",
  london: "London", paris: "Paris", berlin: "Berlin",
};

export const PRAYER_EN: Record<string, string> = {
  fajr: "Fajr", sunrise: "Sunrise", dhuhr: "Dhuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha",
};

export const METHOD_EN: Record<string, { name: string; note: string }> = {
  mwl: { name: "Muslim World League", note: "Fajr 18° · Isha 17°" },
  makkah: { name: "Umm al-Qura", note: "Fajr 18.5° · Isha 90 min after Maghrib" },
  egypt: { name: "Egyptian General Authority", note: "Fajr 19.5° · Isha 17.5°" },
  karachi: { name: "University of Karachi", note: "Fajr 18° · Isha 18°" },
  isna: { name: "ISNA (North America)", note: "Fajr 15° · Isha 15°" },
  gulf: { name: "Gulf Region", note: "Fajr 19.5° · Isha 90 min after Maghrib" },
};

export const VAT_EN: Record<string, string> = {
  sa: "Saudi Arabia", ae: "UAE", om: "Oman", bh: "Bahrain",
  eg: "Egypt", jo: "Jordan", ma: "Morocco", tn: "Tunisia",
};

export const SIZE_TABLE_EN: Record<string, { name: string; cols: string[] }> = {
  "men-clothes": { name: "Men's clothing", cols: ["International", "EU", "UK", "US"] },
  "women-clothes": { name: "Women's clothing", cols: ["International", "EU", "UK", "US"] },
  "men-shoes": { name: "Men's shoes", cols: ["Length cm", "EU", "UK", "US"] },
  "women-shoes": { name: "Women's shoes", cols: ["Length cm", "EU", "UK", "US"] },
};

export const HARMONY_EN: Record<string, { name: string; note: string }> = {
  complement: { name: "Complementary", note: "A colour and its opposite on the wheel — the highest hue contrast." },
  analogous: { name: "Analogous", note: "Neighbours on the wheel — calm and cohesive." },
  triad: { name: "Triadic", note: "Three evenly spaced — lively and balanced." },
  tetrad: { name: "Tetradic", note: "Two complementary pairs — rich, and it needs one dominant colour." },
  mono: { name: "Monochrome", note: "One hue across a lightness ramp — the safest for a serious interface." },
};

export const FORMAT_EN: Record<string, string> = {
  "image/webp": "Smallest at comparable quality — supported by every modern browser.",
  "image/jpeg": "The most widely compatible, and it has no transparency.",
  "image/png": "Lossless with transparency — the largest for photographs.",
};

export const ICON_USE_EN: Record<number, string> = {
  16: "Browser tab",
  32: "High-density tab and bookmarks",
  48: "Windows desktop shortcut",
  180: "iPhone and iPad home screen",
  192: "Android and the web app manifest",
  512: "Splash screen and app stores",
};

export const PLATFORM_EN: Record<string, string> = {
  x: "X (Twitter)", "x-premium": "X Premium",
  linkedin: "LinkedIn — post", "linkedin-headline": "LinkedIn — headline",
  instagram: "Instagram — caption", whatsapp: "WhatsApp — status",
  sms: "SMS (Arabic text)", "meta-desc": "Search engine meta description",
};

export const HIJRI_MONTH_EN = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani", "Jumada al-Ula", "Jumada al-Akhirah",
  "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah",
];

export const GREGORIAN_MONTH_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const WEEKDAY_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** يترجم بالمعرّف، ويرجع الاسمَ العربيَّ متى لم تُترجَم القيمةُ بعد */
export const en = <T,>(map: Record<string | number, T>, id: string | number, fallback: T): T =>
  map[id] ?? fallback;
