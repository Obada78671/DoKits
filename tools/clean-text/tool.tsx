"use client";

import { useMemo, useState } from "react";
import { Field, Note, ResultBox, TextArea, Tiles, ToggleChips, ToolLayout } from "@/components/tool-kit";
import { cleanText, type CleanOptions } from "@/tools/text-lib";

type Opt = keyof CleanOptions;

const OPTIONS: { id: Opt; label: string; title: string }[] = [
  { id: "collapseSpaces", label: "دمجُ المسافات", title: "مسافتان فأكثر تصيران واحدة" },
  { id: "trimLines", label: "قصُّ أطراف الأسطر", title: "حذفُ الفراغ في أوّل السطر وآخره" },
  { id: "dropEmptyLines", label: "حذفُ الأسطر الفارغة", title: "" },
  { id: "stripInvisible", label: "المحارفُ الخفيّة", title: "وصلاتٌ وعلاماتٌ اتّجاهيّةٌ لا تُرى" },
  { id: "fixPunctuationSpace", label: "ضبطُ الترقيم", title: "لا مسافةَ قبل الفاصلة، ومسافةٌ بعدها" },
];

const fmt = new Intl.NumberFormat("en-US");

export default function CleanText() {
  const [text, setText] = useState("");
  const [on, setOn] = useState<Set<Opt>>(new Set(["collapseSpaces", "trimLines", "stripInvisible"]));

  const toggle = (id: Opt) =>
    setOn((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const out = useMemo(() => {
    const opts = Object.fromEntries(OPTIONS.map((o) => [o.id, on.has(o.id)])) as CleanOptions;
    return cleanText(text, opts);
  }, [text, on]);

  const saved = [...text].length - [...out].length;

  return (
    <ToolLayout>
      <Field label="النصّ" htmlFor="ct-in">
        <TextArea id="ct-in" value={text} onChange={setText} placeholder="ألصق نصّاً فوضويّاً…" />
      </Field>
      <ToggleChips label="ما يُنظَّف" options={OPTIONS} value={on} onToggle={toggle} />
      <Tiles
        items={[
          { label: "محارفُ أُزيلت", value: fmt.format(Math.max(0, saved)), lit: true },
          { label: "أسطرٌ قبل", value: fmt.format(text ? text.split("\n").length : 0) },
          { label: "أسطرٌ بعد", value: fmt.format(out ? out.split("\n").length : 0) },
        ]}
      />
      <ResultBox title="النصّ النظيف" value={out} />
      <Note>المحارفُ الخفيّة أشهرُ سببٍ لبحثٍ لا يجد ما هو أمام عينيك.</Note>
    </ToolLayout>
  );
}
