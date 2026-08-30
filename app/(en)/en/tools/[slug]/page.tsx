import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TOOLS, isLive, toolBySlug } from "@/tools";
import { NamedIcon } from "@/components/icons";
import { ToolFrame } from "@/components/tool-frame";
import { EmbedSnippet } from "@/components/embed-snippet";
import { dict } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const BASE = process.env.SITE_URL ?? "https://dokits.net";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = toolBySlug(TOOLS, slug);
  if (!t || !t.langs.includes("en")) return { title: "Not found" };
  return {
    title: t.title.en,
    description: t.description.en,
    keywords: [...t.keywordsEn, ...t.keywords],
    alternates: { canonical: `/en${t.route}`, languages: { ar: t.route, en: `/en${t.route}` } },
    openGraph: { title: `${t.title.en} · Do Kits`, description: t.description.en, type: "website", locale: "en", url: `${BASE}/en${t.route}` },
  };
}

export default async function EnToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = toolBySlug(TOOLS, slug);
  // أداةٌ لم تُترجَم واجهتُها ليست موجودةً في الإنجليزيّة — لا تُعرَض نصفَ مترجَمة
  if (!tool || !isLive(tool) || !tool.langs.includes("en")) notFound();
  const { default: Tool } = await tool.load();
  const t = dict("en");
  const related = TOOLS.filter((x) => x.langs.includes("en") && x.slug !== tool.slug && isLive(x)).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.title.en,
    description: tool.description.en,
    url: `${BASE}/en${tool.route}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    inLanguage: "en",
    softwareVersion: tool.version,
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <div className="flex flex-col gap-7 pt-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="flex flex-wrap items-center gap-2 text-[0.88rem] text-muted" aria-label="Breadcrumb">
        <Link href="/en" className="hover:text-primary">{t.tool.breadcrumbRoot}</Link>
        <span aria-hidden="true">›</span>
        <span>{tool.title.en}</span>
      </nav>

      <header className="flex flex-col gap-3">
        <div className="flex items-start gap-3.5">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <NamedIcon name={tool.icon} size={24} />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">{tool.title.en}</h1>
            <p className="text-[0.92rem] text-muted">{tool.description.en}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[0.76rem]">
          <span className="rounded-full bg-primary-soft px-2.5 py-1 font-bold text-primary">{t.tool.localBadge}</span>
          {tool.status === "beta" && (
            <span className="rounded-full bg-accent-soft px-2.5 py-1 font-bold text-ink">{t.tool.beta}</span>
          )}
          <Link href={tool.route} hrefLang="ar" className="ms-auto text-[0.8rem] font-medium text-primary hover:underline">
            العربيّة ←
          </Link>
        </div>
      </header>

      <div className="card p-5 sm:p-6">
        <ToolFrame
          slug={tool.slug}
          title={tool.title.en}
          instructions={tool.instructionsEn}
          capabilities={tool.capabilities}
          nextSteps={tool.nextSteps?.filter((n) => TOOLS.find((x) => x.slug === n.slug)?.langs.includes("en"))}
          demo={tool.demo}
          lang="en"
        >
          <Tool />
        </ToolFrame>
      </div>

      {tool.useStepsEn && tool.useStepsEn.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">{t.tool.howToUse}</h2>
          <ol className="flex flex-col gap-2.5">
            {tool.useStepsEn.map((step, i) => (
              <li key={i} className="flex gap-3 text-[0.94rem] leading-relaxed text-muted">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft font-mono text-[0.76rem] font-bold text-primary">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {tool.howItWorksEn && tool.howItWorksEn.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">{t.tool.howItWorks}</h2>
          <ul className="flex flex-col gap-2.5">
            {tool.howItWorksEn.map((p, i) => (
              <li key={i} className="flex gap-3 text-[0.94rem] leading-relaxed text-muted">
                <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tool.faqEn && tool.faqEn.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">{t.tool.faq}</h2>
          <div className="flex flex-col gap-2">
            {tool.faqEn.map((f, i) => (
              <details key={i} className="card p-4">
                <summary className="cursor-pointer font-medium text-ink">{f.q}</summary>
                <p className="mt-2 text-[0.92rem] leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <EmbedSnippet base={BASE} slug={tool.slug} title={tool.title.en} lang="en" />

      {related.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">{t.tool.related}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {related.map((r) => (
              <Link key={r.slug} href={`/en${r.route}`} className="card flex items-start gap-3 p-3.5 hover:border-primary">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                  <NamedIcon name={r.icon} size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-ink">{r.title.en}</span>
                  <span className="block text-[0.84rem] leading-snug text-muted">{r.description.en}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line pt-4 text-[0.82rem] text-muted">
        <span>{t.tool.privacyLocal}{t.tool.privacyNoStore}</span>
        <span dir="ltr" className="font-mono">v{tool.version}</span>
      </footer>
    </div>
  );
}
