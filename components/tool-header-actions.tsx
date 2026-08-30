"use client";

import { useEffect, useState, useTransition } from "react";
import { StarIcon } from "@/components/icons";
import { toggleFavoriteAction } from "@/lib/actions";
import { getLocalFavorites, toggleLocalFavorite } from "@/lib/storage";

/**
 * التفضيلُ من صفحة الأداة نفسِها.
 *
 * كانت المفضّلةُ تُبنى من الدليل وحدَه، والزائرُ يصل الأداةَ من محرّك بحثٍ
 * فلا يجد سبيلاً إلى حفظها إلّا بالرجوع إلى القائمة — وهو ما لا يفعله أحد.
 * وبلا حسابٍ تُحفظ محلّيّاً في الجهاز، وتُدمَج في الحساب عند أوّل دخول.
 */
export function ToolFavorite({ slug, initial, loggedIn }: {
  slug: string; initial: boolean; loggedIn: boolean;
}) {
  const [fav, setFav] = useState(initial);
  const [, start] = useTransition();

  useEffect(() => {
    if (loggedIn) return;
    void getLocalFavorites().then((list) => setFav(list.includes(slug)));
  }, [loggedIn, slug]);

  const toggle = () => {
    setFav((v) => !v);
    if (loggedIn) start(() => { void toggleFavoriteAction(slug); });
    else void toggleLocalFavorite(slug);
  };

  return (
    <button
      onClick={toggle}
      aria-pressed={fav}
      className={`btn ${fav ? "btn-primary" : "btn-ghost"} !px-3`}
      title={fav ? "أزلها من المفضّلة" : "أضفها إلى المفضّلة"}
    >
      <StarIcon size={16} filled={fav} />
      <span className="ms-1.5 text-[0.84rem]">{fav ? "في المفضّلة" : "فضّلها"}</span>
    </button>
  );
}
