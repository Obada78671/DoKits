"use client";

import { useMemo, useState } from "react";
import { ChipGroup, Field, Note, ResultBox, TextArea, Tiles, ToolLayout } from "@/components/tool-kit";
import { formatJson } from "@/tools/dev-lib";
import { useStrings } from "@/components/lang";

const S = {
  ar: {
    label: "‏JSON", fill: "املأ مثالاً", style: "التنسيق",
    i2: "مسافتان", i4: "٤ مسافات", tab: "جدولة", min: "مضغوط",
    sort: "رتّب المفاتيح أبجديّاً", empty: "لا شيءَ لتنسيقه.",
    at: (l: number, c: number) => `خطأٌ في السطر ${l}، العمود ${c}`, invalid: "‏JSON غيرُ صالح",
    size: "الحجم", keys: "مفاتيح", depth: "أقصى عمق", diff: "الفرق", out: "الناتج",
    n1: "الفحصُ والتنسيقُ يجريان في متصفّحك — ", b: "لا يُرسَل ملفُّك إلى أيّ خادم",
    n2: "، وهذا ما يجعل لصقَ استجابةِ واجهةٍ فيها مفاتيحُ أو بياناتُ عملاءَ آمناً هنا. وموضعُ الخطأ يُحسب من فهرس المحرف لا من نصّ رسالة المتصفّح — فصياغةُ الرسائل تختلف بين المحرّكات.",
  },
  en: {
    label: "JSON", fill: "Fill an example", style: "Formatting",
    i2: "2 spaces", i4: "4 spaces", tab: "Tab", min: "Minified",
    sort: "Sort keys alphabetically", empty: "Nothing to format.",
    at: (l: number, c: number) => `Error at line ${l}, column ${c}`, invalid: "Invalid JSON",
    size: "Size", keys: "Keys", depth: "Max depth", diff: "Difference", out: "Output",
    n1: "Validation and formatting happen in your browser — ", b: "your file is never sent to any server",
    n2: ", which makes pasting an API response containing keys or customer data safe here. The error position is computed from the character index rather than parsed out of the browser's message, because engines word those differently.",
  },
};

type Style = "2" | "4" | "tab" | "min";

const SAMPLE = `{"name":"Do Kits","tools":[{"slug":"json-format","local":true}],"version":1}`;

export default function JsonFormat() {
  const s = useStrings(S);
  const [text, setText] = useState("");
  const [style, setStyle] = useState<Style>("2");
  const [sortKeys, setSortKeys] = useState(false);

  const res = useMemo(
    () => formatJson(text, {
      indent: style === "tab" ? "tab" : Number(style === "min" ? 2 : style),
      minify: style === "min",
      sortKeys,
    }),
    [text, style, sortKeys],
  );

  return (
    <ToolLayout>
      <Field
        label={s.label}
        htmlFor="jf-in"
        hint={<button className="text-primary hover:underline" onClick={() => setText(SAMPLE)}>{s.fill}</button>}
      >
        <TextArea id="jf-in" value={text} onChange={setText} dir="ltr" rows={8} placeholder='{"key": "value"}' />
      </Field>

      <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
        <ChipGroup
          label={s.style}
          value={style}
          onChange={setStyle}
          options={[
            { id: "2", label: s.i2 },
            { id: "4", label: s.i4 },
            { id: "tab", label: s.tab },
            { id: "min", label: s.min },
          ]}
        />
        <button className={`chip ${sortKeys ? "chip-active" : ""}`} onClick={() => setSortKeys(!sortKeys)}>
          {s.sort}
        </button>
      </div>

      {!res.ok && text.trim() && (
        <div role="alert" className="rounded-m border border-line bg-surface2 px-4 py-3">
          <p className="font-semibold text-ink">
            {res.empty ? s.empty : res.line ? s.at(res.line, res.col!) : s.invalid}
          </p>
          <p dir="ltr" className="mt-1 font-mono text-[0.82rem] leading-relaxed text-muted">{res.message}</p>
        </div>
      )}

      {res.ok && (
        <Tiles
          items={[
            { label: s.size, value: `${res.out.length}` },
            { label: s.keys, value: String(res.keys) },
            { label: s.depth, value: String(res.depth) },
            { label: s.diff, value: `${res.out.length - text.length > 0 ? "+" : ""}${res.out.length - text.length}` },
          ]}
        />
      )}

      <ResultBox title={s.out} value={res.ok ? res.out : ""} dir="ltr" mono />

      <Note>
        {s.n1}<b className="font-semibold text-ink">{s.b}</b>{s.n2}
      </Note>
    </ToolLayout>
  );
}
