import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  TOOLS, categoryById, isLive, relatedTools, subcategoryName, summarize, toolBySlug,
} from "@/tools";
import { categoryNames } from "@/lib/db";
import { track } from "@/lib/analytics";
import { NamedIcon } from "@/components/icons";
import { ToolFrame } from "@/components/tool-frame";

export const dynamic = "force-dynamic";

const BASE = process.env.SITE_URL ?? "https://dokits.net";

const COMPLEXITY_AR = { basic: "بسيطة", medium: "متوسّطة", advanced: "متقدّمة" } as const;

/** الوسومُ تُشتقّ من السجلّ — لا تُكتب لكلّ أداةٍ يدويّاً */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = toolBySlug(TOOLS, slug);
  if (!t) return { title: "غير موجود" };
  return {
    title: t.seo.title,
    description: t.seo.description,
    keywords: [...t.keywords, ...t.keywordsEn, ...t.tags, t.title.en],
    alternates: { canonical: t.seo.canonicalPath },
    robots: t.seo.noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: `${t.seo.title} · Do Kits`, description: t.seo.description,
      type: "website", locale: "ar", url: `${BASE}${t.seo.canonicalPath}`,
    },
    twitter: { card: "summary", title: `${t.seo.title} · Do Kits`, description: t.seo.description },
  };
}

/* بلا حدِّ Suspense هنا عن قصد: الوحدةُ مُنتظَرةٌ على الخادم قبل الرسم، فالهيكلُ لا يظهر أبداً.
   ووجودُ الحدّ كان يسمح لـReact بتأجيل محتوى الأداة إلى بثٍّ لاحقٍ متى تجاوزت الصفحةُ
   حدَّ progressiveChunkSize (~٩٦ ك.ب) — وذلك المحتوى المؤجَّل كان يصل بلا ترطيب، فتموت الأداة. */

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = toolBySlug(TOOLS, slug);
  if (!tool || !isLive(tool)) notFound();

  track("view", tool.slug);

  const names = categoryNames();
  const catDef = categoryById(tool.categoryId);
  const catName = names[tool.categoryId] ?? catDef?.name ?? tool.categoryId;
  const subName = subcategoryName(tool.categoryId, tool.subcategoryId);
  const related = relatedTools(TOOLS.map(summarize), summarize(tool));
  const { default: Tool } = await tool.load();
  const local = tool.privacy.processing === "local";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: tool.title.ar,
        alternateName: tool.title.en,
        description: tool.seo.description,
        url: `${BASE}${tool.route}`,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        inLanguage: "ar",
        softwareVersion: tool.version,
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "الأدوات", item: BASE },
          { "@type": "ListItem", position: 2, name: catName, item: `${BASE}/category/${tool.categoryId}` },
          ...(subName ? [{ "@type": "ListItem", position: 3, name: subName, item: `${BASE}/category/${tool.categoryId}/${tool.subcategoryId}` }] : []),
          { "@type": "ListItem", position: subName ? 4 : 3, name: tool.title.ar, item: `${BASE}${tool.route}` },
        ],
      },
      ...(tool.faq?.length
        ? [{
            "@type": "FAQPage",
            mainEntity: tool.faq.map((f) => ({
              "@type": "Question", name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }]
        : []),
    ],
  };

  return (
    <div className="flex flex-col gap-7 pt-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="flex flex-wrap items-center gap-2 text-[0.88rem] text-muted" aria-label="مسار">
        <Link href="/" className="hover:text-primary">الأدوات</Link>
        <span aria-hidden="true">‹</span>
        <Link href={`/category/${tool.categoryId}`} className="hover:text-primary">{catName}</Link>
        {subName && (
          <>
            <span aria-hidden="true">‹</span>
            <Link href={`/category/${tool.categoryId}/${tool.subcategoryId}`} className="hover:text-primary">{subName}</Link>
          </>
        )}
      </nav>

      <header className="flex flex-col gap-3">
        <div className="flex items-start gap-3.5">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <NamedIcon name={tool.icon} size={24} />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">{tool.title.ar}</h1>
            <p className="text-[0.92rem] text-muted">{tool.description.ar}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[0.76rem]">
          <span className={`rounded-full px-2.5 py-1 font-bold ${local ? "bg-primary-soft text-primary" : "bg-surface2 text-muted"}`}>
            {local ? "🔒 تعمل في متصفّحك" : "تحتاج الخادم"}
          </span>
          {tool.status === "beta" && (
            <span className="rounded-full bg-accent-soft px-2.5 py-1 font-bold text-ink">تجريبيّة</span>
          )}
          <span className="rounded-full border border-line px-2.5 py-1 text-muted">{COMPLEXITY_AR[tool.complexity]}</span>
          {tool.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-full border border-line px-2.5 py-1 text-muted">{tag}</span>
          ))}
        </div>
      </header>

      <div className="card p-5 sm:p-6">
        <ToolFrame
          slug={tool.slug}
          title={tool.title.ar}
          instructions={tool.instructions}
          capabilities={tool.capabilities}
        >
          <Tool />
        </ToolFrame>
      </div>

      {tool.howItWorks && tool.howItWorks.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">كيف تعمل الأداة؟</h2>
          <ul className="flex flex-col gap-2.5">
            {tool.howItWorks.map((p, i) => (
              <li key={i} className="flex gap-3 text-[0.94rem] leading-relaxed text-muted">
                <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tool.faq && tool.faq.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">أسئلةٌ شائعة</h2>
          <div className="flex flex-col gap-2">
            {tool.faq.map((f, i) => (
              <details key={i} className="card p-4">
                <summary className="cursor-pointer font-medium text-ink">{f.q}</summary>
                <p className="mt-2 text-[0.92rem] leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {related.length === 0 ? (
        <section className="rounded-m border border-line bg-surface2 px-5 py-4">
          <p className="text-[0.92rem] text-muted">
            لا أدواتِ صلةٍ بعد — هذه أوّلُ أداةٍ في تصنيفها.{" "}
            <Link href="/" className="font-medium text-primary">تصفّح كلَّ الأدوات</Link>
          </p>
        </section>
      ) : (
        <section>
          <h2 className="mb-3 text-lg font-bold">أدواتٌ ذاتُ صلة</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {related.map((r) => (
              <Link key={r.slug} href={r.route} className="card flex items-start gap-3 p-3.5 hover:border-primary">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                  <NamedIcon name={r.icon} size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-ink">{r.title.ar}</span>
                  <span className="block text-[0.84rem] leading-snug text-muted">{r.description.ar}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line pt-4 text-[0.82rem] text-muted">
        <span>
          {local ? "الحسابُ كلُّه في متصفّحك — لا يُرسَل ما تُدخله إلى الخادم." : "بعضُ الحساب يجري على الخادم."}
          {tool.privacy.storesUserData ? "" : " ولا يُحفظ شيءٌ من مُدخلاتك."}
        </span>
        <span dir="ltr" className="font-mono">v{tool.version}</span>
        <Link href={`/feedback?tool=${tool.slug}`} className="ms-auto font-medium text-primary hover:underline">
          أبلغ عن مشكلةٍ أو اقترح تحسيناً
        </Link>
      </footer>
    </div>
  );
}
