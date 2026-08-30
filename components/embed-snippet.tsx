"use client";

import { useState } from "react";
import { CopyButton } from "@/components/tool-kit";
import { dict, type Lang } from "@/lib/i18n";

/**
 * سطرا التضمين: إطارٌ واحدٌ وسكربتٌ يكبّره.
 * والسكربتُ يوضع مرّةً واحدةً في الصفحة مهما تعدّدت الأدوات المضمَّنة فيها.
 */
export function EmbedSnippet({ base, slug, title, lang = "ar" }: {
  base: string; slug: string; title: string; lang?: Lang;
}) {
  const t = dict(lang).tool;
  const en = lang === "en";
  const [open, setOpen] = useState(false);
  const code =
    `<iframe src="${base}${en ? "/en" : ""}/embed/${slug}" title="${title} — Do Kits"\n` +
    `        style="width:100%;height:520px;border:1px solid #e5e7eb;border-radius:12px"\n` +
    `        loading="lazy"></iframe>\n` +
    `<script src="${base}/embed.js" async></script>`;

  return (
    <section className="rounded-m border border-line bg-surface2 px-5 py-4">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 text-start"
      >
        <span className="font-bold text-ink">{t.embedTitle}</span>
        <span className="text-[0.86rem] text-muted">{t.embedLede}</span>
        <span aria-hidden="true" className="ms-auto text-muted">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-2.5">
          <p className="text-[0.86rem] leading-relaxed text-muted">
            {en
              ? "Paste both lines into your page — WordPress, Wix or plain HTML, it makes no difference. The frame sizes itself, and the computation stays in your visitor's browser: not on your server, and not on ours."
              : "ألصق السطرين في صفحتك — ووردبريس أو ويكس أو HTML مباشر، لا فرق. الإطارُ يضبط ارتفاعَه تلقائيّاً، والحسابُ يبقى في متصفّح زائرك لا على خادمك ولا على خادمنا."}
          </p>
          <div className="rounded-s border border-line bg-surface p-3">
            <div className="mb-2 flex items-center">
              <span className="text-[0.76rem] font-bold text-primary">HTML</span>
              <span className="ms-auto"><CopyButton value={code} /></span>
            </div>
            <pre dir="ltr" className="overflow-x-auto text-[0.78rem] leading-relaxed"><code>{code}</code></pre>
          </div>
          <p className="text-[0.8rem] text-muted">{t.embedNote}</p>
        </div>
      )}
    </section>
  );
}
