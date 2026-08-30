import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { LoginForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "دخول" };

export default async function LoginPage() {
  if (await getUser()) redirect("/");
  return (
    <div className="mx-auto w-full max-w-md pt-14">
      <h1 className="mb-6 text-2xl font-bold">أهلاً بعودتك</h1>
      <div className="card p-6">
        <LoginForm />
      </div>
      <p className="mt-4 text-center text-[0.9rem] text-muted">
        <Link href="/recover" className="font-medium text-primary">نسيتُ كلمة المرور</Link>
      </p>
      <p className="mt-2 text-center text-[0.9rem] text-muted">
        ما عندك حساب؟ <Link href="/register" className="font-medium text-primary">أنشئه في دقيقة</Link>
      </p>
    </div>
  );
}
