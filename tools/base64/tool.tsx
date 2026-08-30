"use client";

import { useMemo, useState } from "react";
import { ChipGroup, ErrorNote, Field, Note, ResultBox, TextArea, ToolLayout } from "@/components/tool-kit";
import { fromBase64, toBase64 } from "@/tools/dev-lib";

type Dir = "encode" | "decode";

export default function Base64Tool() {
  const [dir, setDir] = useState<Dir>("encode");
  const [urlSafe, setUrlSafe] = useState(false);
  const [text, setText] = useState("");

  const res = useMemo(() => {
    if (!text.trim()) return { out: "", error: "", bytes: 0 };
    if (dir === "encode") {
      const out = toBase64(text, urlSafe);
      return { out, error: "", bytes: new TextEncoder().encode(text).length };
    }
    const d = fromBase64(text);
    return d.ok ? { out: d.text, error: "", bytes: d.bytes } : { out: "", error: d.error, bytes: 0 };
  }, [text, dir, urlSafe]);

  const swap = () => {
    setText(res.out || text);
    setDir(dir === "encode" ? "decode" : "encode");
  };

  return (
    <ToolLayout>
      <ChipGroup
        label="الاتّجاه"
        value={dir}
        onChange={(d) => { setDir(d); setText(""); }}
        options={[{ id: "encode", label: "نصّ ← Base64" }, { id: "decode", label: "Base64 ← نصّ" }]}
      />

      {dir === "encode" && (
        <ChipGroup
          label="الصيغة"
          value={urlSafe ? "url" : "std"}
          onChange={(v) => setUrlSafe(v === "url")}
          hint={urlSafe
            ? "‏Base64URL: ‏- و_ بدل + و/، وبلا حشو = — هذه صيغةُ JWT وأجزاءِ الروابط."
            : "الصيغةُ المعياريّة (RFC 4648) — الأشيعُ في الملفّات والترويسات."}
          options={[{ id: "std", label: "معياريّة" }, { id: "url", label: "آمنةٌ للروابط" }]}
        />
      )}

      <Field label={dir === "encode" ? "النصّ" : "‏Base64"} htmlFor="b64-in">
        <TextArea
          id="b64-in"
          value={text}
          onChange={setText}
          dir={dir === "encode" ? "auto" : "ltr"}
          placeholder={dir === "encode" ? "اكتب أو ألصق نصّك…" : "2K3ZgtmK2KjYqQ=="}
        />
      </Field>

      {res.error && <ErrorNote>{res.error}</ErrorNote>}

      <ResultBox
        title={dir === "encode" ? "‏Base64" : "النصّ"}
        value={res.out}
        dir={dir === "encode" ? "ltr" : "auto"}
        mono={dir === "encode"}
        hint={res.out ? `${res.bytes} بايت ← ${res.out.length} محرفاً` : undefined}
        actions={
          res.out
            ? <button className="btn btn-ghost !px-3 !py-1 !text-[0.82rem]" onClick={swap}>اعكس الاتّجاه</button>
            : undefined
        }
      />

      <Note>
        الترميزُ يمرّ بـUTF-8 أوّلاً، فالعربيّةُ تعود كما دخلت — على خلاف `btoa` المباشر الذي ينهار
        عند أوّل حرفٍ عربيّ. و<b className="font-semibold text-ink">‏Base64 ليس تشفيراً</b>: هو تمثيلٌ
        نصّيٌّ للبايتات يفكُّه أيُّ أحد، فلا تُخفِ به سرّاً.
      </Note>
    </ToolLayout>
  );
}
