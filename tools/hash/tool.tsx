"use client";

import { useEffect, useRef, useState } from "react";
import { ChipGroup, Field, Note, ResultBox, TextArea, TextField, ToolLayout } from "@/components/tool-kit";
import { HASHES, hashBytes, hashText, type HashId } from "@/tools/dev-lib";
import { useLang, useStrings } from "@/components/lang";

const NOTE_EN: Record<string, string> = {
  "SHA-1": "Cryptographically broken — use it only to verify a file's integrity",
  "SHA-256": "The general choice", "SHA-384": "", "SHA-512": "",
};

const S = {
  ar: {
    source: "المصدر", text: "نصّ", file: "ملفّ", algo: "الخوارزميّة",
    theText: "النصّ", ph: "اكتب أو ألصق…", theFile: "الملفّ",
    fileHint: "يُقرأ في متصفّحك ولا يُرفَع إلى أيّ خادم.",
    digest: (a: string) => `بصمة ${a}`, bits: (n: number) => `${n} بتّاً`, busy: "يُحسب…",
    compare: "قارن ببصمةٍ منشورة", compareHint: "ألصق البصمةَ المعلنةَ للملفّ لتتأكّد أنّه وصل سليماً.",
    match: "متطابقتان ✓ — الملفُّ سليم.", noMatch: "غيرُ متطابقتين ✗ — لا تثق بهذه النسخة.",
    n1: "الحسابُ عبر ", n2: " في متصفّحك، والملفُّ لا يُرفَع. و",
    b1: "‏MD5 غيرُ موجودٍ هنا عن قصد", n3: ": لا يوفّره المتصفّحُ لأنّه مكسور. و",
    b2: "البصمةُ ليست تشفيراً ولا حمايةَ كلماتِ مرور", n4: " — كلمةُ المرور تحتاج argon2 أو bcrypt بملحٍ وبطءٍ مقصود.",
    kb: "ك.ب",
  },
  en: {
    source: "Source", text: "Text", file: "File", algo: "Algorithm",
    theText: "Text", ph: "Type or paste…", theFile: "File",
    fileHint: "Read in your browser — never uploaded to any server.",
    digest: (a: string) => `${a} digest`, bits: (n: number) => `${n} bits`, busy: "computing…",
    compare: "Compare with a published digest", compareHint: "Paste the digest the file publisher declared to confirm it arrived intact.",
    match: "They match ✓ — the file is intact.", noMatch: "They do not match ✗ — do not trust this copy.",
    n1: "Computed with ", n2: " in your browser; the file is never uploaded. And ",
    b1: "MD5 is deliberately absent", n3: ": the browser does not provide it, because it is broken. And ",
    b2: "a hash is neither encryption nor password protection", n4: " — passwords need argon2 or bcrypt, with a salt and deliberate slowness.",
    kb: "KB",
  },
};

type Source = "text" | "file";

export default function Hash() {
  const s = useStrings(S);
  const isEn = useLang() === "en";
  const [source, setSource] = useState<Source>("text");
  const [algo, setAlgo] = useState<HashId>("SHA-256");
  const [text, setText] = useState("");
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [digest, setDigest] = useState("");
  const [busy, setBusy] = useState(false);
  const [compare, setCompare] = useState("");
  const fileBytes = useRef<ArrayBuffer | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (source === "text") {
        if (!text) { setDigest(""); return; }
        const d = await hashText(text, algo);
        if (alive) setDigest(d);
        return;
      }
      if (!fileBytes.current) { setDigest(""); return; }
      setBusy(true);
      const d = await hashBytes(fileBytes.current, algo);
      if (alive) { setDigest(d); setBusy(false); }
    })().catch(() => { if (alive) { setDigest(""); setBusy(false); } });
    return () => { alive = false; };
  }, [text, algo, source, file]);

  const pick = async (f: File | undefined) => {
    if (!f) return;
    fileBytes.current = await f.arrayBuffer();
    setFile({ name: f.name, size: f.size });
  };

  const norm = (s: string) => s.trim().toLowerCase().replace(/[^0-9a-f]/g, "");
  const match = compare.trim() && digest ? norm(compare) === digest : null;

  return (
    <ToolLayout>
      <ChipGroup
        label={s.source}
        value={source}
        onChange={setSource}
        options={[{ id: "text", label: s.text }, { id: "file", label: s.file }]}
      />

      <ChipGroup
        label={s.algo}
        value={algo}
        onChange={setAlgo}
        hint={isEn ? NOTE_EN[algo] : HASHES.find((h) => h.id === algo)?.note}
        options={HASHES.map((h) => ({ id: h.id, label: h.name, title: isEn ? NOTE_EN[h.id] : h.note }))}
      />

      {source === "text" ? (
        <Field label={s.theText} htmlFor="h-in">
          <TextArea id="h-in" value={text} onChange={setText} rows={5} dir="auto" placeholder={s.ph} />
        </Field>
      ) : (
        <Field
          label={s.theFile}
          htmlFor="h-file"
          hint={file ? `${file.name} — ${(file.size / 1024).toFixed(1)} ${s.kb}` : s.fileHint}
        >
          <input
            id="h-file"
            type="file"
            className="field cursor-pointer file:me-3 file:rounded-s file:border-0 file:bg-surface2 file:px-3 file:py-1 file:text-ink"
            onChange={(e) => pick(e.target.files?.[0])}
          />
        </Field>
      )}

      <ResultBox
        title={s.digest(algo)}
        value={busy ? "" : digest}
        dir="ltr"
        mono
        hint={busy ? s.busy : digest ? s.bits(digest.length * 4) : undefined}
      />

      <Field label={s.compare} htmlFor="h-cmp" hint={s.compareHint}>
        <TextField id="h-cmp" value={compare} onChange={setCompare} dir="ltr" mono placeholder="a1b2c3…" />
      </Field>

      {match !== null && (
        <div
          role="status"
          className={`rounded-m border px-4 py-3 font-semibold ${match ? "border-accent bg-accent-soft text-ink" : "border-line bg-surface2 text-ink"}`}
        >
          {match ? s.match : s.noMatch}
        </div>
      )}

      <Note>
        {s.n1}<code className="font-mono text-[0.85rem]">crypto.subtle</code>{s.n2}
        <b className="font-semibold text-ink">{s.b1}</b>{s.n3}
        <b className="font-semibold text-ink">{s.b2}</b>{s.n4}
      </Note>
    </ToolLayout>
  );
}
