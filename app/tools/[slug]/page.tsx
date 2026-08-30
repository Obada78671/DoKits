import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TOOLS, categoryById, isLive, relatedTools, subcategoryName, toolBySlug } from "@/tools";
import { categoryNames } from "@/lib/db";
import { track } from "@/lib/analytics";
import { NamedIcon } from "@/components/icons";
import { ToolFrame } from "@/components/tool-frame";

export const dynamic = "force-dynamic";

/** الوسومُ تُشتقّ من السجلّ — لا تُكتب لكلّ أداةٍ يدويّاً */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = toolBySlug(TOOLS, slug);
  if (!t) return { title: "غير موجود" };
  const title = t.seo?.title ?? t.title;
  const description = t.seo?.description ?? t.description;
  return {
    title,
    description,
    keywords: [...t.keywords, ...(t.keywordsEn ?? []), t.titleEn],
    alternates: { canonical: `/tools/${t.slug}` },
    openGraph: { title: `${title} · Do Kits`, description, type: "website", locale: "ar" },
    twitter: { card: "summary", title: `${title} · Do Kits`, description },
  };
}

function ToolSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="جارٍ تحميل الأداة">
      <div className="h-11 animate-pulse rounded-s bg-surface2" />
      <div className="h-32 animate-pulse rounded-m bg-surface2" />
    </div>
  );
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = toolBySlug(TOOLS, slug);
  if (!tool || !isLive(tool)) notFound();

  track("view", tool.slug);

  const names = categoryNames();
  const catDef = categoryById(tool.category);
  const catName = names[tool.category] ?? catDef?.name ?? tool.category;
  const subName = subcategoryName(tool.category, tool.subcategory);
  const related = relatedTools(TOOLS, tool);
  const { default: Tool } = await tool.load();

  return (
    <div className="flex flex-col gap-7 pt-10">
      <nav className="flex flex-wrap items-center gap-2 text-[0.88rem] text-muted" aria-label="مسار">
        <Link href="/" className="hover:text-primary">الأدوات</Link>
        <span aria-hidden="true">‹</span>
        <Link href={`/?cat=${tool.category}`} className="hover:text-primary">{catName}</Link>
        {subName && (<><span aria-hidden="true">‹</span><span>{subName}</span></>)}
      </nav>

      <header className="flex items-start gap-3.5">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
          <NamedIcon name={tool.icon} size={24} />
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">{tool.title}</h1>
          <p className="text-[0.92rem] text-muted">{tool.description}</p>
        </div>
      </header>

      <div className="card p-5 sm:p-6">
        <ToolFrame slug={tool.slug} title={tool.title} instructions={tool.instructions} printable={tool.printable}>
          <Suspense fallback={<ToolSkeleton />}>
            <Tool />
          </Suspense>
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
              <Link key={r.slug} href={`/tools/${r.slug}`} className="card flex items-start gap-3 p-3.5 hover:border-primary">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                  <NamedIcon name={r.icon} size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-ink">{r.title}</span>
                  <span className="block text-[0.84rem] leading-snug text-muted">{r.description}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <p className="border-t border-line pt-4 text-[0.82rem] text-muted">
        تعمل هذه الأداةُ في متصفّحك — لا يُرسَل ما تُدخله إلى الخادم.
        <span className="mx-2">·</span>
        <span dir="ltr" className="font-mono">v{tool.version}</span>
      </p>
    </div>
  );
}
