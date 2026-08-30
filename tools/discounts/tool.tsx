"use client";

import { useMemo, useState } from "react";
import { Field, NumberField, Note, TextField, Tiles, ToolLayout } from "@/components/tool-kit";
import { chainDiscounts, money, num } from "@/tools/finance-lib";
import { useStrings } from "@/components/lang";

const S = {
  ar: {
    price: "السعر قبل الخصم", chain: "الخصوماتُ تباعاً ٪", hint: "افصل بينها بفاصلة — مثلاً: 20، 10، 5",
    final: "السعرُ النهائيّ", saved: "مجموعُ التوفير", effective: "الخصمُ الفعليّ", naive: "لو جُمعت خطأً",
    steps: "خطوةً خطوة", stepOf: (p: string): string => `خصمُ ${p}٪`,
    n1: "الخصوماتُ المتتالية لا تُجمع: ٢٠٪ ثمّ ١٠٪ تساوي ", b: "٢٨٪", n2: " لا ٣٠٪، لأنّ الثاني يُحسب على ما بقي.",
  },
  en: {
    price: "Price before discount", chain: "Successive discounts %", hint: "Separate with commas — for example: 20, 10, 5",
    final: "Final price", saved: "Total saved", effective: "Effective discount", naive: "If wrongly added up",
    steps: "Step by step", stepOf: (p: string): string => `${p}% off`,
    n1: "Successive discounts do not add: 20% then 10% is ", b: "28%", n2: ", not 30%, because the second applies to what is left.",
  },
};

export default function Discounts() {
  const L = useStrings(S);
  const [price, setPrice] = useState("");
  const [chain, setChain] = useState("20، 10");

  const p = num(price);
  const pcts = useMemo(
    () => chain.split(/[،,+\s]+/).map((s) => num(s)).filter((n): n is number => n !== null && n >= 0 && n < 100),
    [chain],
  );
  const res = useMemo(() => (p === null || pcts.length === 0 ? null : chainDiscounts(p, pcts)), [p, pcts]);
  const naive = pcts.reduce((s, x) => s + x, 0);

  return (
    <ToolLayout>
      <div className="flex flex-wrap gap-3">
        <Field label={L.price} htmlFor="d-p" className="min-w-40 flex-1">
          <NumberField id="d-p" value={price} onChange={setPrice} placeholder="1000" />
        </Field>
        <Field label={L.chain} htmlFor="d-c" className="min-w-40 flex-[2]"
               hint={L.hint}>
          <TextField id="d-c" value={chain} onChange={setChain} dir="auto" />
        </Field>
      </div>
      <Tiles
        items={[
          { label: L.final, value: res ? money(res.final) : "—", lit: true },
          { label: L.saved, value: res ? money(res.savedAmount) : "—" },
          { label: L.effective, value: res ? `${money(res.effectivePct)}%` : "—" },
          { label: L.naive, value: pcts.length ? `${money(naive)}%` : "—" },
        ]}
      />
      {res && res.steps.length > 1 && (
        <div className="rounded-m border border-line bg-surface">
          <div className="border-b border-line px-4 py-2.5">
            <span className="text-[0.78rem] font-bold tracking-wide text-primary">{L.steps}</span>
          </div>
          <ul className="divide-y divide-line">
            {res.steps.map((s, i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-2">
                <span className="text-muted">{L.stepOf(money(s.pct, 0))}</span>
                <span dir="ltr" className="ms-auto font-mono tabular-nums">{money(s.after)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Note>
        {L.n1}<b className="font-semibold text-ink">{L.b}</b>{L.n2}
      </Note>
    </ToolLayout>
  );
}
