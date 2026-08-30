"use client";

import { useMemo, useState } from "react";
import { ChipGroup, Field, Note, ResultBox, TextField, ToolLayout } from "@/components/tool-kit";
import { slugify } from "@/tools/text-lib";

export default function Slugify() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"arabic" | "latin">("arabic");

  const out = useMemo(() => slugify(text, { latin: mode === "latin" }), [text, mode]);

  return (
    <ToolLayout>
      <Field label="العنوان" htmlFor="sg-in">
        <TextField id="sg-in" value={text} onChange={setText} dir="auto" placeholder="عنوانُ مقالٍ أو منتَج" />
      </Field>
      <ChipGroup
        label="الصيغة"
        value={mode}
        onChange={setMode}
        hint={mode === "arabic"
          ? "يبقى عربيّاً — المتصفّحاتُ الحديثة تدعمه، ويُرمَّز تلقائيّاً عند النسخ."
          : "نقلٌ صوتيٌّ إلى اللاتينيّة — أسلمُ للأنظمة القديمة، وأبعدُ عن دقّة النطق."}
        options={[
          { id: "arabic", label: "عربيّ" },
          { id: "latin", label: "لاتينيّ (نقلٌ صوتيّ)" },
        ]}
      />
      <ResultBox title="الرابط" value={out} dir="ltr" mono />
      <Note>يزيل التشكيلَ والرموزَ ويجعل الفراغَ شرطة، ولا يترك شرطتين متتاليتين ولا شرطةً في الطرفين.</Note>
    </ToolLayout>
  );
}
