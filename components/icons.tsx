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
  tool: (p) => (
    <svg {...base(p.size, p)}><path d="M14.5 4.5a5 5 0 0 0-6.6 6.2L3 15.6V21h5.4l4.9-4.9a5 5 0 0 0 6.2-6.6l-3.4 3.4-3.5-1-1-3.5z" /></svg>
  ),
};

export function NamedIcon({ name, ...p }: P & { name: string }) {
  const C = MAP[name] ?? MAP.tool;
  return C(p);
}
