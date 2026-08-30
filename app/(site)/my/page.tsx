import type { Metadata } from "next";
import { TOOLS, publishedTools, toListings } from "@/tools";
import { categoryNames, favoriteSlugs, recentTools } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { MyTools } from "@/components/my-tools";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "لوحتي", robots: { index: false } };

export default async function MyPage() {
  const user = await getUser();
  return (
    <div className="flex flex-col gap-6 pt-10">
      <header>
        <h1 className="text-2xl font-bold">{user ? `أهلاً ${user.username}` : "لوحتي"}</h1>
        <p className="text-muted">مفضّلتُك وآخرُ ما استعملت — ومن حيث توقّفت.</p>
      </header>
      <MyTools
        tools={toListings(publishedTools(TOOLS))}
        categoryNames={categoryNames()}
        serverFavorites={user ? favoriteSlugs(user.id) : []}
        serverRecent={user ? recentTools(user.id).map((r) => ({ slug: r.tool_slug, at: r.used_at * 1000 })) : []}
        loggedIn={!!user}
      />
    </div>
  );
}
