"use client";

import { useMemo, useState } from "react";
import { ChipGroup, ErrorNote, Field, Note, ResultBox, TextArea, ToolLayout } from "@/components/tool-kit";
import { arabicCount, csvToJson, jsonToCsv } from "@/tools/dev-lib";
import { useStrings } from "@/components/lang";

const S = {
  ar: {
    dir: "الاتّجاه", c2j: "CSV ← JSON", j2c: "JSON ← CSV",
    delim: "الفاصل", comma: "فاصلة ,", semi: "فاصلةٌ منقوطة ;", tab: "جدولة", pipe: "شريط |",
    header: "السطرُ الأوّلُ عناوين",
    phCsv: "الاسم,المدينة\nعبادة,دمشق", phJson: '[{"الاسم":"عبادة","المدينة":"دمشق"}]',
    err: {
      noRows: "لا صفوفَ في المُدخل.", headerOnly: "فيه سطرُ عناوينَ ولا بيانات.",
      badJson: "JSON غيرُ صالح", emptyArray: "المصفوفةُ فارغة.",
      notObjects: "يُتوقَّع مصفوفةُ كائناتٍ — كلُّ كائنٍ صفّ.",
    },
    stat: (r: number, c: number) => `${arabicCount(r, "صفٌّ واحد", "صفّان", "صفوف", "صفّاً")} · ${arabicCount(c, "عمودٌ واحد", "عمودان", "أعمدة", "عموداً")}`,
    n1: "المحلّلُ يحترم الاقتباس: فاصلةٌ أو سطرٌ جديدٌ داخل ", n2: " جزءٌ من القيمة لا فاصلٌ بين القيم، و",
    n3: " تعني علامةَ اقتباسٍ واحدة. وعند التحويل إلى CSV تُجمَع أعمدةُ كلِّ الكائنات — فالكائنُ الذي ينقصه مفتاحٌ يُترك حقلُه فارغاً بدل أن تختلَّ الأعمدة.",
  },
  en: {
    dir: "Direction", c2j: "CSV → JSON", j2c: "JSON → CSV",
    delim: "Delimiter", comma: "Comma ,", semi: "Semicolon ;", tab: "Tab", pipe: "Pipe |",
    header: "First row is headers",
    phCsv: "name,city\nObada,Damascus", phJson: '[{"name":"Obada","city":"Damascus"}]',
    err: {
      noRows: "No rows in the input.", headerOnly: "There is a header row but no data.",
      badJson: "Invalid JSON", emptyArray: "The array is empty.",
      notObjects: "An array of objects is expected — one object per row.",
    },
    stat: (r: number, c: number) => `${r} ${r === 1 ? "row" : "rows"} · ${c} ${c === 1 ? "column" : "columns"}`,
    n1: "The parser respects quoting: a comma or a newline inside ", n2: " is part of the value, not a separator, and ",
    n3: " means one literal quote. Converting to CSV unions the keys of every object, so an object missing a key leaves an empty field rather than shifting the columns.",
  },
};

type Dir = "c2j" | "j2c";
type Delim = "," | ";" | "\t" | "|";

const DELIM_IDS: Delim[] = [",", ";", "\t", "|"];

export default function CsvJson() {
  const s = useStrings(S);
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
        label={s.dir}
        value={dir}
        onChange={(d) => { setDir(d); setText(""); }}
        options={[{ id: "c2j", label: s.c2j }, { id: "j2c", label: s.j2c }]}
      />

      <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
        <ChipGroup
          label={s.delim}
          value={delim}
          onChange={setDelim}
          options={DELIM_IDS.map((id) => ({
            id,
            label: id === "," ? s.comma : id === ";" ? s.semi : id === "|" ? s.pipe : s.tab,
          }))}
        />
        {dir === "c2j" && (
          <button className={`chip ${header ? "chip-active" : ""}`} onClick={() => setHeader(!header)}>
            {s.header}
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
          placeholder={dir === "c2j" ? s.phCsv : s.phJson}
        />
      </Field>

      {res && !res.ok && (
        <ErrorNote>{s.err[res.code]}{res.detail ? `: ${res.detail}` : ""}</ErrorNote>
      )}

      <ResultBox
        title={dir === "c2j" ? "JSON" : "CSV"}
        value={res?.ok ? res.out : ""}
        dir={dir === "c2j" ? "ltr" : "auto"}
        mono
        hint={res?.ok ? s.stat(res.rows, res.cols) : undefined}
      />

      <Note>
        {s.n1}<code className="font-mono text-[0.85rem]">&quot;…&quot;</code>{s.n2}
        <code className="font-mono text-[0.85rem]">&quot;&quot;</code>{s.n3}
      </Note>
    </ToolLayout>
  );
}
