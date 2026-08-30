"use client";

import { useActionState } from "react";
import { addCategoryAction, type FormState } from "@/lib/actions";

export function AddCategoryForm() {
  const [state, action, pending] = useActionState(addCategoryAction, {} as FormState);
  return (
    <form action={action} className="card flex flex-col gap-3 p-5">
      <h2 className="text-lg font-bold">تصنيف جديد</h2>
      {state.error && <p role="alert" className="form-error">{state.error}</p>}
      {state.ok && <p role="status" className="form-ok">{state.ok}</p>}
      <div className="flex flex-wrap gap-3">
        <div className="min-w-40 flex-1">
          <label className="label" htmlFor="name">الاسم العربيّ</label>
          <input id="name" name="name" className="field" required placeholder="مثال: صوت وصورة" />
        </div>
        <div className="min-w-40 flex-1">
          <label className="label" htmlFor="slug">المعرّف اللاتينيّ</label>
          <input id="slug" name="slug" className="field" dir="ltr" required pattern="[a-z0-9-]{2,32}" placeholder="media" />
        </div>
      </div>
      <button className="btn btn-primary self-start" disabled={pending}>{pending ? "لحظة…" : "إضافة"}</button>
    </form>
  );
}
