import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES, TOOLS, publishedTools, toListings } from "@/tools";
import { NamedIcon } from "@/components/icons";
import { dict } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tool directory",
  description: "Every Do Kits tool available in English — all running in your browser.",
  alternates: { canonical: "/en/tools", languages: { ar: "/tools", en: "/en/tools" } },
};

export default function EnDirectory() {
  const t = dict("en");
  const tools = toListings(publishedTools(TOOLS)).filter((x) => x.langs.includes("en"));
  const byCat = CATEGORIES
    .map((c) => ({ c, list: tools.filter((x) => x.categoryId === c.id) }))
    .filter((x) => x.list.length > 0);

  return (
    <div className="flex flex-col gap-8 pt-10">
      <header>
        <h1 className="text-3xl font-bold">{t.directory.title}</h1>
        <p className="mt-1.5 text-muted">{t.directory.lede(tools.length)}</p>
      </header>

      {byCat.map(({ c, list }) => (
        <section key={c.id}>
          <h2 className="mb-3 text-lg font-bold">{c.nameEn}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {list.map((x) => (
              <Link key={x.slug} href={`/en${x.route}`} className="card flex items-start gap-3 p-3.5 hover:border-primary">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                  <NamedIcon name={x.icon} size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-ink">{x.title.en}</span>
                  <span className="block text-[0.84rem] leading-snug text-muted">{x.description.en}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-l border border-line bg-surface2 px-5 py-4">
        <p className="text-[0.92rem] text-muted">
          More tools are translated as their interfaces settle.{" "}
          <Link href="/tools" hrefLang="ar" className="font-medium text-primary">
            The Arabic directory has {publishedTools(TOOLS).length} tools →
          </Link>
        </p>
      </section>
    </div>
  );
}
