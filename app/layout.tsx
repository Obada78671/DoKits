import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: { default: "Do Kits — حقيبةُ أدواتٍ تُنجِز", template: "%s · Do Kits" },
  description: "أدواتُ عملٍ عربيّةٌ متفرّقة، بهويّةٍ واحدة.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="flex min-h-dvh flex-col antialiased">
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-16">{children}</main>
        <footer className="border-t border-line py-5 text-center text-[0.82rem] text-muted">
          <span dir="ltr" className="font-mono">
            Do Kits · v{process.env.APP_VERSION ?? "dev"}
          </span>
          <span className="mx-2">·</span>
          من عائلة Do
        </footer>
      </body>
    </html>
  );
}
