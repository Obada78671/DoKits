"use client";

import { useMemo, useState } from "react";
import { ChipGroup, Field, Note, ResultBox, TextArea, ToolLayout } from "@/components/tool-kit";
import { toArabicDigits, toLatinDigits } from "@/tools/text-lib";

type Dir = "toLatin" | "toArabic";

export default function ArabicNumerals() {
  const [text, setText] = useState("");
  const [dir, setDir] = useState<Dir>("toLatin");

  const out = useMemo(
    () => (dir === "toLatin" ? toLatinDigits(text) : toArabicDigits(text)),
    [text, dir],
  );

  return (
    <ToolLayout>
      <ChipGroup
        label="الاتّجاه"
        value={dir}
        onChange={setDir}
        options={[
          { id: "toLatin", label: "٠١٢ ← 012", title: "من العربيّة-الهنديّة إلى اللاتينيّة" },
          { id: "toArabic", label: "012 ← ٠١٢", title: "من اللاتينيّة إلى العربيّة-الهنديّة" },
        ]}
      />
      <Field label="النصّ" htmlFor="an-in">
        <TextArea id="an-in" value={text} onChange={setText} placeholder="ألصق نصّاً فيه أرقام…" />
      </Field>
      <ResultBox title="النتيجة" value={out} />
      <Note>
        يبدّل الأرقامَ داخل النصّ ويترك ما عداها كما هو — والأرقامُ الفارسيّة (۰۱۲) تُقبل أيضاً.
      </Note>
    </ToolLayout>
  );
}
