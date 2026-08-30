"use client";

/**
 * التقاطُ حالةِ أيّ أداةٍ واستعادتُها — بلا أن تعرف الأداةُ شيئاً عن ذلك.
 *
 * البديلُ كان عقداً تُعلن فيه كلُّ أداةٍ حالتَها، وذلك يعني تعديلَ ثلاثٍ
 * وخمسين أداةً اليوم وكلَّ أداةٍ قادمة، ونسيانَ حقلٍ في إحداها لا يظهر إلّا
 * حين يشكو مستخدم. أمّا هنا فالمصدرُ هو الحقولُ نفسُها في DOM: ما يراه
 * المستخدمُ هو ما يُلتقَط، فلا فجوةَ بين المعلَن والواقع.
 *
 * والاستعادةُ تحاكي المستخدم: القيمُ تُكتب بالضابط الأصليّ ثمّ يُرسَل الحدث،
 * والرقاقاتُ **تُنقَر** نقراً. ولذلك تتحدّث حالةُ React كما لو أنّ يداً فعلت،
 * فلا نحتاج بابَاً خلفيّاً إلى حالة أيّ أداة.
 */

export type ToolSnapshot = {
  /** معرّفُ الحقل ← قيمتُه */
  fields: Record<string, string>;
  /** اسمُ مجموعة الرقاقات ← ترتيبُ المفعَّل منها */
  chips: Record<string, number[]>;
};

type Editable = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

const EDITABLE = "input[id], textarea[id], select[id]";

/** الملفّاتُ لا تُلتقَط ولا تُستعاد: لا يمكن ضبطُها برمجيّاً، ولا ينبغي */
const skip = (el: Editable) =>
  el instanceof HTMLInputElement && (el.type === "file" || el.type === "password");

export function captureTool(root: HTMLElement): ToolSnapshot {
  const fields: Record<string, string> = {};
  for (const el of root.querySelectorAll<Editable>(EDITABLE)) {
    if (skip(el)) continue;
    if (el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio")) {
      fields[el.id] = el.checked ? "1" : "0";
    } else {
      fields[el.id] = el.value;
    }
  }

  const chips: Record<string, number[]> = {};
  for (const group of root.querySelectorAll<HTMLElement>('[role="group"][aria-label]')) {
    const buttons = [...group.querySelectorAll("button")];
    if (!buttons.length) continue;
    const active = buttons
      .map((b, i) => (b.className.includes("chip-active") ? i : -1))
      .filter((i) => i >= 0);
    chips[group.getAttribute("aria-label")!] = active;
  }
  return { fields, chips };
}

export const isEmptySnapshot = (s: ToolSnapshot | null): boolean =>
  !s || (Object.values(s.fields).every((v) => v === "" || v === "0") && Object.keys(s.chips).length === 0);

function setValue(el: Editable, value: string) {
  const proto =
    el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype
      : el instanceof HTMLSelectElement ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

const tick = () => new Promise((r) => setTimeout(r, 0));

/**
 * الرقاقاتُ أوّلاً ثمّ الحقول — وهذا ترتيبٌ لازمٌ لا تفضيل:
 * تبديلُ رقاقةِ نوعٍ يعيد ضبطَ الحقول (كتبديل «الطول» إلى «الكتلة» في محوّل
 * الوحدات)، فلو كُتبت القيمُ أوّلاً لمحاها النقرُ بعدها.
 */
export async function restoreTool(root: HTMLElement, snap: ToolSnapshot): Promise<number> {
  let applied = 0;

  for (const [label, wanted] of Object.entries(snap.chips)) {
    const group = root.querySelector<HTMLElement>(`[role="group"][aria-label="${CSS.escape(label)}"]`);
    if (!group) continue;
    const buttons = [...group.querySelectorAll("button")];
    for (const i of wanted) {
      const b = buttons[i];
      if (b && !b.className.includes("chip-active")) { b.click(); applied++; await tick(); }
    }
  }

  await tick();

  for (const el of root.querySelectorAll<Editable>(EDITABLE)) {
    if (skip(el)) continue;
    const v = snap.fields[el.id];
    if (v === undefined) continue;
    if (el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio")) {
      if (el.checked !== (v === "1")) { el.click(); applied++; }
    } else if (el.value !== v) {
      setValue(el, v);
      applied++;
    }
  }
  return applied;
}

/**
 * نقلُ قيمٍ بين أداتين — بالجلسة لا بالرابط.
 *
 * الرابطُ المحمَّلُ بأرقام المستخدم يدخل تاريخَ المتصفّح وسجلّاتِ الوسطاء
 * وترويسةَ المُحيل، وذلك يخالف وعدَ «لا يغادر جهازك». وsessionStorage يبقى
 * في اللسان وحدَه ويزول بإغلاقه.
 */
const CARRY = "dokits:carry";

export type Carry = { to: string; from: string; fromTitle: string; fields: Record<string, string> };

export function putCarry(c: Carry) {
  try { sessionStorage.setItem(CARRY, JSON.stringify(c)); } catch { /* محظور */ }
}

export function takeCarry(forSlug: string): Carry | null {
  try {
    const raw = sessionStorage.getItem(CARRY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Carry;
    if (c.to !== forSlug) return null;
    sessionStorage.removeItem(CARRY);
    return c;
  } catch { return null; }
}

/** يطبّق قيمَ النقل على حقول الأداة الهدف */
export async function applyCarry(root: HTMLElement, fields: Record<string, string>): Promise<number> {
  return restoreTool(root, { fields, chips: {} });
}
