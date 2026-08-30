"use client";

import { useMemo, useState } from "react";
import { ChipGroup, Field, NumberField, Note, Tiles, ToolLayout } from "@/components/tool-kit";
import {
  NISAB_GOLD_GRAMS, NISAB_SILVER_GRAMS, money, num, zakat, type ZakatInput,
} from "@/tools/finance-lib";

type K = keyof Omit<ZakatInput, "nisabBase">;

const FIELDS: { id: K; label: string; hint?: string }[] = [
  { id: "cash", label: "النقد والأرصدة" },
  { id: "goldGrams", label: "الذهب (غرام)" },
  { id: "goldPricePerGram", label: "سعرُ غرام الذهب" },
  { id: "silverGrams", label: "الفضّة (غرام)" },
  { id: "silverPricePerGram", label: "سعرُ غرام الفضّة" },
  { id: "tradeGoods", label: "عروضُ التجارة" },
  { id: "receivables", label: "ديونٌ لك مرجوّة" },
  { id: "debts", label: "ديونٌ عليك حالّة" },
];

export default function Zakat() {
  const [v, setV] = useState<Record<K, string>>({
    cash: "", goldGrams: "", goldPricePerGram: "", silverGrams: "",
    silverPricePerGram: "", tradeGoods: "", receivables: "", debts: "",
  });
  const [base, setBase] = useState<"gold" | "silver">("gold");

  const input: ZakatInput = useMemo(() => ({
    cash: num(v.cash) ?? 0,
    goldGrams: num(v.goldGrams) ?? 0,
    goldPricePerGram: num(v.goldPricePerGram) ?? 0,
    silverGrams: num(v.silverGrams) ?? 0,
    silverPricePerGram: num(v.silverPricePerGram) ?? 0,
    tradeGoods: num(v.tradeGoods) ?? 0,
    receivables: num(v.receivables) ?? 0,
    debts: num(v.debts) ?? 0,
    nisabBase: base,
  }), [v, base]);

  const res = useMemo(() => zakat(input), [input]);
  const priced = base === "gold" ? input.goldPricePerGram > 0 : input.silverPricePerGram > 0;

  return (
    <ToolLayout>
      <div className="flex flex-wrap gap-3">
        {FIELDS.map((f) => (
          <Field key={f.id} label={f.label} htmlFor={`z-${f.id}`} className="min-w-40 flex-1">
            <NumberField id={`z-${f.id}`} value={v[f.id]} onChange={(x) => setV((s) => ({ ...s, [f.id]: x }))} min={0} />
          </Field>
        ))}
      </div>

      <ChipGroup
        label="أساسُ النصاب"
        value={base}
        onChange={setBase}
        hint={`النصابُ ${base === "gold" ? `${NISAB_GOLD_GRAMS} غراماً ذهباً` : `${NISAB_SILVER_GRAMS} غراماً فضّة`} — والأخذُ بالفضّة أحوطُ للفقراء لأنّ نصابَها أدنى.`}
        options={[
          { id: "gold", label: `الذهب — ${NISAB_GOLD_GRAMS}غ` },
          { id: "silver", label: `الفضّة — ${NISAB_SILVER_GRAMS}غ` },
        ]}
      />

      <Tiles
        items={[
          { label: "الزكاةُ المستحقّة", value: priced ? money(res.zakat) : "—", lit: true },
          { label: "الوعاءُ بعد الديون", value: money(res.net) },
          { label: "النصاب", value: priced ? money(res.nisab) : "—" },
          { label: "الحالة", value: !priced ? "—" : res.due ? "بلغَ النصاب" : "دون النصاب" },
        ]}
      />

      <Note>
        المعدّل <b className="font-semibold text-ink">ربعُ العشر (٢٫٥٪)</b> على ما بلغ النصابَ وحال عليه الحول.
        أسعارُ الغرام تُدخلها بنفسك — فالحقيبةُ لا تتّصل بمصدرٍ خارجيّ. وهذه حاسبةٌ تعين على التقدير،
        والفتوى في المسائل الخاصّة لأهلها.
      </Note>
    </ToolLayout>
  );
}
