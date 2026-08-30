"use client";

import { useMemo, useState } from "react";
import { ChipGroup, Field, Note, ResultBox, TextArea, ToolLayout } from "@/components/tool-kit";
import { arToEn, enToAr, guessDirection } from "@/tools/text-lib";

type Dir = "auto" | "en2ar" | "ar2en";

export default function KeyboardFix() {
  const [text, setText] = useState("");
  const [dir, setDir] = useState<Dir>("auto");

  const { out, used } = useMemo(() => {
    const actual = dir === "auto" ? guessDirection(text) : dir;
    return { out: actual === "en2ar" ? enToAr(text) : arToEn(text), used: actual };
  }, [text, dir]);

  return (
    <ToolLayout>
      <Field label="النصّ المكتوب بالتخطيط الخاطئ" htmlFor="kf-in">
        <TextArea id="kf-in" value={text} onChange={setText} dir="auto" placeholder="lvpfh fp;l" />
      </Field>
      <ChipGroup
        label="الاتّجاه"
        value={dir}
        onChange={setDir}
        hint={dir === "auto" && text ? `خُمّن: ${used === "en2ar" ? "لاتينيّ ← عربيّ" : "عربيّ ← لاتينيّ"}` : undefined}
        options={[
          { id: "auto", label: "تلقائيّ" },
          { id: "en2ar", label: "لاتينيّ ← عربيّ" },
          { id: "ar2en", label: "عربيّ ← لاتينيّ" },
        ]}
      />
      <ResultBox title="النصّ المصحَّح" value={out} dir="auto" />
      <Note>
        يعتمد تخطيطَ لوحة المفاتيح العربيّة القياسيّة (١٠١) مقابل QWERTY. الحروفُ المركّبة
        مثل «لا» و«لأ» تُعامَل مفتاحاً واحداً كما هي في اللوحة.
      </Note>
    </ToolLayout>
  );
}
