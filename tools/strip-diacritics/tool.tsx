"use client";

import { useMemo, useState } from "react";
import { Field, Note, ResultBox, TextArea, ToggleChips, ToolLayout } from "@/components/tool-kit";
import { normalizeAlef, normalizeTaaYaa, stripDiacritics, stripInvisible, stripTatweel } from "@/tools/text-lib";

type Opt = "diacritics" | "tatweel" | "alef" | "taayaa" | "invisible";

const OPTIONS: { id: Opt; label: string; title: string }[] = [
  { id: "diacritics", label: "التشكيل", title: "الفتحة والضمّة والكسرة والسكون والشدّة" },
  { id: "tatweel", label: "التطويل", title: "الشرطة المطّاطة ـ" },
  { id: "alef", label: "توحيد الألف", title: "أ إ آ ٱ ← ا" },
  { id: "taayaa", label: "التاء والألف المقصورة", title: "ة ← ه ، ى ← ي" },
  { id: "invisible", label: "المحارف الخفيّة", title: "الوصلات والعلامات الاتّجاهيّة" },
];

export default function StripDiacritics() {
  const [text, setText] = useState("");
  const [on, setOn] = useState<Set<Opt>>(new Set(["diacritics", "tatweel"]));

  const toggle = (id: Opt) =>
    setOn((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const out = useMemo(() => {
    let s = text;
    if (on.has("invisible")) s = stripInvisible(s);
    if (on.has("diacritics")) s = stripDiacritics(s);
    if (on.has("tatweel")) s = stripTatweel(s);
    if (on.has("alef")) s = normalizeAlef(s);
    if (on.has("taayaa")) s = normalizeTaaYaa(s);
    return s;
  }, [text, on]);

  return (
    <ToolLayout>
      <Field label="النصّ" htmlFor="sd-in">
        <TextArea id="sd-in" value={text} onChange={setText} placeholder="ألصق نصّاً مشكولاً…" />
      </Field>
      <ToggleChips label="ما يُزال" options={OPTIONS} value={on} onToggle={toggle} />
      <ResultBox title="النتيجة" value={out} />
      <Note>
        توحيدُ الألف والتاء يفيد <b className="font-semibold text-ink">المطابقةَ والبحث</b> لا النشر —
        فهو يغيّر الإملاء. أمّا إزالةُ التشكيل والتطويل فلا تمسّ المعنى.
      </Note>
    </ToolLayout>
  );
}
