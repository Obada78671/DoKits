"use client";

import { useMemo, useState } from "react";
import { ChipGroup, Field, NumberField, Note, Tiles, ToolLayout } from "@/components/tool-kit";
import { VAT_RATES, money, num, vat } from "@/tools/finance-lib";
import { useLang, useStrings } from "@/components/lang";
import { VAT_EN } from "@/tools/names-en";

const S = {
  ar: {
    given: "المبلغ المُدخل", add: "قبل الضريبة — أضِفها", extract: "شاملُ الضريبة — استخرِجها",
    amount: "المبلغ", rate: "النسبة ٪", presets: "نسبٌ جاهزة",
    tax: "الضريبة", net: "قبل الضريبة", gross: "الإجماليّ",
    note: "استخراجُ الضريبة من مبلغٍ شاملٍ ليس طرحَ النسبة — بل قسمةٌ على (١ + النسبة). خصمُ ١٥٪ من ١١٥٠ يعطي ٩٧٧٫٥ وهو خطأ؛ الصحيحُ ١٠٠٠.",
  },
  en: {
    given: "The amount you have", add: "Before tax — add it", extract: "Tax included — extract it",
    amount: "Amount", rate: "Rate %", presets: "Common rates",
    tax: "Tax", net: "Before tax", gross: "Total",
    note: "Extracting tax from a tax-inclusive amount is not subtracting the rate — it is dividing by (1 + rate). Taking 15% off 1150 gives 977.5, which is wrong; the answer is 1000.",
  },
};

export default function Vat() {
  const s = useStrings(S);
  const isEn = useLang() === "en";
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
        label={s.given}
        value={mode}
        onChange={setMode}
        options={[
          { id: "add", label: s.add },
          { id: "extract", label: s.extract },
        ]}
      />
      <div className="flex flex-wrap gap-3">
        <Field label={s.amount} htmlFor="v-a" className="min-w-40 flex-[2]">
          <NumberField id="v-a" value={amount} onChange={setAmount} placeholder="1000" />
        </Field>
        <Field label={s.rate} htmlFor="v-r" className="min-w-28 flex-1">
          <NumberField id="v-r" value={rate} onChange={(v) => { setRate(v); setCountry(""); }} min={0} max={100} step="0.5" />
        </Field>
      </div>
      <ChipGroup
        label={s.presets}
        value={country}
        onChange={(id) => {
          const c = VAT_RATES.find((x) => x.id === id);
          if (c) { setCountry(id); setRate(String(c.rate)); }
        }}
        options={VAT_RATES.map((c) => ({ id: c.id, label: isEn ? `${VAT_EN[c.id]} ${c.rate}%` : `${c.name} ${c.rate}٪` }))}
      />
      <Tiles
        items={[
          { label: s.tax, value: res ? money(res.vat) : "—", lit: true },
          { label: s.net, value: res ? money(res.net) : "—" },
          { label: s.gross, value: res ? money(res.gross) : "—" },
        ]}
      />
      <Note>
        {s.note}
      </Note>
    </ToolLayout>
  );
}
