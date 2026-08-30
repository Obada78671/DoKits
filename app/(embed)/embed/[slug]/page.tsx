import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TOOLS, isLive, toolBySlug } from "@/tools";
import { EmbedHeight } from "@/components/embed-height";

export const dynamic = "force-dynamic";

const BASE = process.env.SITE_URL ?? "https://dokits.net";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = toolBySlug(TOOLS, slug);
  return { title: t ? `${t.title.ar} · Do Kits` : "غير موجود", robots: { index: false, follow: false } };
}

export default async function EmbedPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = toolBySlug(TOOLS, slug);
  if (!tool || !isLive(tool)) notFound();
  const { default: Tool } = await tool.load();

  return (
    <div className="flex flex-col gap-3 p-4">
      <EmbedHeight />
      <h1 className="text-[1.05rem] font-bold text-ink">{tool.title.ar}</h1>
      {tool.instructions && <p className="text-[0.84rem] leading-relaxed text-muted">{tool.instructions}</p>}

      <Tool />

      <p className="border-t border-line pt-3 text-[0.78rem] text-muted">
        الحسابُ كلُّه في متصفّحك.{" "}
        <a
          href={`${BASE}${tool.route}?from=embed`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary hover:underline"
        >
          {tool.title.ar} على Do Kits ↗
        </a>
      </p>
    </div>
  );
}
