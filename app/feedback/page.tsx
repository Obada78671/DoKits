import type { Metadata } from "next";
import Link from "next/link";
import { TOOLS, toolBySlug } from "@/tools";

export const metadata: Metadata = { title: "ملاحظة أو اقتراح", robots: { index: false } };

export default async function FeedbackPage({
  searchParams,
}: { searchParams: Promise<{ tool?: string }> }) {
  const { tool: slug } = await searchParams;
  const tool = slug ? toolBySlug(TOOLS, slug) : undefined;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5 pt-12">
      <h1 className="text-2xl font-bold">ملاحظةٌ أو اقتراح</h1>
      {tool && (
        <p className="text-muted">
          عن أداة <Link href={tool.route} className="font-medium text-primary">{tool.title.ar}</Link>
          <span dir="ltr" className="mx-2 font-mono text-[0.85rem]">v{tool.version}</span>
        </p>
      )}

      <div className="card flex flex-col gap-3 p-6">
        <p className="leading-relaxed">
          نظامُ الملاحظات داخل الموقع لم يُبنَ بعد — وأفضّل أن أقول ذلك على أن أعرض
          نموذجاً لا يصل إلى أحد.
        </p>
        <p className="text-[0.92rem] leading-relaxed text-muted">
          حتّى ذلك الحين، أرسل ملاحظتَك مباشرةً وأذكر معها اسمَ الأداة وما توقّعتَه وما حدث.
          الأمثلةُ الرقميّةُ الدقيقةُ تختصر الطريقَ إلى الإصلاح.
        </p>
      </div>

      <Link href={tool ? tool.route : "/"} className="btn btn-ghost self-start">
        {tool ? "العودة إلى الأداة" : "العودة إلى الأدوات"}
      </Link>
    </div>
  );
}
