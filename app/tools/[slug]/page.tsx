import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TOOLS } from "@/tools";
import { listCategories } from "@/lib/db";
import { NamedIcon } from "@/components/icons";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = TOOLS.find((x) => x.slug === slug);
  return { title: t ? t.nameAr : "غير موجود" };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const manifest = TOOLS.find((t) => t.slug === slug);
  if (!manifest) notFound();

  const category = listCategories().find((c) => c.slug === manifest.category);
  const { default: Tool } = await manifest.load();

  return (
    <div className="flex flex-col gap-6 pt-10">
      <nav className="flex items-center gap-2 text-[0.88rem] text-muted" aria-label="مسار">
        <Link href="/" className="hover:text-primary">الأدوات</Link>
        <span>‹</span>
        <span>{category?.name_ar ?? manifest.category}</span>
      </nav>
      <div className="flex items-center gap-3.5">
        <span className="grid size-12 place-items-center rounded-xl bg-primary-soft text-primary">
          <NamedIcon name={manifest.icon} size={24} />
        </span>
        <div>
          <h1 className="text-2xl font-bold">{manifest.nameAr}</h1>
          <p className="text-[0.9rem] text-muted">{manifest.descriptionAr}</p>
        </div>
      </div>
      <div className="card p-6">
        <Tool />
      </div>
    </div>
  );
}
