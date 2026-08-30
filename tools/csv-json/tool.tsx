"use client";

import { useMemo, useState } from "react";
import { ChipGroup, ErrorNote, Field, Note, ResultBox, TextArea, ToolLayout } from "@/components/tool-kit";
import { arabicCount, csvToJson, jsonToCsv } from "@/tools/dev-lib";

type Dir = "c2j" | "j2c";
type Delim = "," | ";" | "\t" | "|";

const DELIMS: { id: Delim; label: string }[] = [
  { id: ",", label: "فاصلة ," },
  { id: ";", label: "فاصلةٌ منقوطة ;" },
  { id: "\t", label: "جدولة" },
  { id: "|", label: "شريط |" },
];

export default function CsvJson() {
  const [dir, setDir] = useState<Dir>("c2j");
  const [delim, setDelim] = useState<Delim>(",");
  const [header, setHeader] = useState(true);
  const [text, setText] = useState("");

  const res = useMemo(() => {
    if (!text.trim()) return null;
    return dir === "c2j" ? csvToJson(text, delim, header) : jsonToCsv(text, delim);
  }, [text, dir, delim, header]);

  return (
    <ToolLayout>
      <ChipGroup
        label="الاتّجاه"
        value={dir}
        onChange={(d) => { setDir(d); setText(""); }}
        options={[{ id: "c2j", label: "CSV ← JSON" }, { id: "j2c", label: "JSON ← CSV" }]}
      />

      <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
        <ChipGroup label="الفاصل" value={delim} onChange={setDelim} options={DELIMS} />
        {dir === "c2j" && (
          <button className={`chip ${header ? "chip-active" : ""}`} onClick={() => setHeader(!header)}>
            السطرُ الأوّلُ عناوين
          </button>
        )}
      </div>

      <Field label={dir === "c2j" ? "CSV" : "JSON"} htmlFor="cj-in">
        <TextArea
          id="cj-in"
          value={text}
          onChange={setText}
          rows={8}
          dir="auto"
          placeholder={dir === "c2j" ? "الاسم,المدينة\nعبادة,دمشق" : '[{"الاسم":"عبادة","المدينة":"دمشق"}]'}
        />
      </Field>

      {res && !res.ok && <ErrorNote>{res.error}</ErrorNote>}

      <ResultBox
        title={dir === "c2j" ? "JSON" : "CSV"}
        value={res?.ok ? res.out : ""}
        dir={dir === "c2j" ? "ltr" : "auto"}
        mono
        hint={res?.ok
          ? `${arabicCount(res.rows, "صفٌّ واحد", "صفّان", "صفوف", "صفّاً")} · ${arabicCount(res.cols, "عمودٌ واحد", "عمودان", "أعمدة", "عموداً")}`
          : undefined}
      />

      <Note>
        المحلّلُ يحترم الاقتباس: فاصلةٌ أو سطرٌ جديدٌ داخل <code className="font-mono text-[0.85rem]">&quot;…&quot;</code> جزءٌ
        من القيمة لا فاصلٌ بين القيم، و<code className="font-mono text-[0.85rem]">&quot;&quot;</code> تعني علامةَ
        اقتباسٍ واحدة. وعند التحويل إلى CSV تُجمَع أعمدةُ كلِّ الكائنات — فالكائنُ الذي ينقصه مفتاحٌ يُترك
        حقلُه فارغاً بدل أن تختلَّ الأعمدة.
      </Note>
    </ToolLayout>
  );
}
