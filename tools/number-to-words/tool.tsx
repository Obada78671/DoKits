"use client";

import { useMemo, useState } from "react";
import { CURRENCIES, readPlain, tafqit } from "@/tools/number-to-words/convert";
import { useStrings } from "@/components/lang";

const NO_CURRENCY = "none";

function ResultCard({
  title, dir, value, empty,
}: { title: string; dir: "rtl" | "ltr"; value: string; empty: boolean }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* الحافظة قد تُمنع — لا شيء يُكسر */ }
  };

  return (
    <div className="rounded-m border border-line bg-surface p-4">
      <div className="mb-2 flex items-center gap-3">
        <span className="text-[0.78rem] font-bold tracking-wide text-primary">{title}</span>
        <button
          className="btn btn-ghost ms-auto !px-3 !py-1 !text-[0.82rem]"
          onClick={copy}
          disabled={empty}
        >
          {copied ? "✓" : "⧉"}
        </button>
      </div>
      <p
        dir={dir}
        className={`min-h-14 text-lg leading-loose ${empty ? "text-muted" : "text-ink"}`}
      >
        {empty ? "—" : value}
      </p>
    </div>
  );
}

const S = {
  ar: {
    copy: "نسخ", copied: "نُسخ ✓", number: "الرقم",
    hint: "تقبل الأرقام العربيّة (٢٥٠) واللاتينيّة، وفواصلَ الآلاف.",
    decimals: (n: number): string => ` الكسرُ إلى ${n} خانات.`,
    currency: "العملة", currencyLabel: "اختيار العملة", none: "بلا عملة",
    inArabic: "بالعربيّة", inEnglish: "بالإنكليزيّة",
    note: "صيغةُ التفقيط المعتمدة على الفواتير والشيكات: «فقط … لا غير»، مع مراعاة قواعد العدد العربيّة — تمييزِ العدد، ومطابقةِ الجنس، والمثنّى.",
  },
  en: {
    copy: "Copy", copied: "Copied ✓", number: "Number",
    hint: "Arabic-Indic digits (٢٥٠), Latin digits and thousands separators are all accepted.",
    decimals: (n: number): string => ` Fractions to ${n} places.`,
    currency: "Currency", currencyLabel: "Choose a currency", none: "No currency",
    inArabic: "In Arabic", inEnglish: "In English",
    note: "The wording invoices and cheques use: \"only … and no more\", following Arabic number agreement — the counted noun, gender agreement and the dual.",
  },
};

export default function NumberToWords() {
  const s = useStrings(S);
  const [raw, setRaw] = useState("");
  const [code, setCode] = useState(NO_CURRENCY);

  const currency = CURRENCIES.find((c) => c.code === code) ?? null;

  const out = useMemo(() => {
    if (!raw.trim()) return { ar: "", en: "", error: "" };
    const r = currency ? tafqit(raw, currency) : readPlain(raw);
    return "error" in r ? { ar: "", en: "", error: r.error } : { ...r, error: "" };
  }, [raw, currency]);

  const empty = !out.ar;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="label" htmlFor="ntw-input">{s.number}</label>
        <input
          id="ntw-input"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          inputMode="decimal"
          dir="ltr"
          placeholder="1234.56"
          className="field font-mono text-2xl tabular-nums"
        />
        <p className="mt-1.5 text-[0.82rem] text-muted">
          {s.hint}
          {currency && s.decimals(currency.decimals)}
        </p>
      </div>

      <div>
        <span className="label">{s.currency}</span>
        <div className="flex flex-wrap gap-2" role="group" aria-label={s.currencyLabel}>
          <button
            className={`chip ${code === NO_CURRENCY ? "chip-active" : ""}`}
            onClick={() => setCode(NO_CURRENCY)}
          >
            {s.none}
          </button>
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              className={`chip ${code === c.code ? "chip-active" : ""}`}
              onClick={() => setCode(c.code)}
            >
              {c.nameAr}
            </button>
          ))}
        </div>
      </div>

      {out.error && <p role="alert" className="form-error">{out.error}</p>}

      <div className="flex flex-col gap-3">
        <ResultCard title={s.inArabic} dir="rtl" value={out.ar} empty={empty} />
        <ResultCard title="ENGLISH" dir="ltr" value={out.en} empty={empty} />
      </div>

      {currency && (
        <p className="text-[0.84rem] leading-relaxed text-muted">
          {s.note}
        </p>
      )}
    </div>
  );
}
