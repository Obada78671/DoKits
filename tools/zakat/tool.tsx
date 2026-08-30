"use client";

import { useMemo, useState } from "react";
import { ChipGroup, Field, NumberField, Note, Tiles, ToolLayout } from "@/components/tool-kit";
import {
  NISAB_GOLD_GRAMS, NISAB_SILVER_GRAMS, money, num, zakat, type ZakatInput,
} from "@/tools/finance-lib";
import { useLang, useStrings } from "@/components/lang";

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

const FIELD_EN: Record<string, string> = {
  cash: "Cash and balances", goldGrams: "Gold (grams)", goldPricePerGram: "Gold price per gram",
  silverGrams: "Silver (grams)", silverPricePerGram: "Silver price per gram",
  tradeGoods: "Trade goods", receivables: "Receivables you expect", debts: "Debts you owe now",
};

const S = {
  ar: {
    basis: "أساسُ النصاب",
    hint: (g: string): string => `النصابُ ${g} — والأخذُ بالفضّة أحوطُ للفقراء لأنّ نصابَها أدنى.`,
    gold: (g: number): string => `${g} غراماً ذهباً`, silver: (g: number): string => `${g} غراماً فضّة`,
    goldChip: (g: number): string => `الذهب — ${g}غ`, silverChip: (g: number): string => `الفضّة — ${g}غ`,
    due: "الزكاةُ المستحقّة", net: "الوعاءُ بعد الديون", nisab: "النصاب", state: "الحالة",
    reached: "بلغَ النصاب", below: "دون النصاب",
    n1: "المعدّل ", b: "ربعُ العشر (٢٫٥٪)", n2: " على ما بلغ النصابَ وحال عليه الحول. أسعارُ الغرام تُدخلها بنفسك — فالحقيبةُ لا تتّصل بمصدرٍ خارجيّ. وهذه حاسبةٌ تعين على التقدير، والفتوى في المسائل الخاصّة لأهلها.",
  },
  en: {
    basis: "Nisab basis",
    hint: (g: string): string => `The nisab is ${g} — taking silver is the more cautious choice for the poor, since its threshold is lower.`,
    gold: (g: number): string => `${g} grams of gold`, silver: (g: number): string => `${g} grams of silver`,
    goldChip: (g: number): string => `Gold — ${g}g`, silverChip: (g: number): string => `Silver — ${g}g`,
    due: "Zakat due", net: "Zakatable wealth after debts", nisab: "Nisab", state: "Status",
    reached: "Above the nisab", below: "Below the nisab",
    n1: "The rate is ", b: "one fortieth (2.5%)", n2: " on wealth that reached the nisab and was held for a lunar year. You enter the gram prices yourself — the kit connects to no external source. This is a calculator to help you estimate; rulings on particular cases belong to those qualified to give them.",
  },
};

export default function Zakat() {
  const s = useStrings(S);
  const isEn = useLang() === "en";
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
          <Field key={f.id} label={isEn ? FIELD_EN[f.id] ?? f.label : f.label} htmlFor={`z-${f.id}`} className="min-w-40 flex-1">
            <NumberField id={`z-${f.id}`} value={v[f.id]} onChange={(x) => setV((s) => ({ ...s, [f.id]: x }))} min={0} />
          </Field>
        ))}
      </div>

      <ChipGroup
        label={s.basis}
        value={base}
        onChange={setBase}
        hint={s.hint(base === "gold" ? s.gold(NISAB_GOLD_GRAMS) : s.silver(NISAB_SILVER_GRAMS))}
        options={[
          { id: "gold", label: s.goldChip(NISAB_GOLD_GRAMS) },
          { id: "silver", label: s.silverChip(NISAB_SILVER_GRAMS) },
        ]}
      />

      <Tiles
        items={[
          { label: s.due, value: priced ? money(res.zakat) : "—", lit: true },
          { label: s.net, value: money(res.net) },
          { label: s.nisab, value: priced ? money(res.nisab) : "—" },
          { label: s.state, value: !priced ? "—" : res.due ? s.reached : s.below },
        ]}
      />

      <Note>
        {s.n1}<b className="font-semibold text-ink">{s.b}</b>{s.n2}
      </Note>
    </ToolLayout>
  );
}
