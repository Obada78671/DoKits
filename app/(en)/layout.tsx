import type { Metadata } from "next";
import "../globals.css";
import { Header } from "@/components/header";
import { dict } from "@/lib/i18n";

export const metadata: Metadata = {
  title: { default: "Do Kits — tools that run in your browser", template: "%s · Do Kits" },
  description: "Calculators, converters and generators that run entirely in your browser. No sign-up, no uploads, no ads.",
  metadataBase: new URL(process.env.SITE_URL ?? "https://dokits.net"),
  alternates: { canonical: "/en", languages: { ar: "/", en: "/en" } },
};

/**
 * مخطّطٌ جذريٌّ ثالث: `lang` و`dir` لا يمكن أن يتبدّلا داخل مخطّطٍ واحد،
 * فالعربيّةُ والإنجليزيّةُ مخطّطان لا صفحتان بمفتاحٍ مشترك.
 */
export default function EnLayout({ children }: { children: React.ReactNode }) {
  const t = dict("en");
  return (
    <html lang="en" dir="ltr">
      <body className="flex min-h-dvh flex-col antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded-s focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-ink">
          Skip to content
        </a>
        <Header lang="en" />
        <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-5 pb-16">{children}</main>
        <footer className="border-t border-line py-5 text-center text-[0.82rem] text-muted print:hidden">
          <span dir="ltr" className="font-mono">Do Kits · v{process.env.APP_VERSION ?? "dev"}</span>
          <span className="mx-2">·</span>
          {t.footer.local}
        </footer>
      </body>
    </html>
  );
}
