"use client";

import { useMemo, useState } from "react";
import { ErrorNote, Field, Note, ResultBox, TextField, ToolLayout } from "@/components/tool-kit";
import { checkIban } from "@/tools/finance-lib";

export default function Iban() {
  const [raw, setRaw] = useState("");
  const res = useMemo(() => checkIban(raw), [raw]);

  return (
    <ToolLayout>
      <Field label="رقمُ الحساب الدوليّ (IBAN)" htmlFor="ib-in">
        <TextField id="ib-in" value={raw} onChange={setRaw} dir="ltr" mono placeholder="SA03 8000 0000 6080 1016 7519" />
      </Field>

      {!raw.trim() ? null : res.ok ? (
        <>
          <div className="rounded-m border border-primary bg-primary-soft p-4">
            <p className="font-bold text-ink">✓ الرقمُ صحيح</p>
            <p className="mt-1 text-[0.9rem] text-muted">
              بلدُ الحساب <b className="font-semibold text-ink">{res.country}</b> · الطول {res.length} محرفاً ·
              رقما التحقّق يطابقان معيار mod-97.
            </p>
          </div>
          <ResultBox title="بالصيغة المعياريّة" value={res.formatted} dir="ltr" mono />
        </>
      ) : res.reason ? (
        <ErrorNote>{res.reason}</ErrorNote>
      ) : null}

      <Note>
        التحقّقُ محلّيٌّ بالكامل ولا يغادر الرقمُ متصفّحَك. وهو يثبت
        <b className="font-semibold text-ink"> سلامةَ الكتابة</b> لا وجودَ الحساب — فالبنكُ وحده يعرف ذلك.
      </Note>
    </ToolLayout>
  );
}
