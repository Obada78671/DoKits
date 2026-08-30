import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { RecoverForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "استعادة الحساب", robots: { index: false } };

export default async function RecoverPage() {
  if (await getUser()) redirect("/account");
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 pt-12">
      <div>
        <h1 className="text-2xl font-bold">استعادة الحساب</h1>
        <p className="text-muted">بأحد رموز الاستعادة التي حفظتَها من صفحة حسابك.</p>
      </div>

      <div className="card p-6"><RecoverForm /></div>

      <div className="rounded-m border border-line bg-surface2 px-5 py-4 text-[0.88rem] leading-relaxed text-muted">
        <p className="font-semibold text-ink">لا رموزَ لديك؟</p>
        <p className="mt-1">
          لا سبيلَ آليّاً إلى استعادة الحساب — فلا بريدَ في هذا الخادم، ولا نحتفظ بكلمتك ولا
          برموزك إلّا مجزّأةً لا تُقرأ. تواصل مع مالك الموقع ليصدر لك رمزاً بنفسه.
          وحسابُك هنا اختياريٌّ أصلاً: كلُّ الأدوات تعمل بلا تسجيل، والمفضّلةُ والمسودّاتُ
          تبقى في متصفّحك.
        </p>
      </div>

      <p className="text-center text-[0.9rem] text-muted">
        تذكّرتَها؟ <Link href="/login" className="font-medium text-primary">عُد إلى الدخول</Link>
      </p>
    </div>
  );
}
