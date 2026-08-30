"use client";

import { useEffect, useRef, useState } from "react";
import { ChipGroup, Field, Note, ResultBox, TextArea, TextField, ToolLayout } from "@/components/tool-kit";
import { HASHES, hashBytes, hashText, type HashId } from "@/tools/dev-lib";

type Source = "text" | "file";

export default function Hash() {
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
        label="المصدر"
        value={source}
        onChange={setSource}
        options={[{ id: "text", label: "نصّ" }, { id: "file", label: "ملفّ" }]}
      />

      <ChipGroup
        label="الخوارزميّة"
        value={algo}
        onChange={setAlgo}
        hint={HASHES.find((h) => h.id === algo)?.note}
        options={HASHES.map((h) => ({ id: h.id, label: h.name, title: h.note }))}
      />

      {source === "text" ? (
        <Field label="النصّ" htmlFor="h-in">
          <TextArea id="h-in" value={text} onChange={setText} rows={5} dir="auto" placeholder="اكتب أو ألصق…" />
        </Field>
      ) : (
        <Field
          label="الملفّ"
          htmlFor="h-file"
          hint={file ? `${file.name} — ${(file.size / 1024).toFixed(1)} ك.ب` : "يُقرأ في متصفّحك ولا يُرفَع إلى أيّ خادم."}
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
        title={`بصمة ${algo}`}
        value={busy ? "" : digest}
        dir="ltr"
        mono
        hint={busy ? "يُحسب…" : digest ? `${digest.length * 4} بتّاً` : undefined}
      />

      <Field label="قارن ببصمةٍ منشورة" htmlFor="h-cmp" hint="ألصق البصمةَ المعلنةَ للملفّ لتتأكّد أنّه وصل سليماً.">
        <TextField id="h-cmp" value={compare} onChange={setCompare} dir="ltr" mono placeholder="a1b2c3…" />
      </Field>

      {match !== null && (
        <div
          role="status"
          className={`rounded-m border px-4 py-3 font-semibold ${match ? "border-accent bg-accent-soft text-ink" : "border-line bg-surface2 text-ink"}`}
        >
          {match ? "متطابقتان ✓ — الملفُّ سليم." : "غيرُ متطابقتين ✗ — لا تثق بهذه النسخة."}
        </div>
      )}

      <Note>
        الحسابُ عبر <code className="font-mono text-[0.85rem]">crypto.subtle</code> في متصفّحك،
        والملفُّ لا يُرفَع. و<b className="font-semibold text-ink">‏MD5 غيرُ موجودٍ هنا عن قصد</b>:
        لا يوفّره المتصفّحُ لأنّه مكسور. و<b className="font-semibold text-ink">البصمةُ ليست تشفيراً
        ولا حمايةَ كلماتِ مرور</b> — كلمةُ المرور تحتاج argon2 أو bcrypt بملحٍ وبطءٍ مقصود.
      </Note>
    </ToolLayout>
  );
}
