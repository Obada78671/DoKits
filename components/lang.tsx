"use client";

import { createContext, useContext } from "react";
import type { Lang } from "@/lib/i18n";

/**
 * لغةُ الصفحة تصل إلى الأدوات بسياقٍ لا بخاصّيّةٍ تُمرَّر عبر كلّ طبقة.
 * والأداةُ تُعلن نصوصَها هي بجوار شيفرتها — فالنصُّ يُراجَع مع المنطق
 * الذي يشرحه، ولا يتقادم في ملفٍّ بعيدٍ لا يفتحه أحد.
 */
const LangCtx = createContext<Lang>("ar");

export const LangProvider = LangCtx.Provider;

export const useLang = (): Lang => useContext(LangCtx);

/** نصوصُ أداةٍ بلغتين — ترجع مجموعةَ اللغة الحاليّة */
export function useStrings<T extends Record<string, unknown>>(map: Record<Lang, T>): T {
  return map[useLang()] ?? map.ar;
}
