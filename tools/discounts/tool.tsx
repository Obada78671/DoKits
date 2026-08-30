"use client";

import { useMemo, useState } from "react";
import { Field, NumberField, Note, TextField, Tiles, ToolLayout } from "@/components/tool-kit";
import { chainDiscounts, money, num } from "@/tools/finance-lib";

export default function Discounts() {
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
        <Field label="السعر قبل الخصم" htmlFor="d-p" className="min-w-40 flex-1">
          <NumberField id="d-p" value={price} onChange={setPrice} placeholder="1000" />
        </Field>
        <Field label="الخصوماتُ تباعاً ٪" htmlFor="d-c" className="min-w-40 flex-[2]"
               hint="افصل بينها بفاصلة — مثلاً: 20، 10، 5">
          <TextField id="d-c" value={chain} onChange={setChain} dir="auto" />
        </Field>
      </div>
      <Tiles
        items={[
          { label: "السعرُ النهائيّ", value: res ? money(res.final) : "—", lit: true },
          { label: "مجموعُ التوفير", value: res ? money(res.savedAmount) : "—" },
          { label: "الخصمُ الفعليّ", value: res ? `${money(res.effectivePct)}%` : "—" },
          { label: "لو جُمعت خطأً", value: pcts.length ? `${money(naive)}%` : "—" },
        ]}
      />
      {res && res.steps.length > 1 && (
        <div className="rounded-m border border-line bg-surface">
          <div className="border-b border-line px-4 py-2.5">
            <span className="text-[0.78rem] font-bold tracking-wide text-primary">خطوةً خطوة</span>
          </div>
          <ul className="divide-y divide-line">
            {res.steps.map((s, i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-2">
                <span className="text-muted">خصمُ {money(s.pct, 0)}٪</span>
                <span dir="ltr" className="ms-auto font-mono tabular-nums">{money(s.after)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Note>
        الخصوماتُ المتتالية لا تُجمع: ٢٠٪ ثمّ ١٠٪ تساوي <b className="font-semibold text-ink">٢٨٪</b> لا ٣٠٪،
        لأنّ الثاني يُحسب على ما بقي.
      </Note>
    </ToolLayout>
  );
}
