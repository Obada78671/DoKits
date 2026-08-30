import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 pt-24 text-center">
      <span className="inline-grid grid-cols-2 gap-1.5" aria-hidden="true">
        <i className="block size-7 rounded-lg bg-surface2" />
        <i className="block size-7 rounded-lg bg-surface2" />
        <i className="block size-7 rounded-lg bg-surface2" />
        <i className="block size-7 rounded-lg bg-accent" />
      </span>
      <h1 className="text-2xl font-bold">لا شيء هنا</h1>
      <p className="text-muted">الصفحة التي تقصدها ليست في الحقيبة.</p>
      <Link href="/" className="btn btn-primary">إلى الأدوات</Link>
    </div>
  );
}
