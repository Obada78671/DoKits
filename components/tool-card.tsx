"use client";

import Link from "next/link";
import { useTransition } from "react";
import { NamedIcon, StarIcon } from "@/components/icons";
import { toggleFavoriteAction } from "@/lib/actions";

export type CardTool = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  categoryName: string;
  subName?: string;
  fav: boolean;
};

export function ToolCard({ tool, loggedIn, onLocalFav }: {
  tool: CardTool;
  loggedIn: boolean;
  onLocalFav?: (slug: string) => void;
}) {
  const [, start] = useTransition();

  const toggle = () => {
    if (loggedIn) start(() => { void toggleFavoriteAction(tool.slug); });
    else onLocalFav?.(tool.slug);
  };

  return (
    <div className="card flex items-start gap-3.5 p-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
        <NamedIcon name={tool.icon} size={22} />
      </span>
      <div className="min-w-0">
        <div className="text-[0.72rem] font-bold text-primary">
          {tool.categoryName}{tool.subName ? ` · ${tool.subName}` : ""}
        </div>
        <Link href={`/tools/${tool.slug}`} className="font-bold text-ink hover:text-primary">
          {tool.title}
        </Link>
        <p className="text-[0.86rem] leading-relaxed text-muted">{tool.description}</p>
      </div>
      <button
        className={`ms-auto shrink-0 ${tool.fav ? "text-accent" : "text-muted hover:text-accent"}`}
        aria-label={tool.fav ? "إزالة من المفضّلة" : "إضافة إلى المفضّلة"}
        aria-pressed={tool.fav}
        onClick={toggle}
      >
        <StarIcon size={19} filled={tool.fav} />
      </button>
    </div>
  );
}
