"use client";

import { useEffect } from "react";

/**
 * يبلّغ الصفحةَ المضيفةَ بارتفاعه كلّما تغيّر، فيكبر الإطارُ ويصغر معه.
 *
 * الرسالةُ موسومةٌ بـ`dokits:height` كي يتجاهلها كلُّ مستمعٍ آخرَ على الصفحة،
 * والوجهةُ `*` لأنّ المضيفَ مجهولٌ بطبيعته — ولا ضيرَ: الرسالةُ رقمُ ارتفاعٍ
 * لا بيانَ مستخدمٍ فيه، ولا نستقبل من المضيف شيئاً إطلاقاً.
 */
export function EmbedHeight() {
  useEffect(() => {
    if (window.parent === window) return;
    let last = 0;
    const send = () => {
      const h = Math.ceil(document.documentElement.scrollHeight);
      if (h === last) return;
      last = h;
      window.parent.postMessage({ type: "dokits:height", height: h, path: location.pathname }, "*");
    };
    send();
    const ro = new ResizeObserver(send);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, []);
  return null;
}
