import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { countSessions, getUser } from "@/lib/auth";
import { signOutAllAction } from "@/lib/actions";
import { ChangePasswordForm, RecoveryCodes } from "@/components/auth-forms";
import { countCodes } from "@/lib/recovery";

export const metadata: Metadata = { title: "حسابي" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ recovered?: string }> }) {
  const { recovered } = await searchParams;
  const user = await getUser();
  if (!user) redirect("/login");
  const sessions = countSessions(user.id);
  const codes = countCodes(user.id);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 pt-12">
      <div>
        <h1 className="text-2xl font-bold">حسابي</h1>
        <p className="text-muted">
          <span className="font-medium text-ink">{user.username}</span>
          <span className="mx-2">·</span>
          <span dir="ltr">{user.email}</span>
          {user.role === "admin" && <span className="ms-2 rounded-full bg-accent-soft px-2.5 py-0.5 text-[0.78rem] font-bold text-ink">مدير</span>}
        </p>
      </div>

      {recovered && (
        <p role="status" className="form-ok">
          استُعيد حسابُك وبُدّلت كلمةُ المرور، وأُنهيت كلُّ الجلسات الأخرى.
          ولّد مجموعةَ رموزٍ جديدةً الآن — فالرمزُ الذي استعملتَه بطل.
        </p>
      )}

      <section className="card p-6">
        <h2 className="mb-4 text-lg font-bold">تبديل كلمة المرور</h2>
        <ChangePasswordForm />
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-bold">رموزُ الاستعادة</h2>
        <p className="mb-4 mt-1 text-[0.9rem] leading-relaxed text-muted">
          لا بريدَ في هذا الخادم، فلا رابطَ استعادةٍ يُرسَل. هذه الرموزُ هي طريقُك الوحيدُ
          إلى حسابك إن نسيتَ كلمةَ المرور — احفظها حيث تحفظها.
        </p>
        <RecoveryCodes remaining={codes} />
      </section>

      <section className="card flex flex-wrap items-center justify-between gap-3 p-6">
        <div>
          <h2 className="text-lg font-bold">الجلسات المفتوحة</h2>
          <p className="text-[0.9rem] text-muted">لديك {sessions} {sessions === 1 ? "جلسة" : "جلسات"} صالحة على أجهزتك.</p>
        </div>
        <form action={signOutAllAction}>
          <button className="btn btn-danger">إنهاء كلّ الجلسات</button>
        </form>
      </section>
    </div>
  );
}
