"use client";

import { useMemo, useState } from "react";
import { Field, NumberField, Note, TextField, ToolLayout } from "@/components/tool-kit";
import { invoiceTotals, money, num, type InvoiceItem } from "@/tools/finance-lib";

let seq = 0;
const blank = (): InvoiceItem => ({ id: `i${++seq}`, desc: "", qty: 1, price: 0 });

export default function Invoice() {
  const [seller, setSeller] = useState("");
  const [buyer, setBuyer] = useState("");
  const [number, setNumber] = useState("1");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [currency, setCurrency] = useState("ل.س");
  const [taxRate, setTaxRate] = useState("0");
  const [discount, setDiscount] = useState("0");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>(() => [blank(), blank()]);

  const patch = (id: string, p: Partial<InvoiceItem>) =>
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...p } : x)));

  const t = useMemo(
    () => invoiceTotals(items, num(taxRate) ?? 0, num(discount) ?? 0),
    [items, taxRate, discount],
  );

  const filled = items.filter((i) => i.desc.trim() || i.qty * i.price > 0);

  return (
    <ToolLayout>
      <div className="print:hidden flex flex-col gap-5">
        <div className="flex flex-wrap gap-3">
          <Field label="الجهةُ البائعة" htmlFor="in-s" className="min-w-48 flex-1">
            <TextField id="in-s" value={seller} onChange={setSeller} placeholder="اسمُ منشأتك" />
          </Field>
          <Field label="الجهةُ المشترية" htmlFor="in-b" className="min-w-48 flex-1">
            <TextField id="in-b" value={buyer} onChange={setBuyer} placeholder="اسمُ العميل" />
          </Field>
        </div>
        <div className="flex flex-wrap gap-3">
          <Field label="رقمُ الفاتورة" htmlFor="in-n" className="min-w-28 flex-1">
            <TextField id="in-n" value={number} onChange={setNumber} dir="ltr" mono />
          </Field>
          <Field label="التاريخ" htmlFor="in-d" className="min-w-36 flex-1">
            <input id="in-d" type="date" dir="ltr" className="field font-mono" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="العملة" htmlFor="in-c" className="min-w-24 flex-1">
            <TextField id="in-c" value={currency} onChange={setCurrency} />
          </Field>
          <Field label="الضريبة ٪" htmlFor="in-t" className="min-w-24 flex-1">
            <NumberField id="in-t" value={taxRate} onChange={setTaxRate} min={0} />
          </Field>
          <Field label="خصم" htmlFor="in-x" className="min-w-24 flex-1">
            <NumberField id="in-x" value={discount} onChange={setDiscount} min={0} />
          </Field>
        </div>

        <div className="rounded-m border border-line bg-surface">
          <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
            <span className="text-[0.78rem] font-bold tracking-wide text-primary">البنود</span>
            <button className="btn btn-ghost ms-auto !px-3 !py-1 !text-[0.82rem]" onClick={() => setItems((xs) => [...xs, blank()])}>
              + بند
            </button>
          </div>
          <ul className="divide-y divide-line">
            {items.map((it) => (
              <li key={it.id} className="flex flex-wrap items-end gap-2.5 px-4 py-3">
                <div className="min-w-40 flex-[3]">
                  <label className="label" htmlFor={`iv-d-${it.id}`}>الوصف</label>
                  <TextField id={`iv-d-${it.id}`} value={it.desc} onChange={(v) => patch(it.id, { desc: v })} />
                </div>
                <div className="min-w-20 flex-1">
                  <label className="label" htmlFor={`iv-q-${it.id}`}>الكمّيّة</label>
                  <NumberField id={`iv-q-${it.id}`} value={it.qty} onChange={(v) => patch(it.id, { qty: Number(v) || 0 })} min={0} />
                </div>
                <div className="min-w-24 flex-1">
                  <label className="label" htmlFor={`iv-p-${it.id}`}>السعر</label>
                  <NumberField id={`iv-p-${it.id}`} value={it.price} onChange={(v) => patch(it.id, { price: Number(v) || 0 })} min={0} />
                </div>
                <div className="min-w-20 shrink-0 pb-2 text-center">
                  <div dir="ltr" className="font-mono tabular-nums">{money(it.qty * it.price)}</div>
                </div>
                <button
                  className="btn btn-ghost !px-2.5 !py-1 text-danger"
                  onClick={() => setItems((xs) => (xs.length > 1 ? xs.filter((x) => x.id !== it.id) : xs))}
                >
                  حذف
                </button>
              </li>
            ))}
          </ul>
        </div>

        <Field label="ملاحظات" htmlFor="in-notes">
          <TextField id="in-notes" value={notes} onChange={setNotes} placeholder="شروطُ الدفع، رقمُ الحساب…" />
        </Field>

        <button className="btn btn-accent self-start" onClick={() => window.print()}>طباعة / حفظ PDF</button>
      </div>

      {/* المعاينةُ هي نفسُها ما يُطبع */}
      <div className="invoice-sheet rounded-m border border-line bg-surface p-6">
        <div className="flex flex-wrap items-start gap-4 border-b border-line pb-4">
          <div className="flex-1">
            <p className="text-[0.75rem] text-muted">من</p>
            <p className="text-lg font-bold">{seller || "—"}</p>
          </div>
          <div className="flex-1">
            <p className="text-[0.75rem] text-muted">إلى</p>
            <p className="text-lg font-bold">{buyer || "—"}</p>
          </div>
          <div className="text-end">
            <p className="text-[0.75rem] text-muted">فاتورة</p>
            <p dir="ltr" className="font-mono font-bold">#{number}</p>
            <p dir="ltr" className="font-mono text-[0.85rem] text-muted">{date}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="mt-4 w-full min-w-[26rem] text-[0.92rem]">
            <thead className="text-[0.75rem] text-muted">
              <tr className="border-b border-line">
                <th className="py-2 text-start font-bold">الوصف</th>
                <th className="py-2 text-start font-bold">الكمّيّة</th>
                <th className="py-2 text-start font-bold">السعر</th>
                <th className="py-2 text-start font-bold">الإجماليّ</th>
              </tr>
            </thead>
            <tbody>
              {filled.length === 0 ? (
                <tr><td colSpan={4} className="py-5 text-center text-muted">لا بنودَ بعد</td></tr>
              ) : filled.map((it) => (
                <tr key={it.id} className="border-b border-line">
                  <td className="py-2">{it.desc || "—"}</td>
                  <td className="py-2 font-mono tabular-nums">{it.qty}</td>
                  <td className="py-2 font-mono tabular-nums">{money(it.price)}</td>
                  <td className="py-2 font-mono tabular-nums">{money(it.qty * it.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="mt-4 ms-auto flex max-w-72 flex-col gap-1.5 text-[0.92rem]">
          <div className="flex justify-between"><dt className="text-muted">المجموع</dt><dd dir="ltr" className="font-mono tabular-nums">{money(t.subtotal)}</dd></div>
          {t.discount > 0 && <div className="flex justify-between"><dt className="text-muted">الخصم</dt><dd dir="ltr" className="font-mono tabular-nums">−{money(t.discount)}</dd></div>}
          {t.tax > 0 && <div className="flex justify-between"><dt className="text-muted">الضريبة</dt><dd dir="ltr" className="font-mono tabular-nums">{money(t.tax)}</dd></div>}
          <div className="mt-1 flex justify-between border-t border-line pt-2 text-lg font-bold">
            <dt>المستحقّ</dt><dd dir="ltr" className="font-mono tabular-nums">{money(t.total)} {currency}</dd>
          </div>
        </dl>

        {notes && <p className="mt-5 border-t border-line pt-3 text-[0.88rem] text-muted">{notes}</p>}
      </div>

      <Note className="print:hidden">
        الطباعةُ تُخفي حقولَ الإدخال وقشرةَ الموقع وتُبقي الورقةَ وحدها — و«حفظ PDF» في نافذة
        الطباعة يعطيك ملفّاً بلا أيّ مكتبةٍ إضافيّة.
      </Note>
    </ToolLayout>
  );
}
