import Link from "next/link";
import { CATEGORIES, TOOLS, categoryCounts, publishedTools, toListings, type ToolListing } from "@/tools";
import { TASKS, WORKFLOWS } from "@/tools/tasks";
import { categoryNames, favoriteSlugs, popularity, recentTools } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { IntentSearch } from "@/components/intent-search";
import { ResumeSection, SuggestionsSection } from "@/components/home-sections";
import { NamedIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

/** سببُ الاقتراح يُحسب على الخادم كي يظهر للمستخدم صريحاً */
function suggest(tools: ToolListing[], views: Record<string, number>, favs: Set<string>) {
  const counts = categoryCounts(tools);
  // ترتيبُ السجلّ هو ترتيبُ الإضافة، فآخرُه أحدثُه
  const newest = [...tools].reverse().slice(0, 8);
  const bySlug = new Map(tools.map((t) => [t.slug, t]));
  const out: { tool: ToolListing; reason: string }[] = [];
  const taken = new Set<string>();

  const push = (slug: string, reason: string) => {
    const t = bySlug.get(slug);
    if (t && !taken.has(slug) && out.length < 6) { out.push({ tool: t, reason }); taken.add(slug); }
  };

  // آخرُ أيّام الشهر: موسمُ الفواتير والأجور
  const day = new Date().getDate();
  if (day >= 24) {
    push("invoice", "قربَ نهاية الشهر — موسمُ الفواتير");
    push("timesheet", "قربَ نهاية الشهر — حسابُ الأجور");
  }
  for (const s of [...favs].slice(0, 2)) push(s, "من مفضّلتك");
  for (const [slug] of Object.entries(views).sort((a, b) => b[1] - a[1])) push(slug, "أداةٌ شائعةٌ بين المستخدمين");
  for (const t of tools) push(t.slug, "أضيفت حديثاً إلى الحقيبة");
  return out;
}

export default async function HomePage() {
  const user = await getUser();
  const tools = toListings(publishedTools(TOOLS));
  const names = categoryNames();
  const views = popularity();
  const favs = new Set(user ? favoriteSlugs(user.id) : []);
  const serverRecent = user
    ? recentTools(user.id, 4).map((r) => ({ slug: r.tool_slug, at: r.used_at * 1000 }))
    : [];

  const counts = categoryCounts(tools);
  // ترتيبُ السجلّ هو ترتيبُ الإضافة، فآخرُه أحدثُه
  const newest = [...tools].reverse().slice(0, 8);
  const bySlug = new Map(tools.map((t) => [t.slug, t]));

  return (
    <div className="flex flex-col gap-10 pb-4 pt-10">
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold sm:text-4xl">ماذا تريد أن تنجز اليوم؟</h1>
        <p className="max-w-[54ch] text-muted">
          اكتب ما تريده بكلماتك — لا يلزمك أن تعرف اسمَ الأداة. و{tools.length} أداةً هنا
          تعمل كلُّها في متصفّحك، بلا تسجيلٍ ولا إعلانات.
        </p>
        <IntentSearch tools={tools} popularity={views} />
      </section>

      {/* شريطُ أرقامٍ صادق: كلُّ رقمٍ منها مشتقٌّ من السجلّ لا مكتوبٌ بيد */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { n: String(tools.length), l: "أداةٌ جاهزة" },
          { n: String(CATEGORIES.length), l: "تصنيفاً" },
          { n: "١٠٠٪", l: "في متصفّحك" },
          { n: "بلا", l: "تسجيلٍ ولا إعلانات" },
        ].map((s) => (
          <div key={s.l} className="rounded-m border border-line bg-surface px-3 py-3.5 text-center">
            <div className="font-mono text-2xl font-medium tabular-nums text-primary">{s.n}</div>
            <div className="mt-0.5 text-[0.78rem] leading-tight text-muted">{s.l}</div>
          </div>
        ))}
      </section>

      <ResumeSection tools={tools} serverRecent={serverRecent} />

      <section>
        <h2 className="mb-1 text-lg font-bold">ابدأ من مهمّة</h2>
        <p className="mb-3 text-[0.9rem] text-muted">اختر هدفَك، ونحن نجمع لك الأدوات.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TASKS.map((task) => (
            <div key={task.id} className="card flex flex-col gap-3 p-4">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent-soft text-ink">
                  <NamedIcon name={task.icon} size={20} />
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-ink">{task.title}</p>
                  <p className="text-[0.84rem] leading-snug text-muted">{task.blurb}</p>
                </div>
              </div>
              <div className="mt-auto flex flex-wrap gap-1.5">
                {task.tools.map((slug) => {
                  const t = bySlug.get(slug);
                  return t ? (
                    <Link key={slug} href={t.route}
                          className="rounded-full border border-line px-2.5 py-1 text-[0.78rem] text-muted hover:border-primary hover:text-primary">
                      {t.title.ar}
                    </Link>
                  ) : null;
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-lg font-bold">لا تعرف من أين تبدأ؟</h2>
        <p className="mb-3 text-[0.9rem] text-muted">مساراتٌ جاهزةٌ تأخذك خطوةً خطوة من البداية إلى المستند.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {WORKFLOWS.map((w) => (
            <Link key={w.id} href={`/workflows/${w.id}`} className="card flex items-start gap-3 p-4 hover:border-primary">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                <NamedIcon name={w.icon} size={20} />
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-ink">{w.title}</span>
                <span className="block text-[0.84rem] leading-snug text-muted">{w.blurb}</span>
                <span className="mt-1 block text-[0.76rem] text-primary">{w.steps.length} خطوات ←</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-lg font-bold">تصفّح بالاختصاص</h2>
        <p className="mb-3 text-[0.9rem] text-muted">العددُ إلى جانب كلّ تصنيفٍ مشتقٌّ من السجلّ، فلا يتقادم.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {counts.filter((c) => c.count > 0).map((c) => {
            const def = CATEGORIES.find((x) => x.id === c.id)!;
            return (
              <Link key={c.id} href={`/category/${c.id}`} className="card flex items-start gap-3 p-4 hover:border-primary">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                  <NamedIcon name={def.icon} size={20} />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-ink">{names[c.id] ?? c.name}</span>
                  <span className="block text-[0.84rem] leading-snug text-muted">{def.blurb}</span>
                  <span className="mt-1 block text-[0.76rem] text-primary">{c.count} أدوات ←</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-lg font-bold">أحدثُ ما أُضيف</h2>
        <p className="mb-3 text-[0.9rem] text-muted">آخرُ ثماني أدواتٍ دخلت الحقيبة.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {newest.map((t) => (
            <Link key={t.slug} href={t.route} className="card flex items-start gap-3 p-3.5 hover:border-primary">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-ink">
                <NamedIcon name={t.icon} size={18} />
              </span>
              <span className="min-w-0">
                <span className="block font-bold text-ink">{t.title.ar}</span>
                <span className="block text-[0.84rem] leading-snug text-muted">{t.description.ar}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <SuggestionsSection suggestions={suggest(tools, views, favs)} />

      <section className="rounded-l border border-line bg-surface2 px-5 py-4">
        <p className="text-[0.92rem] text-muted">
          تبحث عن أداةٍ بعينها؟{" "}
          <Link href="/tools" className="font-medium text-primary">افتح الدليل الكامل</Link>
          <span className="mx-2">·</span>
          أو اضغط{" "}
          <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[0.75rem]" dir="ltr">Ctrl K</kbd>
          {" "}في أيّ صفحة.
          <span className="mx-2">·</span>
          {Object.keys(names).length} تصنيفات.
        </p>
      </section>
    </div>
  );
}
