import type { Metadata } from "next";
import "../globals.css";

/**
 * مخطّطٌ جذريٌّ ثانٍ للتضمين: بلا ترويسةٍ ولا تذييلٍ ولا لوحةِ أوامر.
 *
 * ولا يقرأ الجلسةَ ولا يعرض حالةَ دخول. وهذا شرطُ سلامةٍ لا تبسيطُ شكل:
 * الصفحةُ تُؤطَّر في مواقعِ الآخرين، فلو حملت فعلاً موثَّقاً لأمكن خداعُ
 * المستخدم بالنقر عليه (clickjacking). فلمّا كانت بلا هويّةٍ وبلا فعلٍ
 * يغيّر شيئاً، لم يبقَ في التأطير ما يُستغلّ.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased">{children}</body>
    </html>
  );
}
