"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, NumberField, Note, Tiles, ToolLayout } from "@/components/tool-kit";
import { loanSchedule, money, num } from "@/tools/finance-lib";
import { useStrings } from "@/components/lang";

const S = {
  ar: {
    header: "#\tالقسط\tالفائدة\tالأصل\tالرصيد",
    amount: "مبلغُ القرض", rate: "الفائدةُ السنويّة ٪", months: "عددُ الأشهر",
    payment: "القسطُ الشهريّ", interest: "مجموعُ الفوائد", paid: "المدفوعُ إجمالاً",
    schedule: "جدولُ السداد",
    cols: { pay: "القسط", int: "الفائدة", pri: "الأصل", bal: "الرصيد" },
    note: "أقساطٌ ثابتةٌ بطريقة التناقص (الفائدةُ على الرصيد المتبقّي). والقسطُ الأخير يبتلع فروقَ التقريب فينتهي الرصيدُ صفراً تماماً.",
  },
  en: {
    header: "#\tPayment\tInterest\tPrincipal\tBalance",
    amount: "Loan amount", rate: "Annual interest %", months: "Number of months",
    payment: "Monthly payment", interest: "Total interest", paid: "Total paid",
    schedule: "Amortisation schedule",
    cols: { pay: "Payment", int: "Interest", pri: "Principal", bal: "Balance" },
    note: "Level payments on a reducing balance (interest on what is still owed). The last payment absorbs the rounding differences so the balance ends at exactly zero.",
  },
};

export default function Loan() {
  const s = useStrings(S);
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("6");
  const [months, setMonths] = useState("60");

  const a = num(amount);
  const r = num(rate) ?? 0;
  const m = Math.floor(num(months) ?? 0);

  const res = useMemo(() => (a === null ? null : loanSchedule(a, r, m)), [a, r, m]);

  const asText = res
    ? [s.header,
       ...res.rows.map((x) => [x.n, money(x.payment), money(x.interest), money(x.principal), money(x.balance)].join("\t"))].join("\n")
    : "";

  return (
    <ToolLayout>
      <div className="flex flex-wrap gap-3">
        <Field label={s.amount} htmlFor="l-a" className="min-w-40 flex-[2]">
          <NumberField id="l-a" value={amount} onChange={setAmount} placeholder="100000" />
        </Field>
        <Field label={s.rate} htmlFor="l-r" className="min-w-32 flex-1">
          <NumberField id="l-r" value={rate} onChange={setRate} min={0} step="0.1" />
        </Field>
        <Field label={s.months} htmlFor="l-m" className="min-w-28 flex-1">
          <NumberField id="l-m" value={months} onChange={setMonths} min={1} max={600} step={1} />
        </Field>
      </div>

      <Tiles
        items={[
          { label: s.payment, value: res ? money(res.payment) : "—", lit: true },
          { label: s.interest, value: res ? money(res.totalInterest) : "—" },
          { label: s.paid, value: res ? money(res.totalPaid) : "—" },
        ]}
      />

      {res && (
        <div className="rounded-m border border-line bg-surface">
          <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
            <span className="text-[0.78rem] font-bold tracking-wide text-primary">{s.schedule}</span>
            <span className="ms-auto"><CopyButton value={asText} /></span>
          </div>
          <div className="max-h-96 overflow-auto">
            <table className="w-full min-w-[34rem] text-[0.88rem]">
              <thead className="sticky top-0 bg-surface2 text-[0.75rem] text-muted">
                <tr>
                  <th className="px-3 py-2 text-start font-bold">#</th>
                  <th className="px-3 py-2 text-start font-bold">{s.cols.pay}</th>
                  <th className="px-3 py-2 text-start font-bold">{s.cols.int}</th>
                  <th className="px-3 py-2 text-start font-bold">{s.cols.pri}</th>
                  <th className="px-3 py-2 text-start font-bold">{s.cols.bal}</th>
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
        {s.note}
      </Note>
    </ToolLayout>
  );
}
