"use client";

import { useMemo, useState } from "react";
import { ChipGroup, ErrorNote, Field, NumberField, Note, Tiles, ToolLayout } from "@/components/tool-kit";
import { money, num, pricing, priceFromMargin, priceFromMarkup } from "@/tools/finance-lib";

type Mode = "margin" | "markup" | "both";

export default function Pricing() {
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
      return out ? { res: out, error: "" } : { res: null, error: "الهامشُ لا يبلغ ١٠٠٪ ولا يتجاوزها — عندها لا سعرَ يحقّقه." };
    }
    return { res: priceFromMarkup(c, r), error: "" };
  }, [mode, c, r, p]);

  return (
    <ToolLayout>
      <ChipGroup
        label="المعطى"
        value={mode}
        onChange={setMode}
        options={[
          { id: "margin", label: "تكلفة + هامش ٪" },
          { id: "markup", label: "تكلفة + ترميز ٪" },
          { id: "both", label: "تكلفة + سعرُ بيع" },
        ]}
      />
      <div className="flex flex-wrap gap-3">
        <Field label="التكلفة" htmlFor="pr-c" className="min-w-36 flex-1">
          <NumberField id="pr-c" value={cost} onChange={setCost} placeholder="100" />
        </Field>
        {mode === "both" ? (
          <Field label="سعرُ البيع" htmlFor="pr-p" className="min-w-36 flex-1">
            <NumberField id="pr-p" value={price} onChange={setPrice} placeholder="125" />
          </Field>
        ) : (
          <Field label={mode === "margin" ? "الهامش ٪" : "الترميز ٪"} htmlFor="pr-r" className="min-w-36 flex-1">
            <NumberField id="pr-r" value={rate} onChange={setRate} placeholder="20" />
          </Field>
        )}
      </div>
      {error ? <ErrorNote>{error}</ErrorNote> : null}
      <Tiles
        items={[
          { label: "سعرُ البيع", value: res ? money(res.price) : "—", lit: true },
          { label: "الربح", value: res ? money(res.profit) : "—" },
          { label: "الهامش", value: res ? `${money(res.marginPct)}%` : "—" },
          { label: "الترميز", value: res ? `${money(res.markupPct)}%` : "—" },
        ]}
      />
      <Note>
        <b className="font-semibold text-ink">الهامشُ نسبةٌ من سعر البيع، والترميزُ نسبةٌ من التكلفة</b> —
        والخلطُ بينهما أشهرُ غلطةِ تسعير. ترميزُ ٢٥٪ على تكلفة ١٠٠ يعطي هامشاً ٢٠٪ لا ٢٥٪.
      </Note>
    </ToolLayout>
  );
}
