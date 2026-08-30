"use client";

import { useMemo, useState } from "react";
import { Field, Note, TextArea, Tiles, ToolLayout } from "@/components/tool-kit";
import { inspectChars, textStats } from "@/tools/dev-lib";

const LIMIT = 400;

export default function UnicodeInspect() {
  const [text, setText] = useState("");
  const [onlyHidden, setOnlyHidden] = useState(false);

  const chars = useMemo(() => inspectChars(text, LIMIT), [text]);
  const stats = useMemo(() => textStats(text), [text]);
  const shown = onlyHidden ? chars.filter((c) => c.invisible) : chars;

  const stripHidden = () => setText([...text].filter((c) => !inspectChars(c)[0]?.invisible).join(""));

  return (
    <ToolLayout>
      <Field label="النصّ" htmlFor="uc-in" hint="ألصق ما يسلك سلوكاً غريباً — بحثٌ لا يجد، أو اسمٌ لا يطابق نفسَه.">
        <TextArea id="uc-in" value={text} onChange={setText} rows={4} dir="auto" placeholder="ألصق نصّاً…" />
      </Field>

      {text && (
        <Tiles
          items={[
            { label: "محارف (length)", value: String(stats.chars) },
            { label: "نقاطُ ترميز", value: String(stats.codePoints) },
            { label: "بايتات UTF-8", value: String(stats.utf8Bytes) },
            { label: "محارفُ خفيّة", value: String(stats.invisible), lit: stats.invisible > 0 },
          ]}
        />
      )}

      {text && stats.invisible > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn btn-ghost" onClick={stripHidden}>احذف الخفيّة</button>
          <button className={`chip ${onlyHidden ? "chip-active" : ""}`} onClick={() => setOnlyHidden(!onlyHidden)}>
            الخفيّةُ وحدَها
          </button>
        </div>
      )}

      {text && !stats.isNfc && (
        <Note className="rounded-m border border-line bg-surface2 px-4 py-3">
          النصُّ ليس بصيغة <b className="font-semibold text-ink">NFC</b> ‏({stats.nfcChars} محرفاً بعد التوحيد
          مقابل {stats.chars} الآن). حرفان منفصلان قد يُرسمان كحرفٍ واحدٍ ولا يتطابقان في المقارنة —
          وحّد النصَّ بـ<code className="font-mono text-[0.85rem]">normalize(&quot;NFC&quot;)</code> قبل الحفظ أو المقارنة.
        </Note>
      )}

      {shown.length > 0 && (
        <div className="overflow-x-auto rounded-m border border-line bg-surface">
          <table className="w-full min-w-[30rem] text-[0.9rem]">
            <thead className="bg-surface2 text-[0.76rem] text-muted">
              <tr>
                <th className="px-3 py-2.5 text-start font-bold">#</th>
                <th className="px-3 py-2.5 text-start font-bold">المحرف</th>
                <th className="px-3 py-2.5 text-start font-bold">النقطة</th>
                <th className="px-3 py-2.5 text-start font-bold">UTF-8</th>
                <th className="px-3 py-2.5 text-start font-bold">ما هو</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((c) => (
                <tr key={c.index} className={`border-t border-line ${c.invisible ? "bg-accent-soft" : ""}`}>
                  <td className="px-3 py-1.5 font-mono text-[0.8rem] text-muted tabular-nums">{c.index}</td>
                  <td className="px-3 py-1.5 text-lg">
                    {c.invisible ? <span className="text-[0.8rem] text-muted">خفيّ</span> : c.ch}
                  </td>
                  <td dir="ltr" className="px-3 py-1.5 font-mono text-[0.82rem]">{c.hex}</td>
                  <td dir="ltr" className="px-3 py-1.5 font-mono text-[0.8rem] text-muted">
                    {c.utf8.map((b) => b.toString(16).toUpperCase().padStart(2, "0")).join(" ")}
                  </td>
                  <td className="px-3 py-1.5">{c.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {chars.length >= LIMIT && (
        <Note>عُرضت أوّلُ {LIMIT} نقطةِ ترميزٍ فقط — الجدولُ الأطولُ يثقل الصفحةَ ولا يفيد.</Note>
      )}

      <Note>
        أكثرُ ما يُتعب في النصّ العربيّ: <b className="font-semibold text-ink">التطويلُ</b> الذي يبدو جزءاً من
        الكلمة وليس منها، و<b className="font-semibold text-ink">علاماتُ الاتّجاه</b> التي تُلصَق عند النسخ من
        صفحاتٍ وملفّاتٍ فتكسر المطابقةَ في القاعدة بلا أثرٍ مرئيّ.
      </Note>
    </ToolLayout>
  );
}
