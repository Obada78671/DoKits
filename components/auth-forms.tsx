"use client";

import { useActionState } from "react";
import {
  changePasswordAction, loginAction, registerAction, type FormState,
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
