"use client";

import { useEffect, useMemo, useState } from "react";
import { ErrorNote, Field, Note, ResultBox, TextArea, ToolLayout } from "@/components/tool-kit";
import { CLAIM_NAMES_EN, decodeJwt } from "@/tools/dev-lib";
import { useLang, useStrings } from "@/components/lang";

const S = {
  ar: {
    token: "الرمز", hint: "ثلاثةُ أجزاءٍ يفصلها نقطة. يُقبل مع بادئة Bearer.",
    err: {
      parts: (n: number) => `الرمزُ يجب أن يكون ثلاثةَ أجزاءٍ يفصلها نقطة — وجدتُ ${n}.`,
      header: "تعذّر فكُّ الترويسة — ليست Base64URL لكائن JSON.",
      payload: "تعذّر فكُّ الحمولة — ليست Base64URL لكائن JSON.",
    },
    alg: (a: string) => `الخوارزميّة ${a}`, typ: (t: string) => `النوع ${t}`,
    expired: "منتهي الصلاحيّة", valid: "ما زال ساري المدّة",
    none: "‏alg=none — رمزٌ بلا توقيعٍ إطلاقاً",
    claims: "المطالب", header: "الترويسة", payload: "الحمولة",
    sig: "التوقيع", sigHint: "نصٌّ خام — لا يُفكّ ولا يُقرأ.",
    b1: "قراءةٌ لا تحقّق.", n1: " هذه الأداة تفكُّ الترميزَ فقط ولا تتحقّق من التوقيع — والتحقّقُ يحتاج المفتاحَ السرّيّ، وإدخالُ مفتاحك في أيّ صفحةِ ويب خطأٌ في ذاته. وحمولةُ JWT ",
    b2: "ليست مشفّرة", n2: ": أيُّ حاملٍ للرمز يقرؤها كما تقرؤها الآن. الرمزُ لا يغادر متصفّحَك هنا، لكنّ العادةَ الأسلمَ أن تُجرّب برمزِ اختبارٍ لا برمزِ إنتاج.",
  },
  en: {
    token: "Token", hint: "Three parts separated by dots. A Bearer prefix is accepted.",
    err: {
      parts: (n: number) => `A token must be three dot-separated parts — found ${n}.`,
      header: "The header could not be decoded — it is not Base64URL of a JSON object.",
      payload: "The payload could not be decoded — it is not Base64URL of a JSON object.",
    },
    alg: (a: string) => `Algorithm ${a}`, typ: (t: string) => `Type ${t}`,
    expired: "Expired", valid: "Still within its lifetime",
    none: "alg=none — a token with no signature at all",
    claims: "Claims", header: "Header", payload: "Payload",
    sig: "Signature", sigHint: "Raw text — it is neither decoded nor readable.",
    b1: "Decoding, not verification.", n1: " This tool only decodes; it does not verify the signature — verification needs the secret key, and entering your key into any web page is a mistake in itself. A JWT payload is ",
    b2: "not encrypted", n2: ": anyone holding the token reads it exactly as you are reading it now. The token never leaves your browser here, but the safer habit is to test with a staging token rather than a production one.",
  },
};

export default function JwtDecode() {
  const s = useStrings(S);
  const isEn = useLang() === "en";
  const [token, setToken] = useState("");
  // الزمنُ يُقرأ بعد التركيب فقط — قراءتُه أثناء الرسم تجعل الخادمَ والمتصفّحَ يختلفان
  const [now, setNow] = useState(0);
  useEffect(() => setNow(Date.now()), [token]);

  const res = useMemo(() => (token.trim() ? decodeJwt(token, now) : null), [token, now]);

  return (
    <ToolLayout>
      <Field label={s.token} htmlFor="jwt-in" hint={s.hint}>
        <TextArea id="jwt-in" value={token} onChange={setToken} rows={4} dir="ltr" placeholder="eyJhbGciOi…" />
      </Field>

      {res && !res.ok && (
        <ErrorNote>{res.code === "parts" ? s.err.parts(res.parts ?? 0) : s.err[res.code]}</ErrorNote>
      )}

      {res?.ok && (
        <>
          <div className="flex flex-wrap items-center gap-2 text-[0.8rem]">
            <span className="rounded-full bg-primary-soft px-2.5 py-1 font-bold text-primary">
              {s.alg(res.alg)}
            </span>
            <span className="rounded-full border border-line px-2.5 py-1 text-muted">{s.typ(res.typ)}</span>
            {res.expired === true && (
              <span className="rounded-full bg-accent-soft px-2.5 py-1 font-bold text-ink">{s.expired}</span>
            )}
            {res.expired === false && (
              <span className="rounded-full border border-line px-2.5 py-1 text-muted">{s.valid}</span>
            )}
            {res.alg.toLowerCase() === "none" && (
              <span className="rounded-full bg-accent-soft px-2.5 py-1 font-bold text-ink">
                {s.none}
              </span>
            )}
          </div>

          {res.claims.length > 0 && (
            <div className="rounded-m border border-line bg-surface">
              <div className="border-b border-line px-4 py-2.5">
                <span className="text-[0.78rem] font-bold tracking-wide text-primary">{s.claims}</span>
              </div>
              <ul className="divide-y divide-line">
                {res.claims.map((c) => (
                  <li key={c.key} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-2">
                    <span dir="ltr" className="font-mono text-[0.88rem] font-bold text-ink">{c.key}</span>
                    {(isEn ? CLAIM_NAMES_EN[c.key] : c.note) && (
                      <span className="text-[0.8rem] text-muted">{isEn ? CLAIM_NAMES_EN[c.key] : c.note}</span>
                    )}
                    <span dir="auto" className="ms-auto min-w-0 break-all font-mono text-[0.88rem]">{c.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ResultBox title={s.header} value={res.header} dir="ltr" mono />
          <ResultBox title={s.payload} value={res.payload} dir="ltr" mono />
          <ResultBox title={s.sig} value={res.signature} dir="ltr" mono hint={s.sigHint} />
        </>
      )}

      <Note className="rounded-m border border-line bg-surface2 px-4 py-3">
        <b className="font-semibold text-ink">{s.b1}</b>{s.n1}
        <b className="font-semibold text-ink">{s.b2}</b>{s.n2}
      </Note>
    </ToolLayout>
  );
}
