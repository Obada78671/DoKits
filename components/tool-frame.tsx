"use client";

import {
  Component, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  applyCarry, captureTool, isEmptySnapshot, putCarry, restoreTool, takeCarry,
  type Carry, type ToolSnapshot,
} from "@/lib/tool-state";
import { getDraft, setDraft } from "@/lib/storage";

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
  actions, toolTitle, onReset, printable, shareable, onSaveDraft, saved, onDemo,
}: {
  actions: ToolActions; toolTitle: string; onReset: () => void;
  printable: boolean; shareable: boolean; onSaveDraft: () => void; saved: boolean;
  onDemo?: () => void;
}) {
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
      {/* الحقلُ الفارغُ يُصمِت المستخدم — والمثالُ يريه الأداةَ عاملةً بنقرة */}
      {onDemo && (
        <button className="btn btn-ghost !py-1.5" onClick={onDemo}>املأ مثالاً</button>
      )}
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
      {shareable && (
        <button className="btn btn-ghost !py-1.5" onClick={share}>{shared ? "نُسخ الرابط ✓" : "مشاركة"}</button>
      )}
      {/* الحفظُ بفعلِ المستخدم لا تلقائيّاً: الوعدُ أنّ مدخلاتِه لا تُحفَظ ما لم يطلب */}
      <button className="btn btn-ghost !py-1.5" onClick={onSaveDraft} title="تُحفَظ في هذا الجهاز وحدَه">
        {saved ? "حُفظت ✓" : "احفظ مسودّة"}
      </button>
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

export type FrameNextStep = { slug: string; label: string; carry?: Record<string, string> };

type StoredDraft = { at: number; snap: ToolSnapshot };

const since = (at: number): string => {
  const m = Math.round((Date.now() - at) / 60000);
  if (m < 1) return "قبل لحظات";
  if (m < 60) return `قبل ${m} دقيقة`;
  const h = Math.round(m / 60);
  if (h < 24) return `قبل ${h} ساعة`;
  return `قبل ${Math.round(h / 24)} يوم`;
};

export type FrameCapabilities = {
  copyResult: boolean; print: boolean; exportPdf: boolean; exportCsv: boolean;
  saveDraft: boolean; share: boolean; offline: boolean;
};

export function ToolFrame({
  slug, title, instructions, capabilities, nextSteps, demo, children,
}: {
  slug: string; title: string; instructions?: string;
  capabilities?: FrameCapabilities; nextSteps?: FrameNextStep[];
  demo?: { fields: Record<string, string>; chips?: Record<string, number[]> }; children: ReactNode;
}) {
  const printable = capabilities?.print ?? false;
  const router = useRouter();
  const [actions, setActions] = useState<ToolActions>({});
  const [resetKey, setResetKey] = useState(0);
  const seen = useRef(false);
  const body = useRef<HTMLDivElement>(null);
  const [draft, setDraftState] = useState<StoredDraft | null>(null);
  const [saved, setSaved] = useState(false);
  const [carried, setCarried] = useState<string | null>(null);
  const pending = useRef<Carry | null>(null);
  const demoWanted = useRef(false);

  const register = useCallback((a: ToolActions) => setActions(a), []);
  const ctx = useMemo(() => ({ register }), [register]);

  // سجلُّ الاستخدام: محلّيٌّ دائماً، ويُزامَن للمستخدم المسجَّل — مرّةً لكلّ فتحة
  useEffect(() => {
    if (seen.current) return;
    seen.current = true;
    void import("@/lib/storage").then((m) => m.pushRecent(slug, Date.now()));
    void import("@/lib/actions").then((m) => m.recordUsageAction(slug).catch(() => {}));
  }, [slug]);

  // مسودّةٌ محفوظةٌ سابقاً؟ تُعرَض ولا تُطبَّق: الاستعادةُ بيد المستخدم
  useEffect(() => {
    void getDraft<StoredDraft>(slug).then((d) => { if (d?.snap) setDraftState(d); });
  }, [slug]);

  /**
   * قيمٌ منقولةٌ من أداةٍ سابقة — تُطبَّق فورَ الوصول لأنّ المستخدمَ طلبها بنقره.
   *
   * والقيمةُ المسحوبةُ تُحفَظ في مرجعٍ قبل الجدولة: React تُشغّل الأثرَ مرّتين
   * في التطوير وتنظّف بينهما، فلو اعتمدنا على sessionStorage وحدَها لألغى
   * التنظيفُ المؤقّتَ **بعد** أن استُهلكت القيمة — فتضيع بلا أثر.
   */
  useEffect(() => {
    const c: Carry | null = pending.current ?? takeCarry(slug);
    if (!c) return;
    pending.current = c;
    if (!body.current) return;
    const el = body.current;
    const t = setTimeout(() => {
      void applyCarry(el, c.fields).then((n) => {
        if (n > 0) setCarried(c.fromTitle);
        pending.current = null;
      });
    }, 60);
    return () => clearTimeout(t);
  }, [slug]);

  const saveDraft = async () => {
    if (!body.current) return;
    const snap = captureTool(body.current);
    const entry = { at: Date.now(), snap };
    await setDraft(slug, entry);
    setDraftState(entry);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fillDemo = useCallback(() => {
    if (!demo || !body.current) return;
    void restoreTool(body.current, { fields: demo.fields, chips: demo.chips ?? {} });
  }, [demo]);

  // وصل من البحث ضاغطاً «شاهد مثالاً» — نملأه فورَ الوصول (والعلمُ في مرجعٍ للسبب نفسِه)
  useEffect(() => {
    if (!demo) return;
    if (!demoWanted.current) {
      try {
        if (sessionStorage.getItem("dokits:demo") === slug) {
          demoWanted.current = true;
          sessionStorage.removeItem("dokits:demo");
        }
      } catch { /* محظور */ }
    }
    if (!demoWanted.current || !body.current) return;
    const t = setTimeout(() => { fillDemo(); demoWanted.current = false; }, 80);
    return () => clearTimeout(t);
  }, [slug, demo, fillDemo]);

  const goNext = (step: FrameNextStep) => {
    if (step.carry && body.current) {
      const snap = captureTool(body.current);
      const fields: Record<string, string> = {};
      for (const [from, to] of Object.entries(step.carry)) {
        const v = snap.fields[from];
        if (v !== undefined && v !== "") fields[to] = v;
      }
      if (Object.keys(fields).length) {
        putCarry({ to: step.slug, from: slug, fromTitle: title, fields });
      }
    }
    router.push(`/tools/${step.slug}`);
  };

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
          shareable={capabilities?.share ?? true}
          onReset={() => { setActions({}); setResetKey((k) => k + 1); }}
          onSaveDraft={saveDraft}
          saved={saved}
          onDemo={demo ? fillDemo : undefined}
        />

        {carried && (
          <p className="rounded-s border border-accent bg-accent-soft px-4 py-2.5 text-[0.88rem] text-ink">
            عُبِّئت الحقولُ ممّا أدخلتَه في <b className="font-semibold">{carried}</b> — راجعها قبل الاعتماد عليها.
          </p>
        )}

        {draft && !isEmptySnapshot(draft.snap) && (
          <div className="flex flex-wrap items-center gap-2 rounded-s border border-line bg-surface2 px-4 py-2.5 text-[0.88rem]">
            <span className="text-muted">لك مسودّةٌ محفوظةٌ على هذا الجهاز {since(draft.at)}.</span>
            <button
              className="btn btn-ghost !px-3 !py-1 !text-[0.82rem] ms-auto"
              onClick={() => { if (body.current) void restoreTool(body.current, draft.snap); }}
            >
              استعِدها
            </button>
            <button
              className="btn btn-ghost !px-3 !py-1 !text-[0.82rem]"
              onClick={() => { void setDraft(slug, null); setDraftState(null); }}
            >
              احذفها
            </button>
          </div>
        )}

        <div ref={body}>
          <ToolErrorBoundary key={resetKey}>{children}</ToolErrorBoundary>
        </div>

        {nextSteps && nextSteps.length > 0 && (
          <div className="rounded-m border border-line bg-surface2 px-5 py-4 print:hidden">
            <p className="text-[0.78rem] font-bold tracking-wide text-primary">والخطوةُ التالية؟</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {nextSteps.map((step) => (
                <button key={step.slug} className="btn btn-ghost !py-1.5" onClick={() => goNext(step)}>
                  {step.label} ←
                </button>
              ))}
            </div>
            {nextSteps.some((s) => s.carry) && (
              <p className="mt-2 text-[0.8rem] text-muted">
                ما أدخلتَه ينتقل معك إلى الأداة التالية — في جهازك وحدَه، لا في الرابط ولا على خادم.
              </p>
            )}
          </div>
        )}
      </section>
    </ToolCtx.Provider>
  );
}
