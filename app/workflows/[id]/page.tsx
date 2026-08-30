import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TOOLS, publishedTools, summarizeAll } from "@/tools";
import { WORKFLOWS, workflowById } from "@/tools/tasks";
import { NamedIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const w = workflowById(id);
  if (!w) return { title: "مسار غير موجود" };
  return {
    title: w.title,
    description: `${w.blurb} مسارٌ من ${w.steps.length} خطواتٍ بأدوات Do Kits.`,
    alternates: { canonical: `/workflows/${id}` },
  };
}

export function generateStaticParams() {
  return WORKFLOWS.map((w) => ({ id: w.id }));
}

export default async function WorkflowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const w = workflowById(id);
  if (!w) notFound();

  const bySlug = new Map(summarizeAll(publishedTools(TOOLS)).map((t) => [t.slug, t]));

  return (
    <div className="flex flex-col gap-7 pt-10">
      <nav className="flex items-center gap-2 text-[0.88rem] text-muted" aria-label="مسار">
        <Link href="/" className="hover:text-primary">الأدوات</Link>
        <span aria-hidden="true">‹</span>
        <span>مسارُ إنجاز</span>
      </nav>

      <header className="flex items-start gap-3.5">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
          <NamedIcon name={w.icon} size={24} />
        </span>
        <div>
          <h1 className="text-2xl font-bold">{w.title}</h1>
          <p className="text-[0.92rem] text-muted">{w.blurb}</p>
        </div>
      </header>

      <ol className="flex flex-col gap-3">
        {w.steps.map((step, i) => {
          const t = bySlug.get(step.toolSlug);
          if (!t) return null;
          return (
            <li key={step.toolSlug} className="card flex flex-wrap items-start gap-4 p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-accent-ink font-mono font-bold">
                {i + 1}
              </span>
              <div className="min-w-48 flex-1">
                <p className="font-bold text-ink">{t.title.ar}</p>
                <p className="text-[0.9rem] leading-relaxed text-muted">{step.goal}</p>
                {step.carry && (
                  <p className="mt-1.5 text-[0.8rem] text-muted">
                    تحمل معك إلى الخطوة التالية: <span className="font-medium text-ink">{step.carry}</span>
                  </p>
                )}
              </div>
              <Link href={t.route} className="btn btn-primary self-center">افتح الأداة</Link>
            </li>
          );
        })}
      </ol>

      <p className="rounded-m border border-line bg-surface2 px-5 py-4 text-[0.88rem] leading-relaxed text-muted">
        الخطواتُ مستقلّة: افتح ما تحتاجه وتجاوز الباقي. ولا تنتقل قيمةٌ بين الأدوات تلقائيّاً —
        <b className="font-semibold text-ink"> انسخ ما تحتاجه بنفسك</b>، فلا شيءَ من حسابك يغادر جهازك دون أن تختار.
      </p>
    </div>
  );
}
