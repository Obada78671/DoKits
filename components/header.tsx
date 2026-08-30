import Link from "next/link";
import { getUser } from "@/lib/auth";
import { signOutAction } from "@/lib/actions";
import { LogoMark } from "@/components/icons";

export async function Header() {
  const user = await getUser();
  return (
    <header className="border-b border-line bg-surface">
      {/* يلتفّ سطراً ثانياً على الشاشات الضيّقة — الشريطُ الكامل لا يتّسع لـ375px */}
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:gap-x-4 sm:px-5">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <LogoMark size={32} />
          <span dir="ltr" className="text-xl font-bold tracking-tight text-ink">
            Do <span className="text-primary">Kits</span>
          </span>
        </Link>
        <nav className="me-auto flex items-center gap-2 text-[0.92rem]">
          <Link href="/tools" className="btn btn-ghost !py-1.5">الدليل</Link>
          <Link href="/my" className="btn btn-ghost !py-1.5">لوحتي</Link>
          {user?.role === "admin" && (
            <Link href="/admin/categories" className="btn btn-ghost !py-1.5">التصنيفات</Link>
          )}
        </nav>
        {user ? (
          <div className="flex items-center gap-2">
            <Link href="/account" className="btn btn-ghost !py-1.5">
              {user.username}
            </Link>
            <form action={signOutAction}>
              <button className="btn btn-ghost !py-1.5 text-muted">خروج</button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn btn-ghost !py-1.5">دخول</Link>
            <Link href="/register" className="btn btn-accent !py-1.5">إنشاء حساب</Link>
          </div>
        )}
      </div>
    </header>
  );
}
