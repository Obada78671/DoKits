"use client";

import { useState, type ReactNode } from "react";
import { useLang } from "@/components/lang";

/**
 * عُدّةُ الأدوات المشتركة — ما تكرّره الأدوات يصعد إلى القشرة (القاعدة ٩ من عقد التطبيع).
 * كلُّ ما هنا مبنيٌّ على رموز `--dk-` عبر أصناف الحقيبة، فلا لونَ صلبٌ في أيّ أداة.
 */

export function CopyButton({ value, small = true }: { value: string; small?: boolean }) {
  const en = useLang() === "en";
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* الحافظة قد تُمنع — لا شيء يُكسر */ }
  };
  return (
    <button
      className={`btn btn-ghost ${small ? "!px-3 !py-1 !text-[0.82rem]" : ""}`}
      onClick={copy}
      disabled={!value}
    >
      {copied ? (en ? "Copied ✓" : "نُسخ ✓") : (en ? "Copy" : "نسخ")}
    </button>
  );
}

export function Field({
  label, hint, htmlFor, children, className = "",
}: { label?: string; hint?: ReactNode; htmlFor?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      {label && (htmlFor ? <label className="label" htmlFor={htmlFor}>{label}</label> : <span className="label">{label}</span>)}
      {children}
      {hint && <p className="mt-1.5 text-[0.82rem] leading-relaxed text-muted">{hint}</p>}
    </div>
  );
}

export function TextArea({
  value, onChange, placeholder, id, rows = 7, dir,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  id?: string; rows?: number; dir?: "rtl" | "ltr" | "auto";
}) {
  return (
    <textarea
      id={id}
      dir={dir}
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="field resize-y leading-loose"
    />
  );
}

/** صندوقُ نتيجةٍ نصّيّ — مع زرّ نسخٍ وحالةِ فراغ */
export function ResultBox({
  title, value, dir = "rtl", mono = false, hint, actions,
}: {
  title: string; value: string; dir?: "rtl" | "ltr" | "auto";
  mono?: boolean; hint?: ReactNode; actions?: ReactNode;
}) {
  const empty = !value;
  return (
    <div className="rounded-m border border-line bg-surface p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-[0.78rem] font-bold tracking-wide text-primary">{title}</span>
        <span className="ms-auto flex items-center gap-2">
          {actions}
          <CopyButton value={value} />
        </span>
      </div>
      <p
        dir={dir}
        className={`min-h-12 whitespace-pre-wrap break-words leading-loose ${mono ? "font-mono text-[0.92rem] tabular-nums" : ""} ${empty ? "text-muted" : "text-ink"}`}
      >
        {empty ? "—" : value}
      </p>
      {hint && <p className="mt-2 text-[0.82rem] text-muted">{hint}</p>}
    </div>
  );
}

export type ChipOption<T extends string> = { id: T; label: string; title?: string };

export function ChipGroup<T extends string>({
  label, options, value, onChange, hint,
}: {
  label?: string; options: ChipOption<T>[]; value: T;
  onChange: (id: T) => void; hint?: ReactNode;
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {/* المفتاحُ يضمّ الترتيبَ لأنّ قائمتين مشروعتين قد تشتركان في معرّفٍ
            (بلدان بنسبة الضريبة نفسِها مثلاً) — والمفتاحُ المكرّر يُسقط عنصراً بصمت */}
        {options.map((o, i) => (
          <button
            key={`${o.id}-${i}`}
            title={o.title}
            className={`chip ${value === o.id ? "chip-active" : ""}`}
            onClick={() => onChange(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </Field>
  );
}

/** خياراتٌ متعدّدةٌ تُفعَّل معاً — لا تُلوَّن بالكهرمان إلّا المفعَّلة */
export function ToggleChips<T extends string>({
  label, options, value, onToggle, hint,
}: {
  label?: string; options: ChipOption<T>[]; value: Set<T>;
  onToggle: (id: T) => void; hint?: ReactNode;
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((o, i) => (
          <button
            key={`${o.id}-${i}`}
            title={o.title}
            aria-pressed={value.has(o.id)}
            className={`chip ${value.has(o.id) ? "chip-active" : ""}`}
            onClick={() => onToggle(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </Field>
  );
}

/** بلاطاتُ أرقام — واحدةٌ مضيئةٌ فقط (قاعدةُ الكهرمان) */
export function Tiles({ items }: { items: { label: string; value: string; lit?: boolean }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((t) => (
        <div
          key={t.label}
          className={`rounded-m border p-3.5 text-center ${t.lit ? "border-accent bg-accent-soft" : "border-line bg-surface"}`}
        >
          <div dir="ltr" className="font-mono text-2xl font-medium tabular-nums">{t.value}</div>
          <div className="mt-0.5 text-[0.8rem] text-muted">{t.label}</div>
        </div>
      ))}
    </div>
  );
}

export function NumberField({
  id, value, onChange, min, max, step, dir = "ltr", placeholder,
}: {
  id?: string; value: number | string; onChange: (v: string) => void;
  min?: number; max?: number; step?: number | string; dir?: "ltr" | "rtl"; placeholder?: string;
}) {
  return (
    <input
      id={id}
      type="number"
      inputMode="decimal"
      dir={dir}
      className="field font-mono tabular-nums"
      value={value}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function TextField({
  id, value, onChange, placeholder, dir, mono = false,
}: {
  id?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; dir?: "rtl" | "ltr" | "auto"; mono?: boolean;
}) {
  return (
    <input
      id={id}
      type="text"
      dir={dir}
      className={`field ${mono ? "font-mono" : ""}`}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return <p role="alert" className="form-error">{children}</p>;
}

export function Note({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-[0.84rem] leading-relaxed text-muted ${className}`}>{children}</p>;
}

/** هيكلُ أداةٍ عموديٌّ موحّدُ التباعد */
export function ToolLayout({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-5">{children}</div>;
}
