"use client";

import { useActionState, useState } from "react";
import {
  changePasswordAction, issueRecoveryCodesAction, loginAction, recoverAction,
  registerAction, type FormState,
} from "@/lib/actions";

const initial: FormState = {};

function Msg({ state }: { state: FormState }) {
  if (state.error) return <p role="alert" className="form-error">{state.error}</p>;
  if (state.ok) return <p role="status" className="form-ok">{state.ok}</p>;
  return null;
}

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);
  return (
    <form action={action} className="flex flex-col gap-4">
      <Msg state={state} />
      <div>
        <label className="label" htmlFor="identifier">اسم المستخدم أو البريد</label>
        <input id="identifier" name="identifier" className="field" required autoComplete="username" />
      </div>
      <div>
        <label className="label" htmlFor="password">كلمة المرور</label>
        <input id="password" name="password" type="password" className="field" required autoComplete="current-password" />
      </div>
      <button className="btn btn-primary" disabled={pending}>{pending ? "لحظة…" : "دخول"}</button>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initial);
  return (
    <form action={action} className="flex flex-col gap-4">
      <Msg state={state} />
      <div>
        <label className="label" htmlFor="username">اسم المستخدم <span className="font-normal">(لاتينيّ: أحرف وأرقام و_)</span></label>
        <input id="username" name="username" className="field" dir="ltr" required autoComplete="username"
               pattern="[A-Za-z0-9_]{3,32}" />
      </div>
      <div>
        <label className="label" htmlFor="email">البريد الإلكترونيّ</label>
        <input id="email" name="email" type="email" className="field" dir="ltr" required autoComplete="email" />
      </div>
      <div>
        <label className="label" htmlFor="password">كلمة المرور <span className="font-normal">(١٠ محارف فأكثر)</span></label>
        <input id="password" name="password" type="password" className="field" required minLength={10} autoComplete="new-password" />
      </div>
      <div>
        <label className="label" htmlFor="confirm">تأكيد كلمة المرور</label>
        <input id="confirm" name="confirm" type="password" className="field" required autoComplete="new-password" />
      </div>
      <button className="btn btn-accent" disabled={pending}>{pending ? "لحظة…" : "إنشاء الحساب"}</button>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, initial);
  return (
    <form action={action} className="flex flex-col gap-4">
      <Msg state={state} />
      <div>
        <label className="label" htmlFor="current">كلمة المرور الحاليّة</label>
        <input id="current" name="current" type="password" className="field" required autoComplete="current-password" />
      </div>
      <div>
        <label className="label" htmlFor="next">الجديدة</label>
        <input id="next" name="next" type="password" className="field" required minLength={10} autoComplete="new-password" />
      </div>
      <div>
        <label className="label" htmlFor="confirm2">تأكيدها</label>
        <input id="confirm2" name="confirm" type="password" className="field" required autoComplete="new-password" />
      </div>
      <button className="btn btn-primary self-start" disabled={pending}>{pending ? "لحظة…" : "تبديل"}</button>
    </form>
  );
}

export function RecoverForm() {
  const [state, action, pending] = useActionState(recoverAction, initial);
  return (
    <form action={action} className="flex flex-col gap-4">
      <Msg state={state} />
      <div>
        <label className="label" htmlFor="identifier">اسمُ المستخدم أو البريد</label>
        <input id="identifier" name="identifier" className="field" autoComplete="username" required />
      </div>
      <div>
        <label className="label" htmlFor="code">رمزُ الاستعادة</label>
        <input
          id="code" name="code" className="field font-mono" dir="ltr"
          placeholder="ABCDE-FGHJK" autoComplete="off" spellCheck={false} required
        />
        <p className="mt-1.5 text-[0.82rem] text-muted">
          أحدُ الرموز التي حفظتَها من صفحة حسابك. يُستعمل مرّةً واحدةً ثمّ يبطل.
        </p>
      </div>
      <div>
        <label className="label" htmlFor="password">كلمةُ المرور الجديدة</label>
        <input
          id="password" name="password" type="password" className="field"
          autoComplete="new-password" minLength={8} required
        />
      </div>
      <button className="btn btn-primary" disabled={pending}>
        {pending ? "…" : "استعِد الحساب"}
      </button>
      <p className="text-[0.82rem] leading-relaxed text-muted">
        عند النجاح تُنهى كلُّ جلساتك المفتوحة على كلّ الأجهزة — فمن نسي كلمتَه قد يكون فقد جهازاً.
      </p>
    </form>
  );
}

/**
 * توليدُ الرموز يعرضها **مرّةً واحدة**: لا تُخزَّن عندنا إلّا مجزّأة، فلا
 * سبيلَ إلى إظهارها ثانيةً. والزرُّ يطلب تأكيداً لأنّ التوليدَ يُبطل ما قبله.
 */
export function RecoveryCodes({ remaining }: { remaining: number }) {
  const [codes, setCodes] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const issue = async () => {
    setBusy(true);
    setError("");
    const r = await issueRecoveryCodesAction();
    if (r.error) setError(r.error);
    else setCodes(r.codes ?? []);
    setBusy(false);
    setConfirming(false);
  };

  const text = codes ? `Do Kits — رموزُ الاستعادة\n${codes.join("\n")}` : "";

  return (
    <div className="flex flex-col gap-3">
      {error && <p role="alert" className="form-error">{error}</p>}

      {codes ? (
        <>
          <p role="status" className="form-ok">
            احفظها الآن — لن تُعرَض مرّةً أخرى، فنحن لا نخزّنها إلّا مجزّأة.
          </p>
          <ul className="grid grid-cols-2 gap-2 rounded-m border border-line bg-surface2 p-4">
            {codes.map((c) => (
              <li key={c} dir="ltr" className="font-mono text-[0.95rem] tracking-wide text-ink">{c}</li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-ghost" onClick={() => void navigator.clipboard.writeText(text).catch(() => {})}>
              انسخها كلَّها
            </button>
            <a
              className="btn btn-ghost"
              download="dokits-recovery-codes.txt"
              href={`data:text/plain;charset=utf-8,${encodeURIComponent(text)}`}
            >
              نزّلها ملفّاً
            </a>
          </div>
        </>
      ) : (
        <>
          <p className="text-[0.9rem] text-muted">
            {remaining > 0
              ? `لديك ${remaining} ${remaining === 1 ? "رمزاً صالحاً" : "رموزٍ صالحة"}. توليدُ مجموعةٍ جديدةٍ يُبطل القديمة.`
              : "لا رموزَ لديك بعد. ولّدها الآن واحفظها — بها وحدَها تستعيد حسابَك إن نسيتَ كلمةَ المرور."}
          </p>
          {confirming ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[0.9rem] text-ink">تولّد مجموعةً جديدةً وتُبطل القديمة؟</span>
              <button className="btn btn-primary" onClick={() => void issue()} disabled={busy}>
                {busy ? "…" : "نعم، ولّدها"}
              </button>
              <button className="btn btn-ghost" onClick={() => setConfirming(false)}>إلغاء</button>
            </div>
          ) : (
            <button
              className="btn btn-primary self-start"
              onClick={() => (remaining > 0 ? setConfirming(true) : void issue())}
              disabled={busy}
            >
              {busy ? "…" : remaining > 0 ? "ولّد مجموعةً جديدة" : "ولّد رموزَ الاستعادة"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
