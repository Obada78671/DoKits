"use client";

import { useMemo, useState } from "react";
import { ChipGroup, ErrorNote, Field, Note, ResultBox, TextArea, ToolLayout } from "@/components/tool-kit";
import { parseUrl } from "@/tools/dev-lib";

type Mode = "encode" | "decode" | "parse";

export default function UrlTools() {
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
      return { out: "", error: "الترميزُ تالف: فيه % لا يتبعها خانتان ستّ عشريّتان صالحتان." };
    }
    return { out: "", error: "" };
  }, [text, mode, whole]);

  const parts = useMemo(() => (mode === "parse" ? parseUrl(text) : null), [text, mode]);

  const rows = parts?.ok
    ? ([
        ["البروتوكول", parts.protocol],
        ["المضيف", parts.host],
        ["المنفذ", parts.port],
        ["المسار", parts.path],
        ["الجزء (#)", parts.hash],
      ] as const).filter(([, v]) => v)
    : [];

  return (
    <ToolLayout>
      <ChipGroup
        label="ما تريد"
        value={mode}
        onChange={setMode}
        options={[
          { id: "encode", label: "ترميز" },
          { id: "decode", label: "فكُّ ترميز" },
          { id: "parse", label: "تشريحُ رابط" },
        ]}
      />

      {mode !== "parse" && (
        <ChipGroup
          label="النطاق"
          value={whole ? "uri" : "component"}
          onChange={(v) => setWhole(v === "uri")}
          hint={whole
            ? "‏encodeURI: يبقي : / ? # & = سليمةً — للرابط الكامل."
            : "‏encodeURIComponent: يرمّز كلَّ شيءٍ بما فيه : / ? & — لقيمةِ معاملٍ داخل الرابط."}
          options={[{ id: "component", label: "جزءٌ من رابط" }, { id: "uri", label: "رابطٌ كامل" }]}
        />
      )}

      <Field label={mode === "parse" ? "الرابط أو سلسلةُ الاستعلام" : "النصّ"} htmlFor="url-in">
        <TextArea
          id="url-in"
          value={text}
          onChange={setText}
          rows={mode === "parse" ? 3 : 5}
          dir={mode === "decode" ? "ltr" : "auto"}
          placeholder={mode === "parse" ? "https://dokits.net/search?q=أدوات&page=2" : "بحثٌ عن أدوات"}
        />
      </Field>

      {res.error && <ErrorNote>{res.error}</ErrorNote>}

      {mode !== "parse" && (
        <ResultBox title="الناتج" value={res.out} dir={mode === "encode" ? "ltr" : "auto"} mono={mode === "encode"} />
      )}

      {mode === "parse" && text.trim() && !parts?.ok && (
        <ErrorNote>لم أفهم هذا رابطاً ولا سلسلةَ استعلام. أضف `https://` أو اكتب `مفتاح=قيمة`.</ErrorNote>
      )}

      {mode === "parse" && parts?.ok && (
        <>
          {rows.length > 0 && (
            <div className="rounded-m border border-line bg-surface">
              <div className="border-b border-line px-4 py-2.5">
                <span className="text-[0.78rem] font-bold tracking-wide text-primary">أجزاءُ الرابط</span>
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
                المعاملات ({parts.params.length})
              </span>
            </div>
            {parts.params.length === 0 ? (
              <p className="px-4 py-3 text-[0.9rem] text-muted">لا معاملاتِ استعلامٍ في هذا الرابط.</p>
            ) : (
              <ul className="divide-y divide-line">
                {parts.params.map((p, i) => (
                  <li key={`${p.key}-${i}`} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-2">
                    <span dir="ltr" className="font-mono text-[0.9rem] font-bold text-ink">{p.key}</span>
                    <span dir="auto" className="min-w-0 break-all text-muted">{p.value || "«فارغ»"}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      <Note>
        القيمُ في الجدول <b className="font-semibold text-ink">مفكوكةُ الترميز</b> — أي كما يقرأها الخادم،
        لا كما تظهر في شريط العنوان. وهذا أسرعُ طريقةٍ لتعرف لِمَ وصل معاملٌ مشوّهاً.
      </Note>
    </ToolLayout>
  );
}
