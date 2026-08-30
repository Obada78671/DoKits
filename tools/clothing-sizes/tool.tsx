"use client";

import { useState } from "react";
import { ChipGroup, Note, ToolLayout } from "@/components/tool-kit";
import { SIZE_TABLES } from "@/tools/convert-lib";
import { useLang, useStrings } from "@/components/lang";
import { SIZE_TABLE_EN } from "@/tools/names-en";

const S = {
  ar: {
    table: "الجدول",
    n1: "جداولُ إرشاديّة: المقاساتُ تختلف بين العلامات التجاريّة اختلافاً حقيقيّاً. للأحذية، ",
    b: "قِس طولَ قدمك بالسنتيمتر", n2: " — فهو أدقُّ من أيّ رقمِ مقاس.",
  },
  en: {
    table: "Table",
    n1: "These are guide tables: sizes genuinely differ between brands. For shoes, ",
    b: "measure your foot in centimetres", n2: " — it is more reliable than any size number.",
  },
};

export default function ClothingSizes() {
  const s = useStrings(S);
  const isEn = useLang() === "en";
  const [table, setTable] = useState(SIZE_TABLES[0].id);
  const t = SIZE_TABLES.find((x) => x.id === table)!;

  return (
    <ToolLayout>
      <ChipGroup
        label={s.table}
        value={table}
        onChange={setTable}
        options={SIZE_TABLES.map((x) => ({ id: x.id, label: isEn ? SIZE_TABLE_EN[x.id].name : x.name }))}
      />

      <div className="overflow-x-auto rounded-m border border-line bg-surface">
        <table className="w-full min-w-[24rem] text-[0.92rem]">
          <thead className="bg-surface2 text-[0.78rem] text-muted">
            <tr>
              {(isEn ? SIZE_TABLE_EN[t.id].cols : t.cols).map((c) => (
                <th key={c} className="px-4 py-2.5 text-start font-bold">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono tabular-nums">
            {t.rows.map((r, i) => (
              <tr key={i} className="border-t border-line">
                <td className="px-4 py-2 font-sans font-medium">{r.intl ?? r.cm}</td>
                <td className="px-4 py-2">{r.eu}</td>
                <td className="px-4 py-2">{r.uk}</td>
                <td className="px-4 py-2">{r.us}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Note>
        {s.n1}<b className="font-semibold text-ink">{s.b}</b>{s.n2}
      </Note>
    </ToolLayout>
  );
}
