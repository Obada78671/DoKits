"use client";

import {
  Component, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from "react";

/**
 * إطارُ الأداة: يوحّد الأزرارَ والحالات دون أن يعرف شيئاً عن منطق أيّ أداة.
 *
 * الأداةُ **تسجّل** ما تدعمه (`useToolActions`)، والإطارُ يعرض ما سُجِّل فقط —
 * فلا زرَّ تنزيلٍ في أداةٍ لا تنزّل شيئاً، ولا تكرارَ لزرّ النسخ في كلّ أداة.
 */

export type ToolActions = {
  /** النصُّ الذي ينسخه زرُّ «نسخ» */
  getCopyText?: () => string;
  /** إعادةُ الأداة إلى حالتها الأولى */
  reset?: () => void;
  /** ملفٌّ ينزّله المستخدم */
  getDownload?: () => { filename: string; text: string; mime?: string } | null;
  /** يفعّل زرَّ الطباعة */
  printable?: boolean;
  /** نصٌّ يُشارَك مع الرابط */
  getShareText?: () => string;
};

type Ctx = { register: (a: ToolActions) => void };
const ToolCtx = createContext<Ctx | null>(null);

/** تستدعيها الأداةُ مرّةً لتعلن ما تدعمه من أفعال */
export function useToolActions(actions: ToolActions, deps: unknown[] = []) {
  const ctx = useContext(ToolCtx);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memo = useMemo(() => actions, deps);
  useEffect(() => {
    ctx?.register(memo);
  }, [ctx, memo]);
}

function ActionBar({
  actions, toolTitle, onReset, printable,
}: { actions: ToolActions; toolTitle: string; onReset: () => void; printable: boolean }) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const copy = async () => {
    const text = actions.getCopyText?.() ?? "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* الحافظة قد تُمنع */ }
  };

  const download = () => {
    const f = actions.getDownload?.();
    if (!f) return;
    const blob = new Blob([f.text], { type: f.mime ?? "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = f.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const share = async () => {
    const text = actions.getShareText?.() ?? toolTitle;
    const url = typeof location !== "undefined" ? location.href : "";
    try {
      if (navigator.share) await navigator.share({ title: toolTitle, text, url });
      else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch { /* أُلغيت المشاركة */ }
  };

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      {actions.getCopyText && (
        <button className="btn btn-ghost !py-1.5" onClick={copy}>{copied ? "نُسخ ✓" : "نسخ"}</button>
      )}
      {/* إعادةُ التعيين متاحةٌ لكلّ أداة: الأداةُ تُعيد تركيبَ نفسها ما لم تعرّف أفضلَ منها */}
      <button className="btn btn-ghost !py-1.5" onClick={actions.reset ?? onReset}>إعادة تعيين</button>
      {(printable || actions.printable) && (
        <button className="btn btn-ghost !py-1.5" onClick={() => window.print()}>طباعة</button>
      )}
      {actions.getDownload && (
        <button className="btn btn-ghost !py-1.5" onClick={download}>تنزيل</button>
      )}
      <button className="btn btn-ghost !py-1.5" onClick={share}>{shared ? "نُسخ الرابط ✓" : "مشاركة"}</button>
    </div>
  );
}

/** يمنع خطأً في أداةٍ واحدةٍ من إسقاط الصفحة كلّها */
class ToolErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="rounded-m border border-danger/40 bg-danger/10 p-5">
          <p className="font-bold text-ink">تعثّرت الأداة</p>
          <p className="mt-1 text-[0.9rem] text-muted">
            حدث خطأٌ غيرُ متوقّع. أعِد تحميلَ الصفحة — وإن تكرّر فالخللُ في الأداة لا في مُدخلك.
          </p>
          <button className="btn btn-ghost mt-3" onClick={() => location.reload()}>إعادة التحميل</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ToolFrame({
  slug, title, instructions, printable = false, children,
}: { slug: string; title: string; instructions?: string; printable?: boolean; children: ReactNode }) {
  const [actions, setActions] = useState<ToolActions>({});
  const [resetKey, setResetKey] = useState(0);
  const seen = useRef(false);

  const register = useCallback((a: ToolActions) => setActions(a), []);
  const ctx = useMemo(() => ({ register }), [register]);

  // سجلُّ الاستخدام: محلّيٌّ دائماً، ويُزامَن للمستخدم المسجَّل — مرّةً لكلّ فتحة
  useEffect(() => {
    if (seen.current) return;
    seen.current = true;
    void import("@/lib/storage").then((m) => m.pushRecent(slug, Date.now()));
    void import("@/lib/actions").then((m) => m.recordUsageAction(slug).catch(() => {}));
  }, [slug]);

  return (
    <ToolCtx.Provider value={ctx}>
      <section className="flex flex-col gap-4">
        {instructions && (
          <p className="rounded-s border border-line bg-surface2 px-4 py-2.5 text-[0.9rem] text-muted">
            {instructions}
          </p>
        )}
        <ActionBar
          actions={actions}
          toolTitle={title}
          printable={printable}
          onReset={() => { setActions({}); setResetKey((k) => k + 1); }}
        />
        <ToolErrorBoundary key={resetKey}>{children}</ToolErrorBoundary>
      </section>
    </ToolCtx.Provider>
  );
}
