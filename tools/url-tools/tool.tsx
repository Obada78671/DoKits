"use client";

import { useMemo, useState } from "react";
import { ChipGroup, ErrorNote, Field, Note, ResultBox, TextArea, ToolLayout } from "@/components/tool-kit";
import { parseUrl } from "@/tools/dev-lib";
import { useStrings } from "@/components/lang";

const S = {
  ar: {
    what: "ما تريد", encode: "ترميز", decode: "فكُّ ترميز", parse: "تشريحُ رابط",
    scope: "النطاق", part: "جزءٌ من رابط", whole: "رابطٌ كامل",
    hWhole: "‏encodeURI: يبقي : / ? # & = سليمةً — للرابط الكامل.",
    hPart: "‏encodeURIComponent: يرمّز كلَّ شيءٍ بما فيه : / ? & — لقيمةِ معاملٍ داخل الرابط.",
    urlLabel: "الرابط أو سلسلةُ الاستعلام", textLabel: "النصّ",
    phParse: "https://dokits.net/search?q=أدوات&page=2", phText: "بحثٌ عن أدوات",
    bad: "الترميزُ تالف: فيه % لا يتبعها خانتان ستّ عشريّتان صالحتان.",
    notUrl: "لم أفهم هذا رابطاً ولا سلسلةَ استعلام. أضف `https://` أو اكتب `مفتاح=قيمة`.",
    out: "الناتج", parts: "أجزاءُ الرابط", params: (n: number) => `المعاملات (${n})`,
    noParams: "لا معاملاتِ استعلامٍ في هذا الرابط.", empty: "«فارغ»",
    fields: { protocol: "البروتوكول", host: "المضيف", port: "المنفذ", path: "المسار", hash: "الجزء (#)" },
    n1: "القيمُ في الجدول ", b: "مفكوكةُ الترميز", n2: " — أي كما يقرأها الخادم، لا كما تظهر في شريط العنوان. وهذا أسرعُ طريقةٍ لتعرف لِمَ وصل معاملٌ مشوّهاً.",
  },
  en: {
    what: "What you need", encode: "Encode", decode: "Decode", parse: "Parse a URL",
    scope: "Scope", part: "Part of a URL", whole: "A whole URL",
    hWhole: "encodeURI: leaves : / ? # & = intact — for a complete URL.",
    hPart: "encodeURIComponent: encodes everything including : / ? & — for one parameter value inside a URL.",
    urlLabel: "URL or query string", textLabel: "Text",
    phParse: "https://dokits.net/search?q=tools&page=2", phText: "search for tools",
    bad: "Broken encoding: there is a % not followed by two valid hex digits.",
    notUrl: "I could not read that as a URL or a query string. Add `https://`, or write `key=value`.",
    out: "Result", parts: "URL parts", params: (n: number) => `Parameters (${n})`,
    noParams: "This URL has no query parameters.", empty: "«empty»",
    fields: { protocol: "Protocol", host: "Host", port: "Port", path: "Path", hash: "Fragment (#)" },
    n1: "The values in the table are ", b: "decoded", n2: " — that is, as the server reads them, not as they appear in the address bar. It is the fastest way to see why a parameter arrived mangled.",
  },
};

type Mode = "encode" | "decode" | "parse";

export default function UrlTools() {
  const s = useStrings(S);
  const [mode, setMode] = useState<Mode>("encode");
  const [whole, setWhole] = useState(false);
  const [text, setText] = useState("");

  const res = useMemo(() => {
    const v = text.trim();
    if (!v) return { out: "", error: "" };
    try {
      if (mode === "encode") return { out: whole ? encodeURI(v) : encodeURIComponent(v), error: "" };
      if (mode === "decode") return { out: whole ? decodeURI(v) : decodeURIComponent(v), error: "" };
    } catch {
      return { out: "", error: s.bad };
    }
    return { out: "", error: "" };
  }, [text, mode, whole, s]);

  const parts = useMemo(() => (mode === "parse" ? parseUrl(text) : null), [text, mode]);

  const rows = parts?.ok
    ? ([
        [s.fields.protocol, parts.protocol],
        [s.fields.host, parts.host],
        [s.fields.port, parts.port],
        [s.fields.path, parts.path],
        [s.fields.hash, parts.hash],
      ] as const).filter(([, v]) => v)
    : [];

  return (
    <ToolLayout>
      <ChipGroup
        label={s.what}
        value={mode}
        onChange={setMode}
        options={[
          { id: "encode", label: s.encode },
          { id: "decode", label: s.decode },
          { id: "parse", label: s.parse },
        ]}
      />

      {mode !== "parse" && (
        <ChipGroup
          label={s.scope}
          value={whole ? "uri" : "component"}
          onChange={(v) => setWhole(v === "uri")}
          hint={whole ? s.hWhole : s.hPart}
          options={[{ id: "component", label: s.part }, { id: "uri", label: s.whole }]}
        />
      )}

      <Field label={mode === "parse" ? s.urlLabel : s.textLabel} htmlFor="url-in">
        <TextArea
          id="url-in"
          value={text}
          onChange={setText}
          rows={mode === "parse" ? 3 : 5}
          dir={mode === "decode" ? "ltr" : "auto"}
          placeholder={mode === "parse" ? s.phParse : s.phText}
        />
      </Field>

      {res.error && <ErrorNote>{res.error}</ErrorNote>}

      {mode !== "parse" && (
        <ResultBox title={s.out} value={res.out} dir={mode === "encode" ? "ltr" : "auto"} mono={mode === "encode"} />
      )}

      {mode === "parse" && text.trim() && !parts?.ok && (
        <ErrorNote>{s.notUrl}</ErrorNote>
      )}

      {mode === "parse" && parts?.ok && (
        <>
          {rows.length > 0 && (
            <div className="rounded-m border border-line bg-surface">
              <div className="border-b border-line px-4 py-2.5">
                <span className="text-[0.78rem] font-bold tracking-wide text-primary">{s.parts}</span>
              </div>
              <ul className="divide-y divide-line">
                {rows.map(([k, v]) => (
                  <li key={k} className="flex items-center gap-3 px-4 py-2">
                    <span className="text-muted">{k}</span>
                    <span dir="ltr" className="ms-auto break-all font-mono text-[0.9rem]">{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-m border border-line bg-surface">
            <div className="border-b border-line px-4 py-2.5">
              <span className="text-[0.78rem] font-bold tracking-wide text-primary">
                {s.params(parts.params.length)}
              </span>
            </div>
            {parts.params.length === 0 ? (
              <p className="px-4 py-3 text-[0.9rem] text-muted">{s.noParams}</p>
            ) : (
              <ul className="divide-y divide-line">
                {parts.params.map((p, i) => (
                  <li key={`${p.key}-${i}`} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-2">
                    <span dir="ltr" className="font-mono text-[0.9rem] font-bold text-ink">{p.key}</span>
                    <span dir="auto" className="min-w-0 break-all text-muted">{p.value || s.empty}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      <Note>
        {s.n1}<b className="font-semibold text-ink">{s.b}</b>{s.n2}
      </Note>
    </ToolLayout>
  );
}
