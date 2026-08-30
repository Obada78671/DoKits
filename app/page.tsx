import { TOOLS, publishedTools, summarizeAll } from "@/tools";
import { categoryNames, favoriteSlugs, popularity } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { ToolBrowser } from "@/components/tool-browser";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: { searchParams: Promise<{ cat?: string }> }) {
  const user = await getUser();
  const { cat } = await searchParams;
  const tools = summarizeAll(publishedTools(TOOLS));

  return (
    <div className="flex flex-col gap-7 pt-10">
      <section>
        <h1 className="text-3xl font-bold">حقيبةُ أدواتٍ تُنجِز</h1>
        <p className="mt-1.5 max-w-[52ch] text-muted">
          {tools.length} أداةً عربيّةً مصنّفةً حسب الاختصاص — تعمل كلُّها في متصفّحك،
          بلا تثبيتٍ ولا إعلانات.
        </p>
      </section>
      <ToolBrowser
        tools={tools}
        categoryNames={categoryNames()}
        serverFavorites={user ? favoriteSlugs(user.id) : []}
        popularity={popularity()}
        loggedIn={!!user}
        initialCategory={cat}
      />
    </div>
  );
}
