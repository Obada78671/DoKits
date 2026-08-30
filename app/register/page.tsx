import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { RegisterForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "إنشاء حساب" };

export default async function RegisterPage() {
  if (await getUser()) redirect("/");
  return (
    <div className="mx-auto w-full max-w-md pt-14">
      <h1 className="mb-1.5 text-2xl font-bold">حسابك في الحقيبة</h1>
      <p className="mb-6 text-[0.92rem] text-muted">به تحفظ مفضّلتك — ولا بريدَ تحقّقٍ ولا إزعاج.</p>
      <div className="card p-6">
        <RegisterForm />
      </div>
      <p className="mt-4 text-center text-[0.9rem] text-muted">
        عندك حساب؟ <Link href="/login" className="font-medium text-primary">ادخل</Link>
      </p>
    </div>
  );
}
