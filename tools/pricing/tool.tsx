"use client";

import { useMemo, useState } from "react";
import { ChipGroup, ErrorNote, Field, NumberField, Note, Tiles, ToolLayout } from "@/components/tool-kit";
import { money, num, pricing, priceFromMargin, priceFromMarkup } from "@/tools/finance-lib";
import { useStrings } from "@/components/lang";

type Mode = "margin" | "markup" | "both";

const S = {
  ar: {
    impossible: "الهامشُ لا يبلغ ١٠٠٪ ولا يتجاوزها — عندها لا سعرَ يحقّقه.",
    given: "المعطى", margin: "تكلفة + هامش ٪", markup: "تكلفة + ترميز ٪", both: "تكلفة + سعرُ بيع",
    cost: "التكلفة", price: "سعرُ البيع", marginPct: "الهامش ٪", markupPct: "الترميز ٪",
    profit: "الربح", marginL: "الهامش", markupL: "الترميز",
    b: "الهامشُ نسبةٌ من سعر البيع، والترميزُ نسبةٌ من التكلفة",
    n: " — والخلطُ بينهما أشهرُ غلطةِ تسعير. ترميزُ ٢٥٪ على تكلفة ١٠٠ يعطي هامشاً ٢٠٪ لا ٢٥٪.",
  },
  en: {
    impossible: "A margin cannot reach or exceed 100% — no price achieves it.",
    given: "What you know", margin: "Cost + margin %", markup: "Cost + markup %", both: "Cost + selling price",
    cost: "Cost", price: "Selling price", marginPct: "Margin %", markupPct: "Markup %",
    profit: "Profit", marginL: "Margin", markupL: "Markup",
    b: "Margin is a share of the selling price; markup is a share of the cost",
    n: " — confusing the two is the most common pricing mistake. A 25% markup on a cost of 100 gives a 20% margin, not 25%.",
  },
};

export default function Pricing() {
  const s = useStrings(S);
  const [mode, setMode] = useState<Mode>("margin");
  const [cost, setCost] = useState("");
  const [rate, setRate] = useState("");
  const [price, setPrice] = useState("");

  const c = num(cost);
  const r = num(rate);
  const p = num(price);

  const { res, error } = useMemo(() => {
    if (c === null) return { res: null, error: "" };
    if (mode === "both") return p === null ? { res: null, error: "" } : { res: pricing(c, p), error: "" };
    if (r === null) return { res: null, error: "" };
    if (mode === "margin") {
      const out = priceFromMargin(c, r);
      return out ? { res: out, error: "" } : { res: null, error: s.impossible };
    }
    return { res: priceFromMarkup(c, r), error: "" };
  }, [mode, c, r, p]);

  return (
    <ToolLayout>
      <ChipGroup
        label={s.given}
        value={mode}
        onChange={setMode}
        options={[
          { id: "margin", label: s.margin },
          { id: "markup", label: s.markup },
          { id: "both", label: s.both },
        ]}
      />
      <div className="flex flex-wrap gap-3">
        <Field label={s.cost} htmlFor="pr-c" className="min-w-36 flex-1">
          <NumberField id="pr-c" value={cost} onChange={setCost} placeholder="100" />
        </Field>
        {mode === "both" ? (
          <Field label={s.price} htmlFor="pr-p" className="min-w-36 flex-1">
            <NumberField id="pr-p" value={price} onChange={setPrice} placeholder="125" />
          </Field>
        ) : (
          <Field label={mode === "margin" ? s.marginPct : s.markupPct} htmlFor="pr-r" className="min-w-36 flex-1">
            <NumberField id="pr-r" value={rate} onChange={setRate} placeholder="20" />
          </Field>
        )}
      </div>
      {error ? <ErrorNote>{error}</ErrorNote> : null}
      <Tiles
        items={[
          { label: s.price, value: res ? money(res.price) : "—", lit: true },
          { label: s.profit, value: res ? money(res.profit) : "—" },
          { label: s.marginL, value: res ? `${money(res.marginPct)}%` : "—" },
          { label: s.markupL, value: res ? `${money(res.markupPct)}%` : "—" },
        ]}
      />
      <Note>
        <b className="font-semibold text-ink">{s.b}</b>{s.n}
      </Note>
    </ToolLayout>
  );
}
