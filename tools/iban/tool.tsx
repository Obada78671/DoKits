"use client";

import { useMemo, useState } from "react";
import { ErrorNote, Field, Note, ResultBox, TextField, ToolLayout } from "@/components/tool-kit";
import { checkIban } from "@/tools/finance-lib";
import { useStrings } from "@/components/lang";

const S = {
  ar: {
    label: "رقمُ الحساب الدوليّ (IBAN)", valid: "✓ الرقمُ صحيح",
    d1: "بلدُ الحساب ", d2: (n: number): string => ` · الطول ${n} محرفاً · رقما التحقّق يطابقان معيار mod-97.`,
    formatted: "بالصيغة المعياريّة",
    err: {
      empty: "", shape: "الصيغة: حرفا بلدٍ ثمّ رقما تحقّقٍ ثمّ حروفٌ وأرقام.",
      country: (c: string): string => `رمزُ البلد «${c}» ليس في سجلّ الحسابات الدوليّة.`,
      length: (c: string, e: number, g: number): string => `طولُ ${c} يجب أن يكون ${e} محرفاً — أدخلتَ ${g}.`,
      checksum: "رقما التحقّق لا يطابقان — راجع الرقم، فيه خطأٌ أو حرفٌ ناقص.",
    },
    n1: "التحقّقُ محلّيٌّ بالكامل ولا يغادر الرقمُ متصفّحَك. وهو يثبت", b: " سلامةَ الكتابة", n2: " لا وجودَ الحساب — فالبنكُ وحده يعرف ذلك.",
  },
  en: {
    label: "International bank account number (IBAN)", valid: "✓ Valid",
    d1: "Country ", d2: (n: number): string => ` · ${n} characters · the check digits satisfy mod-97.`,
    formatted: "In the standard format",
    err: {
      empty: "", shape: "Format: two country letters, two check digits, then letters and digits.",
      country: (c: string): string => `Country code "${c}" is not in the IBAN registry.`,
      length: (c: string, e: number, g: number): string => `${c} IBANs are ${e} characters — you entered ${g}.`,
      checksum: "The check digits do not match — review the number; a character is wrong or missing.",
    },
    n1: "Validation is entirely local and the number never leaves your browser. It proves", b: " the number is written correctly", n2: " — not that the account exists, which only the bank knows.",
  },
};

export default function Iban() {
  const s = useStrings(S);
  const [raw, setRaw] = useState("");
  const res = useMemo(() => checkIban(raw), [raw]);

  return (
    <ToolLayout>
      <Field label={s.label} htmlFor="ib-in">
        <TextField id="ib-in" value={raw} onChange={setRaw} dir="ltr" mono placeholder="SA03 8000 0000 6080 1016 7519" />
      </Field>

      {!raw.trim() ? null : res.ok ? (
        <>
          <div className="rounded-m border border-primary bg-primary-soft p-4">
            <p className="font-bold text-ink">{s.valid}</p>
            <p className="mt-1 text-[0.9rem] text-muted">
              {s.d1}<b className="font-semibold text-ink">{res.country}</b>{s.d2(res.length)}
            </p>
          </div>
          <ResultBox title={s.formatted} value={res.formatted} dir="ltr" mono />
        </>
      ) : res.reason ? (
        <ErrorNote>
          {res.code === "country" ? s.err.country(res.country ?? "")
            : res.code === "length" ? s.err.length(res.country ?? "", res.expected ?? 0, res.got ?? 0)
              : s.err[res.code]}
        </ErrorNote>
      ) : null}

      <Note>
        {s.n1}<b className="font-semibold text-ink">{s.b}</b>{s.n2}
      </Note>
    </ToolLayout>
  );
}
