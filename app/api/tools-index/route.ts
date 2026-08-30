import { TOOLS, publishedTools, toListings } from "@/tools";

/**
 * فهرسُ البحث لِلوحة الأوامر — يُطلَب مرّةً ويُخزَّن في المتصفّح.
 *
 * كان الفهرسُ يُسلسَل داخل كلّ صفحةٍ لأنّ اللوحةَ في المخطّط العامّ، فكانت
 * صفحةُ الدخول وحدَها تحمل ٦٥ ك.ب من بيانات أدواتٍ لا تُعرَض فيها. وهنا يصير
 * الفهرسُ ملفّاً واحداً مشتركاً بين كلّ صفحات الموقع.
 *
 * ووسمُ ETag مبنيٌّ على إصدار التطبيق: يتغيّر مع كلّ نشرٍ فيبطل المخزون،
 * ويبقى ثابتاً بينهما فلا يُعاد تنزيلُه.
 */
export const dynamic = "force-static";

export function GET() {
  const body = JSON.stringify(
    toListings(publishedTools(TOOLS)).map((t) => ({
      slug: t.slug,
      route: t.route,
      title: t.title,
      description: { ar: t.description.ar, en: "" },
      icon: t.icon,
      categoryId: t.categoryId,
      subcategoryId: t.subcategoryId,
      keywords: t.keywords,
      keywordsEn: t.keywordsEn,
      tags: t.tags,
      status: t.status,
    })),
  );
  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
      ETag: `"tools-${process.env.APP_VERSION ?? "dev"}"`,
    },
  });
}
