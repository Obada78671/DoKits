"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, NumberField, Note, Tiles, ToolLayout } from "@/components/tool-kit";
import { loanSchedule, money, num } from "@/tools/finance-lib";

export default function Loan() {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("6");
  const [months, setMonths] = useState("60");

  const a = num(amount);
  const r = num(rate) ?? 0;
  const m = Math.floor(num(months) ?? 0);

  const res = useMemo(() => (a === null ? null : loanSchedule(a, r, m)), [a, r, m]);

  const asText = res
    ? ["#\tالقسط\tالفائدة\tالأصل\tالرصيد",
       ...res.rows.map((x) => [x.n, money(x.payment), money(x.interest), money(x.principal), money(x.balance)].join("\t"))].join("\n")
    : "";

  return (
    <ToolLayout>
      <div className="flex flex-wrap gap-3">
        <Field label="مبلغُ القرض" htmlFor="l-a" className="min-w-40 flex-[2]">
          <NumberField id="l-a" value={amount} onChange={setAmount} placeholder="100000" />
        </Field>
        <Field label="الفائدةُ السنويّة ٪" htmlFor="l-r" className="min-w-32 flex-1">
          <NumberField id="l-r" value={rate} onChange={setRate} min={0} step="0.1" />
        </Field>
        <Field label="عددُ الأشهر" htmlFor="l-m" className="min-w-28 flex-1">
          <NumberField id="l-m" value={months} onChange={setMonths} min={1} max={600} step={1} />
        </Field>
      </div>

      <Tiles
        items={[
          { label: "القسطُ الشهريّ", value: res ? money(res.payment) : "—", lit: true },
          { label: "مجموعُ الفوائد", value: res ? money(res.totalInterest) : "—" },
          { label: "المدفوعُ إجمالاً", value: res ? money(res.totalPaid) : "—" },
        ]}
      />

      {res && (
        <div className="rounded-m border border-line bg-surface">
          <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
            <span className="text-[0.78rem] font-bold tracking-wide text-primary">جدولُ السداد</span>
            <span className="ms-auto"><CopyButton value={asText} /></span>
          </div>
          <div className="max-h-96 overflow-auto">
            <table className="w-full min-w-[34rem] text-[0.88rem]">
              <thead className="sticky top-0 bg-surface2 text-[0.75rem] text-muted">
                <tr>
                  <th className="px-3 py-2 text-start font-bold">#</th>
                  <th className="px-3 py-2 text-start font-bold">القسط</th>
                  <th className="px-3 py-2 text-start font-bold">الفائدة</th>
                  <th className="px-3 py-2 text-start font-bold">الأصل</th>
                  <th className="px-3 py-2 text-start font-bold">الرصيد</th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums">
                {res.rows.map((x) => (
                  <tr key={x.n} className="border-t border-line">
                    <td className="px-3 py-1.5 text-muted">{x.n}</td>
                    <td className="px-3 py-1.5">{money(x.payment)}</td>
                    <td className="px-3 py-1.5 text-muted">{money(x.interest)}</td>
                    <td className="px-3 py-1.5">{money(x.principal)}</td>
                    <td className="px-3 py-1.5">{money(x.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Note>
        أقساطٌ ثابتةٌ بطريقة التناقص (الفائدةُ على الرصيد المتبقّي). والقسطُ الأخير يبتلع فروقَ التقريب
        فينتهي الرصيدُ صفراً تماماً.
      </Note>
    </ToolLayout>
  );
}
