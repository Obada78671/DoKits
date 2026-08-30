import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { CommandPalette } from "@/components/command-palette";
import { TOOLS, publishedTools, summarizeAll } from "@/tools";

export const metadata: Metadata = {
  title: { default: "Do Kits — ماذا تريد أن تنجز اليوم؟", template: "%s · Do Kits" },
  description: "أدواتُ إنجازٍ عربيّةٌ تعمل في متصفّحك — اكتب ما تريده وتصل إلى النتيجة.",
  metadataBase: new URL(process.env.SITE_URL ?? "https://dokits.net"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const tools = summarizeAll(publishedTools(TOOLS));
  return (
    <html lang="ar" dir="rtl">
      <body className="flex min-h-dvh flex-col antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded-s focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-ink">
          تخطَّ إلى المحتوى
        </a>
        <Header />
        <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-5 pb-16">{children}</main>
        <footer className="border-t border-line py-5 text-center text-[0.82rem] text-muted print:hidden">
          <span dir="ltr" className="font-mono">Do Kits · v{process.env.APP_VERSION ?? "dev"}</span>
          <span className="mx-2">·</span>
          كلُّ الحساب في متصفّحك
        </footer>
        <CommandPalette tools={tools} />
      </body>
    </html>
  );
}
