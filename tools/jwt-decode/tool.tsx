"use client";

import { useEffect, useMemo, useState } from "react";
import { ErrorNote, Field, Note, ResultBox, TextArea, ToolLayout } from "@/components/tool-kit";
import { decodeJwt } from "@/tools/dev-lib";

export default function JwtDecode() {
  const [token, setToken] = useState("");
  // الزمنُ يُقرأ بعد التركيب فقط — قراءتُه أثناء الرسم تجعل الخادمَ والمتصفّحَ يختلفان
  const [now, setNow] = useState(0);
  useEffect(() => setNow(Date.now()), [token]);

  const res = useMemo(() => (token.trim() ? decodeJwt(token, now) : null), [token, now]);

  return (
    <ToolLayout>
      <Field label="الرمز" htmlFor="jwt-in" hint="ثلاثةُ أجزاءٍ يفصلها نقطة. يُقبل مع بادئة Bearer.">
        <TextArea id="jwt-in" value={token} onChange={setToken} rows={4} dir="ltr" placeholder="eyJhbGciOi…" />
      </Field>

      {res && !res.ok && <ErrorNote>{res.error}</ErrorNote>}

      {res?.ok && (
        <>
          <div className="flex flex-wrap items-center gap-2 text-[0.8rem]">
            <span className="rounded-full bg-primary-soft px-2.5 py-1 font-bold text-primary">
              الخوارزميّة {res.alg}
            </span>
            <span className="rounded-full border border-line px-2.5 py-1 text-muted">النوع {res.typ}</span>
            {res.expired === true && (
              <span className="rounded-full bg-accent-soft px-2.5 py-1 font-bold text-ink">منتهي الصلاحيّة</span>
            )}
            {res.expired === false && (
              <span className="rounded-full border border-line px-2.5 py-1 text-muted">ما زال ساري المدّة</span>
            )}
            {res.alg.toLowerCase() === "none" && (
              <span className="rounded-full bg-accent-soft px-2.5 py-1 font-bold text-ink">
                ‏alg=none — رمزٌ بلا توقيعٍ إطلاقاً
              </span>
            )}
          </div>

          {res.claims.length > 0 && (
            <div className="rounded-m border border-line bg-surface">
              <div className="border-b border-line px-4 py-2.5">
                <span className="text-[0.78rem] font-bold tracking-wide text-primary">المطالب</span>
              </div>
              <ul className="divide-y divide-line">
                {res.claims.map((c) => (
                  <li key={c.key} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-2">
                    <span dir="ltr" className="font-mono text-[0.88rem] font-bold text-ink">{c.key}</span>
                    {c.note && <span className="text-[0.8rem] text-muted">{c.note}</span>}
                    <span dir="auto" className="ms-auto min-w-0 break-all font-mono text-[0.88rem]">{c.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ResultBox title="الترويسة" value={res.header} dir="ltr" mono />
          <ResultBox title="الحمولة" value={res.payload} dir="ltr" mono />
          <ResultBox title="التوقيع" value={res.signature} dir="ltr" mono hint="نصٌّ خام — لا يُفكّ ولا يُقرأ." />
        </>
      )}

      <Note className="rounded-m border border-line bg-surface2 px-4 py-3">
        <b className="font-semibold text-ink">قراءةٌ لا تحقّق.</b> هذه الأداة تفكُّ الترميزَ فقط ولا تتحقّق من
        التوقيع — والتحقّقُ يحتاج المفتاحَ السرّيّ، وإدخالُ مفتاحك في أيّ صفحةِ ويب خطأٌ في ذاته.
        وحمولةُ JWT <b className="font-semibold text-ink">ليست مشفّرة</b>: أيُّ حاملٍ للرمز يقرؤها كما تقرؤها الآن.
        الرمزُ لا يغادر متصفّحَك هنا، لكنّ العادةَ الأسلمَ أن تُجرّب برمزِ اختبارٍ لا برمزِ إنتاج.
      </Note>
    </ToolLayout>
  );
}
