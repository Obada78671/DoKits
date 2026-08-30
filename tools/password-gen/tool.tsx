"use client";

import { useCallback, useEffect, useState } from "react";
import { CopyButton, Field, Note, ToggleChips, ToolLayout } from "@/components/tool-kit";
import { useStrings } from "@/components/lang";
import {
  buildPool, cryptoWords, entropyBits, randomFrom, strengthLabel, type CharsetId,
} from "@/tools/dev-lib";

const S = {
  ar: {
    sets: { lower: "أحرفٌ صغيرة a-z", upper: "أحرفٌ كبيرة A-Z", digits: "أرقام 0-9", symbols: "رموز !@#" },
    length: (n: number) => `الطول: ${n} محرفاً`,
    contains: "ما تحويه", noAmb: "بلا محارفَ ملتبسة (O 0 l 1 I)",
    bits: "بتّاً من العشوائيّة",
    pool: (n: number, per: string) => `البركةُ ${n} محرفاً — كلُّ محرفٍ يضيف ${per} بتّاً.`,
    pick: "اختر واحدة", again: "ولّد غيرَها",
    level: {
      weak: "ضعيفة — تُكسَر بحاسوبٍ عاديّ", ok: "مقبولةٌ لحسابٍ غير مهمّ",
      good: "جيّدة", strong: "قويّة", overkill: "قويّةٌ جدّاً — أكثرُ ممّا يلزم عادةً",
    },
    note1a: "العشوائيّةُ من ", note1b: " — مولّدُ النظام المعتمَدُ للتعمية، لا ",
    note1c: ". والاختيارُ يرفض القيمَ الزائدةَ بدل أن يأخذ باقيَ القسمة، فلا تميل الكلمةُ إلى أوائل البركة.",
    note1bold: " ولا تُرسَل الكلماتُ ولا تُحفَظ في أيّ مكان", note1d: " — أغلقِ الصفحةَ فتزول.",
    note2a: "الطولُ يغلب التعقيد: عشرون حرفاً صغيراً أقوى من ثمانيةٍ بكلّ الرموز. وأهمُّ من هذا كلِّه",
    note2bold: " ألّا تُكرَّر كلمةُ المرور بين موقعين", note2b: " — فاحفظها في مديرِ كلماتِ مرور.",
  },
  en: {
    sets: { lower: "Lowercase a-z", upper: "Uppercase A-Z", digits: "Digits 0-9", symbols: "Symbols !@#" },
    length: (n: number) => `Length: ${n} characters`,
    contains: "What it contains", noAmb: "No look-alike characters (O 0 l 1 I)",
    bits: "bits of entropy",
    pool: (n: number, per: string) => `Pool of ${n} characters — each one adds ${per} bits.`,
    pick: "Pick one", again: "Generate more",
    level: {
      weak: "Weak — an ordinary computer breaks it", ok: "Acceptable for an unimportant account",
      good: "Good", strong: "Strong", overkill: "Very strong — more than usually needed",
    },
    note1a: "Randomness comes from ", note1b: " — the system's cryptographic generator, not ",
    note1c: ". Values above the fold are rejected rather than reduced modulo, so the password never leans toward the start of the pool.",
    note1bold: " Passwords are never sent anywhere and never stored", note1d: " — close the page and they are gone.",
    note2a: "Length beats complexity: twenty lowercase letters are stronger than eight with every symbol. And more important than either,",
    note2bold: " never reuse a password across two sites", note2b: " — keep them in a password manager.",
  },
};

const SET_IDS: CharsetId[] = ["lower", "upper", "digits", "symbols"];

const COUNT = 5;

export default function PasswordGen() {
  const s = useStrings(S);
  const [length, setLength] = useState(20);
  const [sets, setSets] = useState<Set<CharsetId>>(new Set(["lower", "upper", "digits", "symbols"]));
  const [noAmbiguous, setNoAmbiguous] = useState(false);
  // التوليدُ لا يجري إلّا في المتصفّح: عشوائيٌّ أثناء الرسم يختلف بين الخادم والصفحة
  const [list, setList] = useState<string[]>([]);

  const pool = buildPool([...sets], noAmbiguous);
  const bits = entropyBits(pool.length, length);
  const strength = strengthLabel(bits);

  const generate = useCallback(() => {
    if (!pool.length) { setList([]); return; }
    setList(Array.from({ length: COUNT }, () => randomFrom(pool, length, cryptoWords)));
  }, [pool, length]);

  useEffect(() => { generate(); }, [generate]);

  const toggle = (id: CharsetId) => {
    const next = new Set(sets);
    if (next.has(id)) next.delete(id); else next.add(id);
    if (next.size) setSets(next);
  };

  return (
    <ToolLayout>
      <Field label={s.length(length)} htmlFor="pg-len">
        <input
          id="pg-len"
          type="range"
          min={8}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full accent-[var(--dk-primary)]"
        />
      </Field>

      <ToggleChips label={s.contains} options={SET_IDS.map((id) => ({ id, label: s.sets[id] }))} value={sets} onToggle={toggle} />

      <button className={`chip self-start ${noAmbiguous ? "chip-active" : ""}`} onClick={() => setNoAmbiguous(!noAmbiguous)}>
        {s.noAmb}
      </button>

      <div className={`rounded-m border px-4 py-3 ${strength.lit ? "border-accent bg-accent-soft" : "border-line bg-surface"}`}>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span dir="ltr" className="font-mono text-2xl font-medium tabular-nums">{bits}</span>
          <span className="text-[0.82rem] text-muted">{s.bits}</span>
          <span className="ms-auto font-semibold text-ink">{s.level[strength.level]}</span>
        </div>
        <p className="mt-1 text-[0.8rem] text-muted">
          {s.pool(pool.length, (Math.log2(pool.length) || 0).toFixed(1))}
        </p>
      </div>

      <div className="rounded-m border border-line bg-surface">
        <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
          <span className="text-[0.78rem] font-bold tracking-wide text-primary">{s.pick}</span>
          <button className="btn btn-ghost !px-3 !py-1 !text-[0.82rem] ms-auto" onClick={generate}>
            {s.again}
          </button>
        </div>
        <ul className="divide-y divide-line">
          {list.length === 0 && <li className="px-4 py-3 text-[0.9rem] text-muted">…</li>}
          {list.map((p) => (
            <li key={p} className="flex items-center gap-2 px-4 py-2">
              <span dir="ltr" className="min-w-0 break-all font-mono text-[0.95rem]">{p}</span>
              <span className="ms-auto shrink-0"><CopyButton value={p} /></span>
            </li>
          ))}
        </ul>
      </div>

      <Note>
        {s.note1a}<code className="font-mono text-[0.85rem]">crypto.getRandomValues</code>{s.note1b}
        <code className="font-mono text-[0.85rem]">Math.random</code>{s.note1c}
        <b className="font-semibold text-ink">{s.note1bold}</b>{s.note1d}
      </Note>

      <Note>
        {s.note2a}
        <b className="font-semibold text-ink">{s.note2bold}</b>{s.note2b}
      </Note>
    </ToolLayout>
  );
}
