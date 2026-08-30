"use client";

import { useMemo, useState } from "react";
import { Field, Note, TextArea, Tiles, ToolLayout } from "@/components/tool-kit";
import { inspectChars, textStats } from "@/tools/dev-lib";
import { useLang, useStrings } from "@/components/lang";

const S = {
  ar: {
    text: "النصّ", hint: "ألصق ما يسلك سلوكاً غريباً — بحثٌ لا يجد، أو اسمٌ لا يطابق نفسَه.",
    ph: "ألصق نصّاً…",
    tiles: { chars: "محارف (length)", cps: "نقاطُ ترميز", bytes: "بايتات UTF-8", hidden: "محارفُ خفيّة" },
    strip: "احذف الخفيّة", onlyHidden: "الخفيّةُ وحدَها",
    nfc1: "النصُّ ليس بصيغة ", nfcB: "NFC", nfc2: (a: number, b: number) => ` (${a} محرفاً بعد التوحيد مقابل ${b} الآن). حرفان منفصلان قد يُرسمان كحرفٍ واحدٍ ولا يتطابقان في المقارنة — وحّد النصَّ بـ`,
    nfc3: " قبل الحفظ أو المقارنة.",
    cols: { i: "#", ch: "المحرف", cp: "النقطة", utf8: "UTF-8", what: "ما هو" },
    invisible: "خفيّ",
    limit: (n: number) => `عُرضت أوّلُ ${n} نقطةِ ترميزٍ فقط — الجدولُ الأطولُ يثقل الصفحةَ ولا يفيد.`,
    n1: "أكثرُ ما يُتعب في النصّ العربيّ: ", b1: "التطويلُ", n2: " الذي يبدو جزءاً من الكلمة وليس منها، و",
    b2: "علاماتُ الاتّجاه", n3: " التي تُلصَق عند النسخ من صفحاتٍ وملفّاتٍ فتكسر المطابقةَ في القاعدة بلا أثرٍ مرئيّ.",
  },
  en: {
    text: "Text", hint: "Paste anything behaving strangely — a search that finds nothing, or a name that will not match itself.",
    ph: "Paste some text…",
    tiles: { chars: "Characters (length)", cps: "Code points", bytes: "UTF-8 bytes", hidden: "Invisible characters" },
    strip: "Remove the invisible ones", onlyHidden: "Invisible only",
    nfc1: "This text is not in ", nfcB: "NFC", nfc2: (a: number, b: number) => ` form (${a} characters after normalisation versus ${b} now). Two separate characters can render as one and still fail to compare equal — normalise with `,
    nfc3: " before storing or comparing.",
    cols: { i: "#", ch: "Character", cp: "Code point", utf8: "UTF-8", what: "What it is" },
    invisible: "invisible",
    limit: (n: number) => `Only the first ${n} code points are shown — a longer table slows the page without helping.`,
    n1: "The usual culprits in Arabic text: ", b1: "tatweel", n2: ", which looks like part of the word but is not, and ",
    b2: "directional marks", n3: ", which get pasted along when copying from web pages and documents and break database matching with no visible trace.",
  },
};

const LIMIT = 400;

export default function UnicodeInspect() {
  const s = useStrings(S);
  const lang = useLang();
  const [text, setText] = useState("");
  const [onlyHidden, setOnlyHidden] = useState(false);

  const chars = useMemo(() => inspectChars(text, LIMIT, lang), [text, lang]);
  const stats = useMemo(() => textStats(text), [text]);
  const shown = onlyHidden ? chars.filter((c) => c.invisible) : chars;

  const stripHidden = () => setText([...text].filter((c) => !inspectChars(c)[0]?.invisible).join(""));

  return (
    <ToolLayout>
      <Field label={s.text} htmlFor="uc-in" hint={s.hint}>
        <TextArea id="uc-in" value={text} onChange={setText} rows={4} dir="auto" placeholder={s.ph} />
      </Field>

      {text && (
        <Tiles
          items={[
            { label: s.tiles.chars, value: String(stats.chars) },
            { label: s.tiles.cps, value: String(stats.codePoints) },
            { label: s.tiles.bytes, value: String(stats.utf8Bytes) },
            { label: s.tiles.hidden, value: String(stats.invisible), lit: stats.invisible > 0 },
          ]}
        />
      )}

      {text && stats.invisible > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn btn-ghost" onClick={stripHidden}>{s.strip}</button>
          <button className={`chip ${onlyHidden ? "chip-active" : ""}`} onClick={() => setOnlyHidden(!onlyHidden)}>
            {s.onlyHidden}
          </button>
        </div>
      )}

      {text && !stats.isNfc && (
        <Note className="rounded-m border border-line bg-surface2 px-4 py-3">
          {s.nfc1}<b className="font-semibold text-ink">{s.nfcB}</b>{s.nfc2(stats.nfcChars, stats.chars)}
          <code className="font-mono text-[0.85rem]">normalize(&quot;NFC&quot;)</code>{s.nfc3}
        </Note>
      )}

      {shown.length > 0 && (
        <div className="overflow-x-auto rounded-m border border-line bg-surface">
          <table className="w-full min-w-[30rem] text-[0.9rem]">
            <thead className="bg-surface2 text-[0.76rem] text-muted">
              <tr>
                <th className="px-3 py-2.5 text-start font-bold">{s.cols.i}</th>
                <th className="px-3 py-2.5 text-start font-bold">{s.cols.ch}</th>
                <th className="px-3 py-2.5 text-start font-bold">{s.cols.cp}</th>
                <th className="px-3 py-2.5 text-start font-bold">{s.cols.utf8}</th>
                <th className="px-3 py-2.5 text-start font-bold">{s.cols.what}</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((c) => (
                <tr key={c.index} className={`border-t border-line ${c.invisible ? "bg-accent-soft" : ""}`}>
                  <td className="px-3 py-1.5 font-mono text-[0.8rem] text-muted tabular-nums">{c.index}</td>
                  <td className="px-3 py-1.5 text-lg">
                    {c.invisible ? <span className="text-[0.8rem] text-muted">{s.invisible}</span> : c.ch}
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
        <Note>{s.limit(LIMIT)}</Note>
      )}

      <Note>
        {s.n1}<b className="font-semibold text-ink">{s.b1}</b>{s.n2}
        <b className="font-semibold text-ink">{s.b2}</b>{s.n3}
      </Note>
    </ToolLayout>
  );
}
