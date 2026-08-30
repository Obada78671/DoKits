"use client";

import { useMemo, useState } from "react";

/* ————— المنطق: دوالّ نقيّة (القاعدة ٧ من عقد التطبيع) ————— */

const DIACRITICS = /[ً-ْٰ]/g; // التشكيل
const TATWEEL = /ـ/g; // ـ

export type TextStats = {
  words: number; chars: number; charsNoSpace: number; charsBare: number;
  sentences: number; paragraphs: number; readingSec: number;
};

export function analyze(text: string): TextStats {
  const words = (text.match(/[\p{L}\p{N}]+/gu) ?? []).length;
  const chars = [...text].length;
  const noSpace = text.replace(/\s/g, "");
  const charsNoSpace = [...noSpace].length;
  const charsBare = [...noSpace.replace(DIACRITICS, "").replace(TATWEEL, "")].length;
  const sentences = text.split(/[.!?؟…؛]+/).filter((s) => /\p{L}/u.test(s)).length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
  const readingSec = Math.round((words / 180) * 60); // ١٨٠ كلمة عربيّة في الدقيقة
  return { words, chars, charsNoSpace, charsBare, sentences, paragraphs, readingSec };
}

export function formatReading(sec: number): string {
  if (sec === 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const fmt = new Intl.NumberFormat("en-US");

/* ————— الواجهة: مفردات الحقيبة حصراً ————— */

function Tile({ label, value, lit = false }: { label: string; value: string; lit?: boolean }) {
  return (
    <div className={`rounded-m border p-3.5 text-center ${lit ? "border-accent bg-accent-soft" : "border-line bg-surface"}`}>
      <div dir="ltr" className="font-mono text-2xl font-medium tabular-nums">{value}</div>
      <div className="mt-0.5 text-[0.8rem] text-muted">{label}</div>
    </div>
  );
}

export default function WordCounter() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const stats = useMemo(() => analyze(text), [text]);

  const copyReport = async () => {
    const r = `كلمات: ${stats.words} · محارف: ${stats.chars} (بلا مسافات: ${stats.charsNoSpace}، بلا تشكيل: ${stats.charsBare}) · جمل: ${stats.sentences} · فقرات: ${stats.paragraphs} · زمن القراءة: ${formatReading(stats.readingSec)}`;
    try {
      await navigator.clipboard.writeText(r);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* الحافظة قد تُمنع — لا شيء يُكسر */ }
  };

  return (
    <div className="flex flex-col gap-5">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="ألصق نصّك هنا — كلّ شيءٍ يُحسب في متصفّحك ولا يغادر جهازك."
        className="field min-h-56 resize-y leading-loose"
        aria-label="النصّ المراد عدّه"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Tile label="كلمات" value={fmt.format(stats.words)} lit />
        <Tile label="محارف" value={fmt.format(stats.chars)} />
        <Tile label="بلا مسافات" value={fmt.format(stats.charsNoSpace)} />
        <Tile label="بلا تشكيل" value={fmt.format(stats.charsBare)} />
        <Tile label="جمل" value={fmt.format(stats.sentences)} />
        <Tile label="زمن القراءة" value={formatReading(stats.readingSec)} />
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button className="btn btn-primary" onClick={copyReport} disabled={stats.words === 0}>
          {copied ? "نُسخ ✓" : "نسخ التقرير"}
        </button>
        <button className="btn btn-ghost" onClick={() => setText("")} disabled={text.length === 0}>
          مسح النصّ
        </button>
        <span className="ms-auto text-[0.82rem] text-muted">
          {fmt.format(stats.paragraphs)} {stats.paragraphs === 1 ? "فقرة" : "فقرات"}
        </span>
      </div>
    </div>
  );
}
