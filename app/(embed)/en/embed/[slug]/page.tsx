import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TOOLS, isLive, toolBySlug } from "@/tools";
import { EmbedHeight } from "@/components/embed-height";
import { LangProvider } from "@/components/lang";

export const dynamic = "force-dynamic";

const BASE = process.env.SITE_URL ?? "https://dokits.net";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = toolBySlug(TOOLS, slug);
  return { title: t ? `${t.title.en} · Do Kits` : "Not found", robots: { index: false, follow: false } };
}

export default async function EnEmbedPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = toolBySlug(TOOLS, slug);
  if (!tool || !isLive(tool) || !tool.langs.includes("en")) notFound();
  const { default: Tool } = await tool.load();

  return (
    <LangProvider value="en">
      <div className="flex flex-col gap-3 p-4" dir="ltr">
        <EmbedHeight />
        <h1 className="text-[1.05rem] font-bold text-ink">{tool.title.en}</h1>
        {tool.instructionsEn && <p className="text-[0.84rem] leading-relaxed text-muted">{tool.instructionsEn}</p>}

        <Tool />

        <p className="border-t border-line pt-3 text-[0.78rem] text-muted">
          Everything is computed in your browser.{" "}
          <a href={`${BASE}/en${tool.route}?from=embed`} target="_blank" rel="noopener noreferrer"
             className="font-medium text-primary hover:underline">
            {tool.title.en} on Do Kits ↗
          </a>
        </p>
      </div>
    </LangProvider>
  );
}
