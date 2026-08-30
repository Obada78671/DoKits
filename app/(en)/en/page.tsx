import Link from "next/link";
import { CATEGORIES, TOOLS, categoryCounts, publishedTools, toListings } from "@/tools";
import { popularity } from "@/lib/db";
import { IntentSearch } from "@/components/intent-search";
import { NamedIcon } from "@/components/icons";
import { dict } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default function EnHome() {
  const t = dict("en");
  // `/en` لا يعرض إلّا ما تُرجمت واجهتُه — لا نصفَ شاشةٍ عربيٍّ ونصفَها إنكليزيّ
  const tools = toListings(publishedTools(TOOLS)).filter((x) => x.langs.includes("en"));
  const counts = categoryCounts(tools);
  const views = popularity();

  return (
    <div className="flex flex-col gap-10 pb-4 pt-10">
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold sm:text-4xl">{t.home.title}</h1>
        <p className="max-w-[62ch] text-muted">{t.home.lede(tools.length)}</p>
        <IntentSearch tools={tools} popularity={views} lang="en" />
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { n: String(tools.length), l: t.home.stats.tools },
          { n: String(counts.filter((c) => c.count > 0).length), l: t.home.stats.categories },
          { n: t.home.stats.inBrowserValue, l: t.home.stats.inBrowser },
          { n: t.home.stats.noSignupValue, l: t.home.stats.noSignup },
        ].map((s) => (
          <div key={s.l} className="rounded-m border border-line bg-surface px-3 py-3.5 text-center">
            <div className="font-mono text-2xl font-medium tabular-nums text-primary">{s.n}</div>
            <div className="mt-0.5 text-[0.78rem] leading-tight text-muted">{s.l}</div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">{t.directory.title}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {tools.map((x) => (
            <Link key={x.slug} href={`/en${x.route}`} className="card flex items-start gap-3 p-3.5 hover:border-primary">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                <NamedIcon name={x.icon} size={20} />
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-ink">{x.title.en}</span>
                <span className="block text-[0.84rem] leading-snug text-muted">{x.description.en}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-l border border-line bg-surface2 px-5 py-4">
        <p className="text-[0.92rem] leading-relaxed text-muted">
          Do Kits is Arabic-first: every tool is written in Arabic and translated once its
          interface is mature, so an English page is never half Arabic.{" "}
          <Link href="/" className="font-medium text-primary" hrefLang="ar">
            The full Arabic kit has {publishedTools(TOOLS).length} tools →
          </Link>
        </p>
      </section>
    </div>
  );
}
