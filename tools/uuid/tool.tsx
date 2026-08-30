"use client";

import { useCallback, useEffect, useState } from "react";
import { ChipGroup, CopyButton, Field, Note, TextField, ToolLayout } from "@/components/tool-kit";
import { NIL_UUID, inspectUuid, uuidV4, uuidV7 } from "@/tools/dev-lib";
import { useLang, useStrings } from "@/components/lang";

const S = {
  ar: {
    version: "الإصدار", v4: "v4 عشوائيّ", v7: "v7 زمنيّ", nil: "الصفريّ",
    hV7: "‏v7: ٤٨ بتّاً من زمن يونكس ثمّ عشوائيّ — يُفرَز زمنيّاً، فهو الأفضلُ مفتاحاً أساسيّاً في القاعدة.",
    hNil: "المعرّفُ الصفريّ: قيمةٌ تعني «لا معرّف» بلا اللجوء إلى null.",
    hV4: "‏v4: عشوائيٌّ بالكامل (١٢٢ بتّاً) — الأشيعُ والأسلم متى لم يهمّك الترتيب.",
    count: "العدد", upper: "أحرفٌ كبيرة", again: "ولّد غيرَها",
    ids: (n: number) => `المعرّفات (${n})`, sorted: "مفروزةٌ زمنيّاً بترتيب توليدها",
    check: "افحص معرّفاً", checkHint: "ألصق UUID لتعرف إصدارَه ونمطَه — وزمنَه إن كان v7.",
    verLabel: (n: number) => `الإصدار ${n}`,
    notes: {
      bad: "ليس UUID بالشكل المعياريّ (٨-٤-٤-٤-١٢ خانةً ستّ عشريّة).",
      nil: "المعرّفُ الصفريّ (nil) — يعني «لا معرّف».", max: "المعرّفُ الأقصى (max).",
      v1: "الإصدار ١: زمنٌ + عنوانُ بطاقة الشبكة — يسرّب الجهازَ والوقت.",
      v3: "الإصدار ٣: بصمةُ MD5 لاسمٍ ضمن نطاق.",
      v4: "الإصدار ٤: عشوائيٌّ بالكامل — الأشيعُ والأسلم.",
      v5: "الإصدار ٥: بصمةُ SHA-1 لاسمٍ ضمن نطاق.",
      v7: "الإصدار ٧: زمنُ يونكس ثمّ عشوائيّ — يُفرَز زمنيّاً، وهو الأفضلُ مفتاحاً في القاعدة.",
      other: "إصدارٌ غيرُ شائع.",
    },
    variant: { rfc: "RFC 4122", old: "قديمٌ أو غيرُ معياريّ" },
    n1: "المعرّفاتُ تُولَّد بـ", n2: " في متصفّحك ولا يعرفها أحدٌ سواك. و",
    b: "‏v4 مفتاحاً أساسيّاً يُبعثر فهرسَ القاعدة",
    n3: " لأنّ كلَّ إدخالٍ يهبط في موضعٍ عشوائيّ؛ أمّا v7 فيُلحِق الجديدَ بآخر الفهرس كالرقم المتسلسل — مع بقاء المعرّف غيرَ قابلٍ للتخمين.",
  },
  en: {
    version: "Version", v4: "v4 random", v7: "v7 time-ordered", nil: "Nil",
    hV7: "v7: 48 bits of Unix time then randomness — it sorts chronologically, which makes it the better primary key.",
    hNil: "The nil UUID: a value meaning \"no id\" without resorting to null.",
    hV4: "v4: fully random (122 bits) — the most common and the safest when order does not matter.",
    count: "How many", upper: "Uppercase", again: "Generate more",
    ids: (n: number) => `Identifiers (${n})`, sorted: "sorted chronologically, in generation order",
    check: "Inspect an identifier", checkHint: "Paste a UUID to see its version and variant — and its timestamp if it is v7.",
    verLabel: (n: number) => `Version ${n}`,
    notes: {
      bad: "Not a UUID in the standard form (8-4-4-4-12 hex digits).",
      nil: "The nil UUID — it means \"no identifier\".", max: "The max UUID.",
      v1: "Version 1: timestamp + network card address — it leaks the machine and the time.",
      v3: "Version 3: an MD5 hash of a name within a namespace.",
      v4: "Version 4: fully random — the most common and the safest.",
      v5: "Version 5: a SHA-1 hash of a name within a namespace.",
      v7: "Version 7: Unix time then randomness — it sorts chronologically, and it is the better database key.",
      other: "An uncommon version.",
    },
    variant: { rfc: "RFC 4122", old: "Legacy or non-standard" },
    n1: "Identifiers are generated with ", n2: " in your browser and nobody else ever sees them. And ",
    b: "v4 as a primary key scatters the database index",
    n3: " because every insert lands in a random position; v7 appends to the end of the index like an auto-increment — while staying unguessable.",
  },
};

