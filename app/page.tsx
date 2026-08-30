import { listCategories, listEnabledTools } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { HomeExplorer } from "@/components/home-explorer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getUser();
  const categories = listCategories();
  const tools = listEnabledTools(user?.id);

  return (
    <div className="flex flex-col gap-7 pt-10">
      <section>
        <h1 className="text-3xl font-bold">حقيبةُ أدواتٍ تُنجِز</h1>
        <p className="mt-1.5 max-w-[52ch] text-muted">
          أدواتُ عملٍ صغيرةٌ نافعة، مصنّفةٌ حسب الاختصاص — تعمل كلُّها هنا، بلا تثبيتٍ ولا إعلانات.
        </p>
      </section>
      <HomeExplorer categories={categories} tools={tools} loggedIn={!!user} />
    </div>
  );
}
