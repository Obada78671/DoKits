"use client";

import { useMemo, useState } from "react";
import { ChipGroup, CopyButton, Field, Note, ResultBox, TextArea, ToolLayout } from "@/components/tool-kit";
import { markdownToHtml } from "@/tools/text-lib";

export default function Markdown() {
  const [src, setSrc] = useState("");
  const [view, setView] = useState<"preview" | "html">("preview");

  const html = useMemo(() => markdownToHtml(src), [src]);

  return (
    <ToolLayout>
      <Field label="Markdown" htmlFor="md-in">
        <TextArea id="md-in" value={src} onChange={setSrc} rows={9} dir="auto" placeholder={"# عنوان\n\nنصٌّ فيه **غليظ** و*مائل* و`شيفرة`.\n\n- بندٌ أوّل\n- بندٌ ثانٍ"} />
      </Field>
      <ChipGroup
        label="العرض"
        value={view}
        onChange={setView}
        options={[
          { id: "preview", label: "معاينة" },
          { id: "html", label: "شيفرة HTML" },
        ]}
      />
      {view === "html" ? (
        <ResultBox title="HTML" value={html} dir="ltr" mono />
      ) : (
        <div className="rounded-m border border-line bg-surface p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[0.78rem] font-bold tracking-wide text-primary">المعاينة</span>
            <span className="ms-auto"><CopyButton value={html} /></span>
          </div>
          {html ? (
            <div className="md-preview" dir="auto" dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <p className="text-muted">—</p>
          )}
        </div>
      )}
      <Note>
        يدعم العناوينَ والقوائمَ والاقتباسَ والروابطَ والشيفرة. وكلُّ ما تكتبه
        <b className="font-semibold text-ink"> يُهرَّب أوّلاً</b>، فلا يمرّ وسمٌ من نصّك إلى الصفحة.
      </Note>
    </ToolLayout>
  );
}
