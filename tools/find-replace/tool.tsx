"use client";

import { useMemo, useState } from "react";
import {
  ErrorNote, Field, Note, ResultBox, TextArea, TextField, ToggleChips, ToolLayout,
} from "@/components/tool-kit";

type Opt = "regex" | "ignoreCase" | "wholeWord";

const OPTIONS: { id: Opt; label: string; title: string }[] = [
  { id: "regex", label: "تعبيرٌ نمطيّ", title: "يُفسَّر البحثُ كـregex — و$1 يشير إلى المجموعة الأولى" },
  { id: "ignoreCase", label: "تجاهلُ حالة الأحرف", title: "للاتينيّة" },
  { id: "wholeWord", label: "كلمةً كاملة", title: "لا يطابق جزءاً من كلمة" },
];

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default function FindReplace() {
  const [text, setText] = useState("");
  const [find, setFind] = useState("");
  const [repl, setRepl] = useState("");
  const [on, setOn] = useState<Set<Opt>>(new Set());

  const toggle = (id: Opt) =>
    setOn((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const { out, count, error } = useMemo(() => {
    if (!find) return { out: text, count: 0, error: "" };
    try {
      let src = on.has("regex") ? find : escapeRe(find);
      if (on.has("wholeWord")) src = `(?<![\\p{L}\\p{N}])(?:${src})(?![\\p{L}\\p{N}])`;
      const re = new RegExp(src, `gu${on.has("ignoreCase") ? "i" : ""}`);
      const matches = text.match(re)?.length ?? 0;
      return { out: text.replace(re, repl), count: matches, error: "" };
    } catch (e) {
      return { out: "", count: 0, error: `تعبيرٌ نمطيٌّ غير صالح: ${(e as Error).message}` };
    }
  }, [text, find, repl, on]);

  return (
    <ToolLayout>
      <Field label="النصّ" htmlFor="fr-in">
        <TextArea id="fr-in" value={text} onChange={setText} placeholder="ألصق النصّ…" />
      </Field>
      <div className="flex flex-wrap gap-3">
        <Field label="ابحث عن" htmlFor="fr-find" className="min-w-48 flex-1">
          <TextField id="fr-find" value={find} onChange={setFind} dir="auto" mono={on.has("regex")} />
        </Field>
        <Field label="استبدل بـ" htmlFor="fr-repl" className="min-w-48 flex-1">
          <TextField id="fr-repl" value={repl} onChange={setRepl} dir="auto" />
        </Field>
      </div>
      <ToggleChips label="الخيارات" options={OPTIONS} value={on} onToggle={toggle} />
      {error ? <ErrorNote>{error}</ErrorNote> : null}
      <ResultBox
        title="النتيجة"
        value={error ? "" : out}
        hint={find && !error ? `${count} مطابقة` : undefined}
      />
      <Note>مع التعبير النمطيّ تعمل المجموعات في بديلك: <span className="font-mono" dir="ltr">$1</span> و<span className="font-mono" dir="ltr">$2</span>.</Note>
    </ToolLayout>
  );
}
