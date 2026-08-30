"use client";

import { useMemo, useState } from "react";
import { ChipGroup, Field, NumberField, Note, Tiles, ToolLayout } from "@/components/tool-kit";
import { VAT_RATES, money, num, vat } from "@/tools/finance-lib";

export default function Vat() {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("15");
  // البلدُ حالةٌ مستقلّة: بلدان قد يشتركان في النسبة، والمنتقى واحدٌ منهما لا كلاهما
  const [country, setCountry] = useState("sa");
  const [mode, setMode] = useState<"add" | "extract">("add");

  const a = num(amount);
  const r = num(rate) ?? 0;
  const res = useMemo(() => (a === null ? null : vat(a, r, mode)), [a, r, mode]);

  return (
    <ToolLayout>
      <ChipGroup
        label="المبلغ المُدخل"
        value={mode}
        onChange={setMode}
        options={[
          { id: "add", label: "قبل الضريبة — أضِفها" },
          { id: "extract", label: "شاملُ الضريبة — استخرِجها" },
        ]}
      />
      <div className="flex flex-wrap gap-3">
        <Field label="المبلغ" htmlFor="v-a" className="min-w-40 flex-[2]">
          <NumberField id="v-a" value={amount} onChange={setAmount} placeholder="1000" />
        </Field>
        <Field label="النسبة ٪" htmlFor="v-r" className="min-w-28 flex-1">
          <NumberField id="v-r" value={rate} onChange={(v) => { setRate(v); setCountry(""); }} min={0} max={100} step="0.5" />
        </Field>
      </div>
      <ChipGroup
        label="نسبٌ جاهزة"
        value={country}
        onChange={(id) => {
          const c = VAT_RATES.find((x) => x.id === id);
          if (c) { setCountry(id); setRate(String(c.rate)); }
        }}
        options={VAT_RATES.map((c) => ({ id: c.id, label: `${c.name} ${c.rate}٪` }))}
      />
      <Tiles
        items={[
          { label: "الضريبة", value: res ? money(res.vat) : "—", lit: true },
          { label: "قبل الضريبة", value: res ? money(res.net) : "—" },
          { label: "الإجماليّ", value: res ? money(res.gross) : "—" },
        ]}
      />
      <Note>
        استخراجُ الضريبة من مبلغٍ شاملٍ ليس طرحَ النسبة — بل قسمةٌ على (١ + النسبة).
        خصمُ ١٥٪ من ١١٥٠ يعطي ٩٧٧٫٥ وهو خطأ؛ الصحيحُ ١٠٠٠.
      </Note>
    </ToolLayout>
  );
}
