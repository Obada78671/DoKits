"use client";

import { useMemo, useState } from "react";
import { ChipGroup, Field, Note, ResultBox, TextArea, Tiles, ToolLayout } from "@/components/tool-kit";
import { formatJson } from "@/tools/dev-lib";

type Style = "2" | "4" | "tab" | "min";

const SAMPLE = `{"name":"Do Kits","tools":[{"slug":"json-format","local":true}],"version":1}`;

export default function JsonFormat() {
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
        label="‏JSON"
        htmlFor="jf-in"
        hint={<button className="text-primary hover:underline" onClick={() => setText(SAMPLE)}>املأ مثالاً</button>}
      >
        <TextArea id="jf-in" value={text} onChange={setText} dir="ltr" rows={8} placeholder='{"key": "value"}' />
      </Field>

      <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
        <ChipGroup
          label="التنسيق"
          value={style}
          onChange={setStyle}
          options={[
            { id: "2", label: "مسافتان" },
            { id: "4", label: "٤ مسافات" },
            { id: "tab", label: "جدولة" },
            { id: "min", label: "مضغوط" },
          ]}
        />
        <button className={`chip ${sortKeys ? "chip-active" : ""}`} onClick={() => setSortKeys(!sortKeys)}>
          رتّب المفاتيح أبجديّاً
        </button>
      </div>

      {!res.ok && text.trim() && (
        <div role="alert" className="rounded-m border border-line bg-surface2 px-4 py-3">
          <p className="font-semibold text-ink">
            {res.line ? `خطأٌ في السطر ${res.line}، العمود ${res.col}` : "‏JSON غيرُ صالح"}
          </p>
          <p dir="ltr" className="mt-1 font-mono text-[0.82rem] leading-relaxed text-muted">{res.message}</p>
        </div>
      )}

      {res.ok && (
        <Tiles
          items={[
            { label: "الحجم", value: `${res.out.length}` },
            { label: "مفاتيح", value: String(res.keys) },
            { label: "أقصى عمق", value: String(res.depth) },
            { label: "الفرق", value: `${res.out.length - text.length > 0 ? "+" : ""}${res.out.length - text.length}` },
          ]}
        />
      )}

      <ResultBox title="الناتج" value={res.ok ? res.out : ""} dir="ltr" mono />

      <Note>
        الفحصُ والتنسيقُ يجريان في متصفّحك — <b className="font-semibold text-ink">لا يُرسَل ملفُّك إلى أيّ
        خادم</b>، وهذا ما يجعل لصقَ استجابةِ واجهةٍ فيها مفاتيحُ أو بياناتُ عملاءَ آمناً هنا.
        وموضعُ الخطأ يُحسب من فهرس المحرف لا من نصّ رسالة المتصفّح — فصياغةُ الرسائل تختلف بين المحرّكات.
      </Note>
    </ToolLayout>
  );
}
