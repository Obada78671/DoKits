"use client";

import { useMemo, useState } from "react";
import { CopyButton, Field, Note, TextArea, Tiles, ToolLayout } from "@/components/tool-kit";
import { diffLines } from "@/tools/text-lib";

const fmt = new Intl.NumberFormat("en-US");

export default function TextDiff() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const rows = useMemo(() => (a || b ? diffLines(a, b) : []), [a, b]);
  const added = rows.filter((r) => r.type === "add").length;
  const removed = rows.filter((r) => r.type === "del").length;
  const asText = rows.map((r) => `${r.type === "add" ? "+" : r.type === "del" ? "-" : " "} ${r.text}`).join("\n");

  return (
    <ToolLayout>
      <div className="flex flex-wrap gap-3">
        <Field label="النصّ الأوّل" htmlFor="td-a" className="min-w-56 flex-1">
          <TextArea id="td-a" value={a} onChange={setA} rows={8} placeholder="النسخةُ القديمة…" />
        </Field>
        <Field label="النصّ الثاني" htmlFor="td-b" className="min-w-56 flex-1">
          <TextArea id="td-b" value={b} onChange={setB} rows={8} placeholder="النسخةُ الجديدة…" />
        </Field>
      </div>

      <Tiles
        items={[
          { label: "أسطرٌ مختلفة", value: fmt.format(added + removed), lit: true },
          { label: "أُضيفت", value: fmt.format(added) },
          { label: "حُذفت", value: fmt.format(removed) },
        ]}
      />

      <div className="rounded-m border border-line bg-surface">
        <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
          <span className="text-[0.78rem] font-bold tracking-wide text-primary">الفروق</span>
          <span className="ms-auto"><CopyButton value={asText} /></span>
        </div>
        {rows.length === 0 ? (
          <p className="px-4 py-6 text-center text-muted">—</p>
        ) : (
          <ul className="max-h-[28rem] overflow-y-auto font-mono text-[0.88rem] leading-relaxed">
            {rows.map((r, i) => (
              <li
                key={i}
                dir="auto"
                className={`flex gap-2 px-4 py-0.5 ${
                  r.type === "add" ? "bg-primary-soft" : r.type === "del" ? "bg-danger/10" : ""
                }`}
              >
                <span aria-hidden="true" className={`select-none ${r.type === "add" ? "text-primary" : r.type === "del" ? "text-danger" : "text-muted"}`}>
                  {r.type === "add" ? "+" : r.type === "del" ? "−" : " "}
                </span>
                <span className="min-w-0 whitespace-pre-wrap break-words">{r.text || " "}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Note>المقارنةُ سطراً سطراً بأطول تسلسلٍ مشترك — فالأسطرُ المنقولةُ تظهر حذفاً وإضافةً لا تعديلاً.</Note>
    </ToolLayout>
  );
}
