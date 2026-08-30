"use client";

import { useMemo, useState } from "react";
import { ChipGroup, Field, NumberField, Note, Tiles, ToolLayout } from "@/components/tool-kit";
import { money, num, splitBill } from "@/tools/finance-lib";

const TIPS = ["0", "5", "10", "15"];

export default function SplitBill() {
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
        <Field label="إجماليُّ الفاتورة" htmlFor="sb-t" className="min-w-40 flex-[2]">
          <NumberField id="sb-t" value={total} onChange={setTotal} placeholder="250" />
        </Field>
        <Field label="عددُ الأشخاص" htmlFor="sb-n" className="min-w-28 flex-1">
          <NumberField id="sb-n" value={people} onChange={setPeople} min={1} step={1} />
        </Field>
        <Field label="الإكراميّة ٪" htmlFor="sb-p" className="min-w-28 flex-1">
          <NumberField id="sb-p" value={tip} onChange={setTip} min={0} />
        </Field>
      </div>
      <ChipGroup label="إكراميّاتٌ جاهزة" value={String(p)} onChange={setTip}
                 options={TIPS.map((x) => ({ id: x, label: `${x}٪` }))} />
      <Tiles
        items={[
          { label: "حصّةُ الفرد", value: res ? money(res.perPerson) : "—", lit: true },
          { label: "الإكراميّة", value: res ? money(res.tip) : "—" },
          { label: "الإجماليّ مع الإكراميّة", value: res ? money(res.total) : "—" },
        ]}
      />
      <Note>الحصّةُ مقرَّبةٌ للعرض — والفرقُ في الهللات يتحمّله من يدفع بالبطاقة عادةً.</Note>
    </ToolLayout>
  );
}
