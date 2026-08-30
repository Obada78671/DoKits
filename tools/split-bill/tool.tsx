"use client";

import { useMemo, useState } from "react";
import { useStrings } from "@/components/lang";
import { ChipGroup, Field, NumberField, Note, Tiles, ToolLayout } from "@/components/tool-kit";
import { money, num, splitBill } from "@/tools/finance-lib";

const TIPS = ["0", "5", "10", "15"];

const S = {
  ar: {
    total: "إجماليُّ الفاتورة", people: "عددُ الأشخاص", tipPct: "الإكراميّة ٪",
    presets: "إكراميّاتٌ جاهزة", perPerson: "حصّةُ الفرد", tip: "الإكراميّة", withTip: "الإجماليّ مع الإكراميّة",
    note: "الحصّةُ مقرَّبةٌ للعرض — والفرقُ في الهللات يتحمّله من يدفع بالبطاقة عادةً.",
  },
  en: {
    total: "Bill total", people: "Number of people", tipPct: "Tip %",
    presets: "Common tips", perPerson: "Per person", tip: "Tip", withTip: "Total with tip",
    note: "The per-person share is rounded for display — the few cents left over are usually absorbed by whoever pays by card.",
  },
};

export default function SplitBill() {
  const s = useStrings(S);
  const [total, setTotal] = useState("");
  const [people, setPeople] = useState("2");
  const [tip, setTip] = useState("0");

  const t = num(total);
  const n = Math.max(1, Math.floor(num(people) ?? 1));
  const p = num(tip) ?? 0;

  const res = useMemo(() => (t === null ? null : splitBill(t, n, p)), [t, n, p]);

  return (
    <ToolLayout>
      <div className="flex flex-wrap gap-3">
        <Field label={s.total} htmlFor="sb-t" className="min-w-40 flex-[2]">
          <NumberField id="sb-t" value={total} onChange={setTotal} placeholder="250" />
        </Field>
        <Field label={s.people} htmlFor="sb-n" className="min-w-28 flex-1">
          <NumberField id="sb-n" value={people} onChange={setPeople} min={1} step={1} />
        </Field>
        <Field label={s.tipPct} htmlFor="sb-p" className="min-w-28 flex-1">
          <NumberField id="sb-p" value={tip} onChange={setTip} min={0} />
        </Field>
      </div>
      <ChipGroup label={s.presets} value={String(p)} onChange={setTip}
                 options={TIPS.map((x) => ({ id: x, label: `${x}٪` }))} />
      <Tiles
        items={[
          { label: s.perPerson, value: res ? money(res.perPerson) : "—", lit: true },
          { label: s.tip, value: res ? money(res.tip) : "—" },
          { label: s.withTip, value: res ? money(res.total) : "—" },
        ]}
      />
      <Note>{s.note}</Note>
    </ToolLayout>
  );
}
