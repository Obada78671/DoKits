"use client";

import { useCallback, useEffect, useState } from "react";
import { ChipGroup, CopyButton, Field, Note, TextField, ToolLayout } from "@/components/tool-kit";
import { NIL_UUID, inspectUuid, uuidV4, uuidV7 } from "@/tools/dev-lib";

type Ver = "v4" | "v7" | "nil";

const COUNTS = [1, 5, 10, 25];

export default function Uuid() {
  const [ver, setVer] = useState<Ver>("v4");
  const [count, setCount] = useState(5);
  const [upper, setUpper] = useState(false);
  // التوليدُ بعد التركيب فقط — العشوائيُّ والزمنُ لا يُرسمان على الخادم
  const [list, setList] = useState<string[]>([]);
  const [check, setCheck] = useState("");

  const generate = useCallback(() => {
    const make = () => (ver === "nil" ? NIL_UUID : ver === "v7" ? uuidV7(Date.now()) : uuidV4());
    setList(Array.from({ length: ver === "nil" ? 1 : count }, make));
  }, [ver, count]);

  useEffect(() => { generate(); }, [generate]);

  const shown = list.map((u) => (upper ? u.toUpperCase() : u));
  const info = check.trim() ? inspectUuid(check) : null;

  return (
    <ToolLayout>
      <ChipGroup
        label="الإصدار"
        value={ver}
        onChange={setVer}
        hint={
          ver === "v7"
            ? "‏v7: ٤٨ بتّاً من زمن يونكس ثمّ عشوائيّ — يُفرَز زمنيّاً، فهو الأفضلُ مفتاحاً أساسيّاً في القاعدة."
            : ver === "nil"
              ? "المعرّفُ الصفريّ: قيمةٌ تعني «لا معرّف» بلا اللجوء إلى null."
              : "‏v4: عشوائيٌّ بالكامل (١٢٢ بتّاً) — الأشيعُ والأسلم متى لم يهمّك الترتيب."
        }
        options={[{ id: "v4", label: "v4 عشوائيّ" }, { id: "v7", label: "v7 زمنيّ" }, { id: "nil", label: "الصفريّ" }]}
      />

      {ver !== "nil" && (
        <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
          <ChipGroup
            label="العدد"
            value={String(count)}
            onChange={(v) => setCount(Number(v))}
            options={COUNTS.map((c) => ({ id: String(c), label: String(c) }))}
          />
          <button className={`chip ${upper ? "chip-active" : ""}`} onClick={() => setUpper(!upper)}>
            أحرفٌ كبيرة
          </button>
          <button className="btn btn-ghost" onClick={generate}>ولّد غيرَها</button>
        </div>
      )}

      <div className="rounded-m border border-line bg-surface">
        <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
          <span className="text-[0.78rem] font-bold tracking-wide text-primary">
            المعرّفات ({shown.length})
          </span>
          {ver === "v7" && <span className="text-[0.78rem] text-muted">مفروزةٌ زمنيّاً بترتيب توليدها</span>}
          <span className="ms-auto shrink-0">
            <CopyButton value={shown.join("\n")} />
          </span>
        </div>
        <ul className="divide-y divide-line">
          {shown.length === 0 && <li className="px-4 py-3 text-[0.9rem] text-muted">…</li>}
          {shown.map((u) => (
            <li key={u} className="flex items-center gap-2 px-4 py-1.5">
              <span dir="ltr" className="min-w-0 break-all font-mono text-[0.9rem]">{u}</span>
              <span className="ms-auto shrink-0"><CopyButton value={u} /></span>
            </li>
          ))}
        </ul>
      </div>

      <Field label="افحص معرّفاً" htmlFor="u-check" hint="ألصق UUID لتعرف إصدارَه ونمطَه — وزمنَه إن كان v7.">
        <TextField id="u-check" value={check} onChange={setCheck} dir="ltr" mono placeholder="0193a1f0-…" />
      </Field>

      {info && (
        <div className={`rounded-m border px-4 py-3 ${info.valid ? "border-line bg-surface" : "border-line bg-surface2"}`}>
          {info.valid && info.version !== undefined && (
            <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[0.8rem]">
              <span className="rounded-full bg-primary-soft px-2.5 py-1 font-bold text-primary">
                الإصدار {info.version}
              </span>
              <span className="rounded-full border border-line px-2.5 py-1 text-muted">{info.variant}</span>
              {info.timestamp && (
                <span dir="ltr" className="rounded-full border border-line px-2.5 py-1 font-mono text-muted">
                  {info.timestamp}
                </span>
              )}
            </div>
          )}
          <p className="leading-relaxed text-ink">{info.note}</p>
        </div>
      )}

      <Note>
        المعرّفاتُ تُولَّد بـ<code className="font-mono text-[0.85rem]">crypto</code> في متصفّحك ولا يعرفها أحدٌ
        سواك. و<b className="font-semibold text-ink">‏v4 مفتاحاً أساسيّاً يُبعثر فهرسَ القاعدة</b> لأنّ كلَّ إدخالٍ
        يهبط في موضعٍ عشوائيّ؛ أمّا v7 فيُلحِق الجديدَ بآخر الفهرس كالرقم المتسلسل — مع بقاء المعرّف
        غيرَ قابلٍ للتخمين.
      </Note>
    </ToolLayout>
  );
}
