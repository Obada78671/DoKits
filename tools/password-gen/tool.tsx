"use client";

import { useCallback, useEffect, useState } from "react";
import { CopyButton, Field, Note, ToggleChips, ToolLayout } from "@/components/tool-kit";
import {
  buildPool, cryptoWords, entropyBits, randomFrom, strengthLabel, type CharsetId,
} from "@/tools/dev-lib";

const SETS: { id: CharsetId; label: string }[] = [
  { id: "lower", label: "أحرفٌ صغيرة a-z" },
  { id: "upper", label: "أحرفٌ كبيرة A-Z" },
  { id: "digits", label: "أرقام 0-9" },
  { id: "symbols", label: "رموز !@#" },
];

const COUNT = 5;

export default function PasswordGen() {
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
      <Field label={`الطول: ${length} محرفاً`} htmlFor="pg-len">
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

      <ToggleChips label="ما تحويه" options={SETS} value={sets} onToggle={toggle} />

      <button className={`chip self-start ${noAmbiguous ? "chip-active" : ""}`} onClick={() => setNoAmbiguous(!noAmbiguous)}>
        بلا محارفَ ملتبسة (O 0 l 1 I)
      </button>

      <div className={`rounded-m border px-4 py-3 ${strength.lit ? "border-accent bg-accent-soft" : "border-line bg-surface"}`}>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span dir="ltr" className="font-mono text-2xl font-medium tabular-nums">{bits}</span>
          <span className="text-[0.82rem] text-muted">بتّاً من العشوائيّة</span>
          <span className="ms-auto font-semibold text-ink">{strength.label}</span>
        </div>
        <p className="mt-1 text-[0.8rem] text-muted">
          البركةُ {pool.length} محرفاً — كلُّ محرفٍ يضيف {(Math.log2(pool.length) || 0).toFixed(1)} بتّاً.
        </p>
      </div>

      <div className="rounded-m border border-line bg-surface">
        <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
          <span className="text-[0.78rem] font-bold tracking-wide text-primary">اختر واحدة</span>
          <button className="btn btn-ghost !px-3 !py-1 !text-[0.82rem] ms-auto" onClick={generate}>
            ولّد غيرَها
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
        العشوائيّةُ من <code className="font-mono text-[0.85rem]">crypto.getRandomValues</code> — مولّدُ
        النظام المعتمَدُ للتعمية، لا <code className="font-mono text-[0.85rem]">Math.random</code>.
        والاختيارُ يرفض القيمَ الزائدةَ بدل أن يأخذ باقيَ القسمة، فلا تميل الكلمةُ إلى أوائل البركة.
        <b className="font-semibold text-ink"> ولا تُرسَل الكلماتُ ولا تُحفَظ في أيّ مكان</b> — أغلقِ الصفحةَ فتزول.
      </Note>

      <Note>
        الطولُ يغلب التعقيد: عشرون حرفاً صغيراً أقوى من ثمانيةٍ بكلّ الرموز. وأهمُّ من هذا كلِّه
        <b className="font-semibold text-ink"> ألّا تُكرَّر كلمةُ المرور بين موقعين</b> — فاحفظها في مديرِ كلماتِ مرور.
      </Note>
    </ToolLayout>
  );
}
