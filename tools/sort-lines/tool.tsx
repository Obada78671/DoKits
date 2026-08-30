"use client";

import { useMemo, useState } from "react";
import { ChipGroup, Field, Note, ResultBox, TextArea, Tiles, ToggleChips, ToolLayout } from "@/components/tool-kit";
import { processLines, type SortMode } from "@/tools/text-lib";

type Opt = "unique" | "trim" | "dropEmpty";

const fmt = new Intl.NumberFormat("en-US");

export default function SortLines() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<SortMode>("asc");
  const [on, setOn] = useState<Set<Opt>>(new Set(["trim", "dropEmpty"]));

  const toggle = (id: Opt) =>
    setOn((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const out = useMemo(
    () => processLines(text, {
      mode, unique: on.has("unique"), trim: on.has("trim"), dropEmpty: on.has("dropEmpty"),
    }),
    [text, mode, on],
  );

  const before = text ? text.split("\n").length : 0;
  const after = out ? out.split("\n").length : 0;

  return (
    <ToolLayout>
      <Field label="الأسطر" htmlFor="sl-in">
        <TextArea id="sl-in" value={text} onChange={setText} placeholder="سطرٌ في كلّ سطر…" />
      </Field>
      <ChipGroup
        label="الترتيب"
        value={mode}
        onChange={setMode}
        options={[
          { id: "asc", label: "تصاعديّ" },
          { id: "desc", label: "تنازليّ" },
          { id: "reverse", label: "عكسُ الترتيب" },
          { id: "none", label: "كما هو" },
        ]}
      />
      <ToggleChips
        label="الخيارات"
        value={on}
        onToggle={toggle}
        options={[
          { id: "unique", label: "إزالةُ المكرّر" },
          { id: "trim", label: "قصُّ الأطراف" },
          { id: "dropEmpty", label: "حذفُ الفارغ" },
        ]}
      />
      <Tiles
        items={[
          { label: "أسطرٌ ناتجة", value: fmt.format(after), lit: true },
          { label: "أسطرٌ داخلة", value: fmt.format(before) },
          { label: "أُزيلت", value: fmt.format(Math.max(0, before - after)) },
        ]}
      />
      <ResultBox title="النتيجة" value={out} />
      <Note>الفرزُ يستعمل ترتيبَ العربيّة الصحيح (<span dir="ltr" className="font-mono">Intl.Collator</span>) لا ترتيبَ الترميز.</Note>
    </ToolLayout>
  );
}
