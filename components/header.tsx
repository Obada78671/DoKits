import Link from "next/link";
import { getUser } from "@/lib/auth";
import { signOutAction } from "@/lib/actions";
import { LogoMark } from "@/components/icons";
import { dict, other, path, type Lang } from "@/lib/i18n";

export async function Header({ lang = "ar" }: { lang?: Lang }) {
  const user = await getUser();
  const t = dict(lang);
  const p = (x: string) => path(lang, x);
  const alt = other(lang);
  return (
    <header className="border-b border-line bg-surface">
      {/* يلتفّ سطراً ثانياً على الشاشات الضيّقة — الشريطُ الكامل لا يتّسع لـ375px */}
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:gap-x-4 sm:px-5">
        <Link href={p("/")} className="flex items-center gap-2.5 no-underline">
          <LogoMark size={32} />
          <span dir="ltr" className="text-xl font-bold tracking-tight text-ink">
            Do <span className="text-primary">Kits</span>
          </span>
        </Link>
        <nav className="me-auto flex items-center gap-2 text-[0.92rem]">
          <Link href={p("/tools")} className="btn btn-ghost !py-1.5">{t.nav.tools}</Link>
          <Link href={p("/my")} className="btn btn-ghost !py-1.5">{t.nav.board}</Link>
          {user?.role === "admin" && (
            <Link href="/admin/categories" className="btn btn-ghost !py-1.5">التصنيفات</Link>
          )}
        </nav>
        {/* مبدّلُ اللغة رابطٌ حقيقيّ: يُفهرَس ويُشارَك ويعمل بلا سكربت */}
        <Link
          href={path(alt, "/")}
          hrefLang={alt}
          className="btn btn-ghost !py-1.5 !text-[0.84rem]"
          title={t.langName[alt]}
        >
          {t.switchTo}
        </Link>
        {user ? (
          <div className="flex items-center gap-2">
            <Link href={p("/account")} className="btn btn-ghost !py-1.5">
              {user.username}
            </Link>
            <form action={signOutAction}>
              <button className="btn btn-ghost !py-1.5 text-muted">{lang === "ar" ? "خروج" : "Sign out"}</button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href={p("/login")} className="btn btn-ghost !py-1.5">{t.nav.signIn}</Link>
            <Link href={p("/register")} className="btn btn-accent !py-1.5">{t.nav.signUp}</Link>
          </div>
        )}
      </div>
    </header>
  );
}
