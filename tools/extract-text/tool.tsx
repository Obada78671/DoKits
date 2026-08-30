"use client";

import { useMemo, useState } from "react";
import { ChipGroup, Field, Note, ResultBox, TextArea, ToggleChips, ToolLayout } from "@/components/tool-kit";
import { extract, type ExtractKind } from "@/tools/text-lib";

export default function ExtractText() {
  const [text, setText] = useState("");
  const [kind, setKind] = useState<ExtractKind>("email");
  const [on, setOn] = useState<Set<"unique">>(new Set(["unique"]));

  const found = useMemo(() => extract(text, kind, on.has("unique")), [text, kind, on]);

  return (
    <ToolLayout>
      <Field label="النصّ" htmlFor="ex-in">
        <TextArea id="ex-in" value={text} onChange={setText} placeholder="ألصق نصّاً أو صفحةً منسوخة…" />
      </Field>
      <ChipGroup
        label="ما يُستخرَج"
        value={kind}
        onChange={setKind}
        options={[
          { id: "email", label: "بريدٌ إلكترونيّ" },
          { id: "url", label: "روابط" },
          { id: "phone", label: "أرقامُ هواتف" },
          { id: "number", label: "أرقام" },
        ]}
      />
      <ToggleChips
        label="الخيارات"
        value={on}
        onToggle={() => setOn((p) => (p.has("unique") ? new Set() : new Set(["unique"])))}
        options={[{ id: "unique", label: "بلا تكرار" }]}
      />
      <ResultBox
        title={`النتائج — ${found.length}`}
        value={found.join("\n")}
        dir="ltr"
        mono
        hint="سطرٌ لكلّ نتيجة، جاهزةٌ للصقٍ في جدول."
      />
      <Note>أرقامُ الهواتف تُلتقط بأنماطها الشائعة — راجعها قبل الاعتماد، فالنصُّ الحرّ يخدع.</Note>
    </ToolLayout>
  );
}
