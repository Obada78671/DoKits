import type { Metadata } from "next";
import { TOOLS, publishedTools, toListings } from "@/tools";
import { categoryNames, favoriteSlugs, popularity } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { ToolDirectory } from "@/components/tool-directory";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const n = toListings(publishedTools(TOOLS)).length;
  const description = `دليلُ ${n} أداةً عربيّةً مصنّفةً حسب الاختصاص — تصفية بالتصنيف والتعقيد والمزايا، وكلُّها تعمل في متصفّحك.`;
  return {
    title: "دليل الأدوات",
    description,
    alternates: { canonical: "/tools" },
    openGraph: { title: "دليل الأدوات · Do Kits", description, type: "website", locale: "ar" },
  };
}

export default async function ToolsDirectoryPage() {
  const user = await getUser();
  return (
    <div className="flex flex-col gap-6 pt-10">
      <header>
        <h1 className="text-3xl font-bold">دليل الأدوات</h1>
        <p className="mt-1.5 text-muted">صفِّ بالتصنيف والتعقيد والمزايا، ورتّب كما يناسبك.</p>
      </header>
      <ToolDirectory
        tools={toListings(publishedTools(TOOLS))}
        categoryNames={categoryNames()}
        serverFavorites={user ? favoriteSlugs(user.id) : []}
        popularity={popularity()}
        loggedIn={!!user}
      />
    </div>
  );
}
