"use client";

import { useCallback, useEffect, useState } from "react";
import { Field, Note } from "@/components/tool-kit";

export type Picked = { file: File; url: string; img: HTMLImageElement };

/**
 * اختيارُ صورةٍ من الجهاز وتحميلُها إلى عنصر Image.
 * العنوانُ blob محلّيٌّ يُلغى عند التبديل — فلا تتسرّب ذاكرةُ صورٍ كبيرةٍ في جلسةٍ طويلة.
 */
export function useImagePicker() {
  const [picked, setPicked] = useState<Picked | null>(null);
  const [error, setError] = useState("");

  useEffect(() => () => { if (picked) URL.revokeObjectURL(picked.url); }, [picked]);

  const pick = useCallback((file: File | undefined) => {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("هذا ليس ملفَّ صورة."); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setPicked((prev) => { if (prev) URL.revokeObjectURL(prev.url); return { file, url, img }; });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError("تعذّر فتحُ الصورة — قد تكون تالفةً أو بصيغةٍ لا يعرضها المتصفّح.");
    };
    img.src = url;
  }, []);

  return { picked, error, pick };
}

export function ImagePicker({
  id, onPick, picked, hint,
}: { id: string; onPick: (f: File | undefined) => void; picked: Picked | null; hint?: string }) {
  return (
    <Field
      label="الصورة"
      htmlFor={id}
      hint={
        picked
          ? `${picked.file.name} — ${picked.img.naturalWidth}×${picked.img.naturalHeight} · ${(picked.file.size / 1024).toFixed(0)} ك.ب`
          : (hint ?? "تُقرأ في متصفّحك ولا تُرفَع إلى أيّ خادم.")
      }
    >
      <input
        id={id}
        type="file"
        accept="image/*"
        className="field cursor-pointer file:me-3 file:rounded-s file:border-0 file:bg-surface2 file:px-3 file:py-1 file:text-ink"
        onChange={(e) => onPick(e.target.files?.[0])}
      />
    </Field>
  );
}

/** تنزيلٌ من blob — الملفُّ يُبنى في المتصفّح ولا يمرّ بالشبكة */
export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const LocalNote = () => (
  <Note>
    <b className="font-semibold text-ink">الصورةُ لا تغادر جهازك.</b> كلُّ الرسم والتحويل يجري على
    ‏canvas في متصفّحك، ولا يُرسَل شيءٌ إلى خادم — فيصلح هذا لصورٍ لا ترضى برفعها إلى موقعٍ لا تعرفه.
  </Note>
);