type Ver = "v4" | "v7" | "nil";

const COUNTS = [1, 5, 10, 25];

export default function Uuid() {
  const s = useStrings(S);
  const isEn = useLang() === "en";
  const [ver, setVer] = useState<Ver>("v4");
  const [count, setCount] = useState(5);
  const [upper, setUpper] = useState(false);
  // التوليدُ بعد التركيب فقط — العشوائيُّ والزمنُ لا يُرسمان على الخادم
  const [list, setList] = useState<string[]>([]);
  const [check, setCheck] = useState("");

  const generate = useCallback(() => {
    const make = () => (ver === "nil" ? NIL_UUID : ver === "v7" ? uuidV7(Date.now()) : uuidV4());
    setList(Array.from({ length: ver === "nil" ? 1 : count }, make));
  }, [ver, count]);

  useEffect(() => { generate(); }, [generate]);

  const shown = list.map((u) => (upper ? u.toUpperCase() : u));
  const info = check.trim() ? inspectUuid(check) : null;

  return (
    <ToolLayout>
      <ChipGroup
        label={s.version}
        value={ver}
        onChange={setVer}
        hint={ver === "v7" ? s.hV7 : ver === "nil" ? s.hNil : s.hV4}
        options={[{ id: "v4", label: s.v4 }, { id: "v7", label: s.v7 }, { id: "nil", label: s.nil }]}
      />

      {ver !== "nil" && (
        <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
          <ChipGroup
            label={s.count}
            value={String(count)}
            onChange={(v) => setCount(Number(v))}
            options={COUNTS.map((c) => ({ id: String(c), label: String(c) }))}
          />
          <button className={`chip ${upper ? "chip-active" : ""}`} onClick={() => setUpper(!upper)}>
            {s.upper}
          </button>
          <button className="btn btn-ghost" onClick={generate}>{s.again}</button>
        </div>
      )}

      <div className="rounded-m border border-line bg-surface">
        <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
          <span className="text-[0.78rem] font-bold tracking-wide text-primary">
            {s.ids(shown.length)}
          </span>
          {ver === "v7" && <span className="text-[0.78rem] text-muted">{s.sorted}</span>}
          <span className="ms-auto shrink-0">
            <CopyButton value={shown.join("\n")} />
          </span>
        </div>
        <ul className="divide-y divide-line">
          {shown.length === 0 && <li className="px-4 py-3 text-[0.9rem] text-muted">…</li>}
          {shown.map((u) => (
            <li key={u} className="flex items-center gap-2 px-4 py-1.5">
              <span dir="ltr" className="min-w-0 break-all font-mono text-[0.9rem]">{u}</span>
              <span className="ms-auto shrink-0"><CopyButton value={u} /></span>
            </li>
          ))}
        </ul>
      </div>

      <Field label={s.check} htmlFor="u-check" hint={s.checkHint}>
        <TextField id="u-check" value={check} onChange={setCheck} dir="ltr" mono placeholder="0193a1f0-…" />
      </Field>

      {info && (
        <div className={`rounded-m border px-4 py-3 ${info.valid ? "border-line bg-surface" : "border-line bg-surface2"}`}>
          {info.valid && info.version !== undefined && (
            <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[0.8rem]">
              <span className="rounded-full bg-primary-soft px-2.5 py-1 font-bold text-primary">
                {s.verLabel(info.version)}
              </span>
              <span className="rounded-full border border-line px-2.5 py-1 text-muted">{isEn ? (info.variant === "RFC 4122" ? s.variant.rfc : s.variant.old) : info.variant}</span>
              {info.timestamp && (
                <span dir="ltr" className="rounded-full border border-line px-2.5 py-1 font-mono text-muted">
                  {info.timestamp}
                </span>
              )}
            </div>
          )}
          <p className="leading-relaxed text-ink">{isEn ? s.notes[info.code] : info.note}</p>
        </div>
      )}

      <Note>
        {s.n1}<code className="font-mono text-[0.85rem]">crypto</code>{s.n2}
        <b className="font-semibold text-ink">{s.b}</b>{s.n3}
      </Note>
    </ToolLayout>
  );
}
