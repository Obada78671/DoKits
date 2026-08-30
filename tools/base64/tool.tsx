"use client";

import { useMemo, useState } from "react";
import { ChipGroup, ErrorNote, Field, Note, ResultBox, TextArea, ToolLayout } from "@/components/tool-kit";
import { useStrings } from "@/components/lang";
import { fromBase64, toBase64 } from "@/tools/dev-lib";

type Dir = "encode" | "decode";

const S = {
  ar: {
    dir: "الاتّجاه", enc: "نصّ ← Base64", dec: "Base64 ← نصّ",
    form: "الصيغة", std: "معياريّة", url: "آمنةٌ للروابط",
    urlHint: "‏Base64URL: ‏- و_ بدل + و/، وبلا حشو = — هذه صيغةُ JWT وأجزاءِ الروابط.",
    stdHint: "الصيغةُ المعياريّة (RFC 4648) — الأشيعُ في الملفّات والترويسات.",
    text: "النصّ", b64: "‏Base64",
    ph: "اكتب أو ألصق نصّك…",
    bytes: (b: number, c: number) => `${b} بايت ← ${c} محرفاً`,
    swap: "اعكس الاتّجاه",
    note1: "الترميزُ يمرّ بـUTF-8 أوّلاً، فالعربيّةُ تعود كما دخلت — على خلاف ",
    note2: " المباشر الذي ينهار عند أوّل حرفٍ عربيّ. و",
    noteBold: "‏Base64 ليس تشفيراً",
    note3: ": هو تمثيلٌ نصّيٌّ للبايتات يفكُّه أيُّ أحد، فلا تُخفِ به سرّاً.",
    err: {
      empty: "لا شيءَ لفكّه.",
      alphabet: "النصُّ ليس Base64 صالحاً — فيه محارفُ خارج الأبجديّة.",
      length: "طولُ النصّ لا يصلح لـBase64 (بقيّةُ قسمةٍ على ٤ تساوي ١).",
      utf8: "فُكَّ الترميزُ لكنّ الناتجَ ليس نصّاً بترميز UTF-8 — لعلّه ملفٌّ ثنائيّ.",
    },
  },
  en: {
    dir: "Direction", enc: "Text → Base64", dec: "Base64 → Text",
    form: "Variant", std: "Standard", url: "URL-safe",
    urlHint: "Base64URL: - and _ replace + and /, and the = padding is dropped — this is the form used by JWT and URL fragments.",
    stdHint: "The standard form (RFC 4648) — the common one in files and headers.",
    text: "Text", b64: "Base64",
    ph: "Type or paste your text…",
    bytes: (b: number, c: number) => `${b} bytes → ${c} characters`,
    swap: "Reverse direction",
    note1: "Encoding goes through UTF-8 first, so non-Latin text comes back exactly as it went in — unlike plain ",
    note2: ", which throws on the first non-Latin character. And ",
    noteBold: "Base64 is not encryption",
    note3: ": it is a text representation of bytes that anyone can reverse, so never hide a secret in it.",
    err: {
      empty: "Nothing to decode.",
      alphabet: "This is not valid Base64 — it contains characters outside the alphabet.",
      length: "The length can't be Base64 (remainder 1 when divided by 4).",
      utf8: "It decoded, but the bytes are not UTF-8 text — it may be a binary file.",
    },
  },
};

export default function Base64Tool() {
  const s = useStrings(S);
  const [dir, setDir] = useState<Dir>("encode");
  const [urlSafe, setUrlSafe] = useState(false);
  const [text, setText] = useState("");

  const res = useMemo(() => {
    if (!text.trim()) return { out: "", error: "", bytes: 0 };
    if (dir === "encode") {
      return { out: toBase64(text, urlSafe), error: "", bytes: new TextEncoder().encode(text).length };
    }
    const d = fromBase64(text);
    return d.ok ? { out: d.text, error: "", bytes: d.bytes } : { out: "", error: s.err[d.code], bytes: 0 };
  }, [text, dir, urlSafe, s]);

  const swap = () => {
    setText(res.out || text);
    setDir(dir === "encode" ? "decode" : "encode");
  };

  return (
    <ToolLayout>
      <ChipGroup
        label={s.dir}
        value={dir}
        onChange={(d) => { setDir(d); setText(""); }}
        options={[{ id: "encode", label: s.enc }, { id: "decode", label: s.dec }]}
      />

      {dir === "encode" && (
        <ChipGroup
          label={s.form}
          value={urlSafe ? "url" : "std"}
          onChange={(v) => setUrlSafe(v === "url")}
          hint={urlSafe ? s.urlHint : s.stdHint}
          options={[{ id: "std", label: s.std }, { id: "url", label: s.url }]}
        />
      )}

      <Field label={dir === "encode" ? s.text : s.b64} htmlFor="b64-in">
        <TextArea
          id="b64-in"
          value={text}
          onChange={setText}
          dir={dir === "encode" ? "auto" : "ltr"}
          placeholder={dir === "encode" ? s.ph : "2K3ZgtmK2KjYqQ=="}
        />
      </Field>

      {res.error && <ErrorNote>{res.error}</ErrorNote>}

      <ResultBox
        title={dir === "encode" ? s.b64 : s.text}
        value={res.out}
        dir={dir === "encode" ? "ltr" : "auto"}
        mono={dir === "encode"}
        hint={res.out ? s.bytes(res.bytes, res.out.length) : undefined}
        actions={
          res.out
            ? <button className="btn btn-ghost !px-3 !py-1 !text-[0.82rem]" onClick={swap}>{s.swap}</button>
            : undefined
        }
      />

      <Note>
        {s.note1}<code className="font-mono text-[0.85rem]">btoa</code>{s.note2}
        <b className="font-semibold text-ink">{s.noteBold}</b>{s.note3}
      </Note>
    </ToolLayout>
  );
}
