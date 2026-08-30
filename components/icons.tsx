import type { SVGProps } from "react";

/* شعار Do Kits — حقيبة بلاطات واحدتها مضيئة (من وثيقة الهويّة) */
export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" role="img" aria-label="Do Kits">
      <rect x="34" y="8" width="28" height="22" rx="11" fill="none" stroke="var(--dk-primary)" strokeWidth="8" />
      <rect x="14" y="20" width="68" height="68" rx="18" fill="var(--dk-primary)" />
      <rect x="20" y="26" width="24" height="24" rx="7" fill="var(--dk-bg)" />
      <rect x="52" y="26" width="24" height="24" rx="7" fill="var(--dk-accent)" />
      <rect x="20" y="58" width="24" height="24" rx="7" fill="var(--dk-bg)" />
      <rect x="52" y="58" width="24" height="24" rx="7" fill="var(--dk-bg)" />
    </svg>
  );
}

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size: number | undefined, rest: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> => ({
  width: size ?? 20, height: size ?? 20, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", ...rest,
});

export const SearchIcon = ({ size, ...r }: P) => (
  <svg {...base(size, r)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const StarIcon = ({ size, filled = false, ...r }: P & { filled?: boolean }) => (
  <svg {...base(size, r)} fill={filled ? "currentColor" : "none"}>
    <path d="m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.4l6.5-.9z" />
  </svg>
);

/* أيقونات التصنيفات والأدوات — بالاسم من manifest */
const MAP: Record<string, (p: P) => React.ReactElement> = {
  docs: (p) => (
    <svg {...base(p.size, p)}><path d="M4 6h16M4 12h10M4 18h7" /></svg>
  ),
  business: (p) => (
    <svg {...base(p.size, p)}><rect x="4" y="3" width="16" height="18" rx="3" /><path d="M8 8h8M8 13h3M8 17h3M14.5 13.5v3M13 15h3" /></svg>
  ),
  convert: (p) => (
    <svg {...base(p.size, p)}><path d="M4 8h13l-3-3M20 16H7l3 3" /></svg>
  ),
  dev: (p) => (
    <svg {...base(p.size, p)}><path d="m8 7-5 5 5 5M16 7l5 5-5 5" /></svg>
  ),
  design: (p) => (
    <svg {...base(p.size, p)}><path d="m13 3 8 8-9.5 9.5H3v-8.5z" /><path d="m10.5 6.5 7 7" /></svg>
  ),
  receipt: (p) => (
    <svg {...base(p.size, p)}><path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2zM9 8h6M9 12h6" /></svg>
  ),
  percent: (p) => (
    <svg {...base(p.size, p)}><path d="m5 19 14-14" /><circle cx="7" cy="7" r="2.5" /><circle cx="17" cy="17" r="2.5" /></svg>
  ),
  tag: (p) => (
    <svg {...base(p.size, p)}><path d="M3 12V4h8l9 9-8 8z" /><circle cx="7.5" cy="7.5" r="1.2" /></svg>
  ),
  scissors: (p) => (
    <svg {...base(p.size, p)}><circle cx="6" cy="7" r="2.5" /><circle cx="6" cy="17" r="2.5" /><path d="M20 4 8.5 15.5M20 20 8.5 8.5" /></svg>
  ),
  clock: (p) => (
    <svg {...base(p.size, p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
  ),
  users: (p) => (
    <svg {...base(p.size, p)}><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M17 5.5a3 3 0 0 1 0 5M18 20a5.5 5.5 0 0 0-2-4.3" /></svg>
  ),
  bank: (p) => (
    <svg {...base(p.size, p)}><path d="M3 10 12 4l9 6M5 10v8M10 10v8M14 10v8M19 10v8M3 20h18" /></svg>
  ),
  loan: (p) => (
    <svg {...base(p.size, p)}><rect x="2" y="6" width="20" height="13" rx="3" /><circle cx="12" cy="12.5" r="2.5" /><path d="M6 12.5h.01M18 12.5h.01" /></svg>
  ),
  crescent: (p) => (
    <svg {...base(p.size, p)}><path d="M20 15.5A8.5 8.5 0 1 1 10.5 4a6.6 6.6 0 0 0 9.5 11.5z" /></svg>
  ),
  award: (p) => (
    <svg {...base(p.size, p)}><circle cx="12" cy="9" r="5.5" /><path d="m8.5 13.5-1.5 7 5-2.5 5 2.5-1.5-7" /></svg>
  ),
  eraser: (p) => (
    <svg {...base(p.size, p)}><path d="m5 15 7-7 6 6-5 5H8zM4 21h16" /></svg>
  ),
  digits: (p) => (
    <svg {...base(p.size, p)}><path d="M6 8h2v9M14 8h3a2 2 0 0 1 0 4h-1a2 2 0 0 0 0 4h3" /></svg>
  ),
  keyboard: (p) => (
    <svg {...base(p.size, p)}><rect x="2" y="6" width="20" height="12" rx="3" /><path d="M7 10h.01M11 10h.01M15 10h.01M8 14h8" /></svg>
  ),
  broom: (p) => (
    <svg {...base(p.size, p)}><path d="M15 4 9 10M7 12l5 5-4 4H4v-4zM13 6l5 5" /></svg>
  ),
  swap: (p) => (
    <svg {...base(p.size, p)}><path d="M4 8h13l-3-3M20 16H7l3 3" /></svg>
  ),
  sort: (p) => (
    <svg {...base(p.size, p)}><path d="M7 4v16l-3-3M17 20V4l3 3" /></svg>
  ),
  chart: (p) => (
    <svg {...base(p.size, p)}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
  ),
  filter: (p) => (
    <svg {...base(p.size, p)}><path d="M3 5h18l-7 8v6l-4-2v-4z" /></svg>
  ),
  link: (p) => (
    <svg {...base(p.size, p)}><path d="M10 13a4 4 0 0 0 5.7.3l3-3A4 4 0 0 0 13 4.6l-1.7 1.7M14 11a4 4 0 0 0-5.7-.3l-3 3A4 4 0 0 0 11 19.4l1.7-1.7" /></svg>
  ),
  gauge: (p) => (
    <svg {...base(p.size, p)}><path d="M4 18a8 8 0 1 1 16 0" /><path d="M12 18l4-5" /></svg>
  ),
  diff: (p) => (
    <svg {...base(p.size, p)}><path d="M6 3v13M6 20v1M18 8v13M18 3v1M4 6h4M16 18h4M18 8a5 5 0 0 1-5-5" /></svg>
  ),
  markdown: (p) => (
    <svg {...base(p.size, p)}><rect x="2" y="5" width="20" height="14" rx="3" /><path d="M6 15V9l2.5 3L11 9v6M15 9v6M15 15h3" /></svg>
  ),
  calendar: (p) => (
    <svg {...base(p.size, p)}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 10h18M8.5 14.5h6l-2-2M15.5 17.5h-6l2 2" />
    </svg>
  ),
  numbers: (p) => (
    <svg {...base(p.size, p)}><rect x="14" y="7" width="7" height="10" rx="2.5" /><path d="M10 9H3M10 15H6" /></svg>
  ),
  counter: (p) => (
    <svg {...base(p.size, p)}><path d="M10 3 8 21M16 3l-2 18M4 9h17M3 15h17" /></svg>
  ),
  tool: (p) => (
    <svg {...base(p.size, p)}><path d="M14.5 4.5a5 5 0 0 0-6.6 6.2L3 15.6V21h5.4l4.9-4.9a5 5 0 0 0 6.2-6.6l-3.4 3.4-3.5-1-1-3.5z" /></svg>
  ),
};

export function NamedIcon({ name, ...p }: P & { name: string }) {
  const C = MAP[name] ?? MAP.tool;
  return C(p);
}
